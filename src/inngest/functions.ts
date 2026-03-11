import { inngest } from "./client";
import { prisma } from "@/lib/prisma";
import { parseInvoicePDF } from "@/lib/ai/invoice-parser";
import { computeThreeWayMatch } from "@/lib/ai/three-way-match";

// ─── OCR: Parse uploaded invoice PDF ────────────────────────

export const processInvoiceOCR = inngest.createFunction(
  { id: "invoice-ocr-process", name: "Process Invoice OCR" },
  { event: "invoice/uploaded" },
  async ({ event }) => {
    const { invoiceId, fileBase64, mimeType } = event.data as {
      invoiceId: string;
      fileBase64: string;
      mimeType: string;
    };

    // Update status to processing
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "ai_processing" },
    });

    // Run OCR via GPT-4o
    const parsed = await parseInvoicePDF(fileBase64, mimeType);

    // Try to find supplier by name
    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
    });

    const supplier = await prisma.supplier.findFirst({
      where: {
        companyId: invoice.companyId,
        name: { contains: parsed.supplier_name, mode: "insensitive" },
      },
    });

    // Update invoice with parsed data
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        invoiceNumber: parsed.invoice_number,
        invoiceDate: new Date(parsed.invoice_date),
        totalNet: parsed.total_net,
        totalVat: parsed.total_vat,
        totalGross: parsed.total_gross,
        rawText: JSON.stringify(parsed),
        aiParsedAt: new Date(),
        status: "ready_to_book",
        ...(supplier ? { supplierId: supplier.id } : {}),
        // Calculate skonto if supplier has terms
        ...(supplier?.skontoDays && supplier?.skontoPercent
          ? {
              skontoDeadline: new Date(
                new Date(parsed.invoice_date).getTime() +
                  Number(supplier.skontoDays) * 24 * 60 * 60 * 1000
              ),
              skontoAmount:
                parsed.total_gross *
                (Number(supplier.skontoPercent) / 100),
            }
          : {}),
      },
    });

    // Create line items
    await prisma.invoiceItem.createMany({
      data: parsed.items.map((item) => ({
        invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unit_price,
        totalNet: item.total_net,
        vatRate: item.vat_rate,
      })),
    });

    // Increment company document count
    await prisma.company.update({
      where: { id: invoice.companyId },
      data: { documentCountMonth: { increment: 1 } },
    });

    // Trigger 3-way match
    await inngest.send({
      name: "invoice/match",
      data: { invoiceId },
    });

    return { status: "parsed", invoiceId, confidence: parsed.confidence };
  }
);

// ─── 3-Way Match ────────────────────────────────────────────

export const runThreeWayMatch = inngest.createFunction(
  { id: "invoice-three-way-match", name: "Invoice 3-Way Match" },
  { event: "invoice/match" },
  async ({ event }) => {
    const { invoiceId } = event.data as { invoiceId: string };

    const invoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      include: {
        items: true,
        supplier: true,
      },
    });

    if (!invoice.supplierId) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          threeWayMatchStatus: "deviation",
          matchConfidence: 0,
        },
      });
      return { status: "no_supplier" };
    }

    // Find POs from same supplier with similar timeframe
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        companyId: invoice.companyId,
        supplierId: invoice.supplierId,
        status: { in: ["approved", "sent", "delivered"] },
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Find delivery notes
    const deliveryNotes = await prisma.deliveryNote.findMany({
      where: {
        companyId: invoice.companyId,
        supplierId: invoice.supplierId,
        status: "confirmed",
      },
      include: { items: true },
      orderBy: { deliveryDate: "desc" },
      take: 10,
    });

    // Flatten PO + DN items for matching
    const allPOItems = purchaseOrders.flatMap((po) => po.items);
    const allDNItems = deliveryNotes.flatMap((dn) => dn.items);

    const matchResult = computeThreeWayMatch(
      allPOItems,
      allDNItems,
      invoice.items
    );

    // Update invoice
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        threeWayMatchStatus: matchResult.overallStatus,
        matchConfidence: matchResult.confidence,
        status:
          matchResult.overallStatus === "matched"
            ? "ready_to_book"
            : "received",
      },
    });

    // Create links to matched POs
    const matchedPOIds = [
      ...new Set(
        matchResult.lines
          .filter((l) => l.poItemId)
          .map((l) => {
            const poItem = allPOItems.find((pi) => pi.id === l.poItemId);
            return poItem?.purchaseOrderId;
          })
          .filter(Boolean)
      ),
    ];

    for (const poId of matchedPOIds) {
      if (!poId) continue;
      const relatedDN = deliveryNotes.find(
        (dn) => dn.purchaseOrderId === poId
      );

      await prisma.invoicePurchaseOrderLink.upsert({
        where: {
          invoiceId_purchaseOrderId: {
            invoiceId,
            purchaseOrderId: poId,
          },
        },
        create: {
          invoiceId,
          purchaseOrderId: poId,
          deliveryNoteId: relatedDN?.id ?? null,
          matchedBy: "ai",
        },
        update: {
          matchedBy: "ai",
        },
      });
    }

    return { status: matchResult.overallStatus, confidence: matchResult.confidence };
  }
);

// Export all functions for Inngest serve
export const functions = [processInvoiceOCR, runThreeWayMatch];
