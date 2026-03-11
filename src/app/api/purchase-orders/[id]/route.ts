import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PatchOrderSchema = z.object({
  status: z
    .enum(["draft", "pending_approval", "approved", "sent", "delivered"])
    .optional(),
  requestedDeliveryDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  approvedById: z.string().uuid().optional(),
});

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  return dbUser;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbUser = await getAuthUser();
  if (!dbUser) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Nicht angemeldet" } },
      { status: 401 }
    );
  }

  const { id } = await params;

  const order = await prisma.purchaseOrder.findFirst({
    where: { id, companyId: dbUser.companyId },
    include: {
      supplier: true,
      project: true,
      createdBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
      deliveryNotes: {
        include: { items: true },
        orderBy: { deliveryDate: "desc" },
      },
      invoiceLinks: {
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              totalGross: true,
              threeWayMatchStatus: true,
              matchConfidence: true,
            },
          },
          deliveryNote: {
            select: { id: true, deliveryNumber: true, status: true },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Bestellung nicht gefunden" } },
      { status: 404 }
    );
  }

  // Aggregate 3-way match status across all linked invoices
  const matchStatuses = order.invoiceLinks.map(
    (link) => link.invoice.threeWayMatchStatus
  );
  const threeWayMatchSummary = {
    total: matchStatuses.length,
    matched: matchStatuses.filter((s) => s === "matched").length,
    warning: matchStatuses.filter((s) => s === "warning").length,
    deviation: matchStatuses.filter((s) => s === "deviation").length,
    overallStatus:
      matchStatuses.length === 0
        ? "pending"
        : matchStatuses.every((s) => s === "matched")
          ? "matched"
          : matchStatuses.some((s) => s === "deviation")
            ? "deviation"
            : "warning",
  };

  return NextResponse.json({ data: { ...order, threeWayMatchSummary } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbUser = await getAuthUser();
  if (!dbUser) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Nicht angemeldet" } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = PatchOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Ungültige Eingabe",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  const existing = await prisma.purchaseOrder.findFirst({
    where: { id, companyId: dbUser.companyId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Bestellung nicht gefunden" } },
      { status: 404 }
    );
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status) updateData.status = parsed.data.status;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.requestedDeliveryDate !== undefined) {
    updateData.requestedDeliveryDate = parsed.data.requestedDeliveryDate
      ? new Date(parsed.data.requestedDeliveryDate)
      : null;
  }
  if (parsed.data.status === "approved") {
    updateData.approvedById = dbUser.id;
  }

  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: updateData,
    include: { items: true, supplier: true, project: true },
  });

  await prisma.auditLog.create({
    data: {
      companyId: dbUser.companyId,
      userId: dbUser.id,
      entityType: "purchase_order",
      entityId: id,
      action: "updated",
      changes: parsed.data,
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbUser = await getAuthUser();
  if (!dbUser) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Nicht angemeldet" } },
      { status: 401 }
    );
  }

  const { id } = await params;

  const existing = await prisma.purchaseOrder.findFirst({
    where: { id, companyId: dbUser.companyId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Bestellung nicht gefunden" } },
      { status: 404 }
    );
  }

  if (existing.status !== "draft") {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Nur Entwürfe können gelöscht werden",
        },
      },
      { status: 403 }
    );
  }

  await prisma.purchaseOrder.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      companyId: dbUser.companyId,
      userId: dbUser.id,
      entityType: "purchase_order",
      entityId: id,
      action: "deleted",
      changes: { orderNumber: existing.orderNumber },
    },
  });

  return NextResponse.json({ data: { deleted: true } });
}
