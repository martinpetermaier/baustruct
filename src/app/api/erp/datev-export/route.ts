import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getDemoDbUser } from "@/lib/demo-user";
export const dynamic = "force-dynamic";

// DATEV CSV header row
const DATEV_HEADER = [
  "Umsatz (ohne Soll/Haben-Kz)",
  "Soll/Haben-Kennzeichen",
  "WKZ Umsatz",
  "Kurs",
  "Basis-Umsatz",
  "WKZ Basis-Umsatz",
  "Konto",
  "Gegenkonto (ohne BU-Schlüssel)",
  "BU-Schlüssel",
  "Belegdatum",
  "Belegfeld 1",
  "Belegfeld 2",
  "Skonto",
  "Buchungstext",
].join(";");

// Default DATEV account codes for construction procurement
const KONTO_ROHSTOFFE = "3400"; // Rohstoffe/Baustoffe
const KONTO_TRANSPORT = "4600"; // Transportkosten
const GEGENKONTO_KREDITOREN = "1600"; // Kreditoren

function formatDateDATEV(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}${month}`;
}

function formatDecimalDATEV(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function isTransportItem(description: string): boolean {
  const keywords = [
    "transport",
    "fracht",
    "lieferung",
    "anfahrt",
    "spedition",
  ];
  return keywords.some((k) => description.toLowerCase().includes(k));
}

function escapeCSVField(value: string): string {
  if (value.includes(";") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Nicht angemeldet" } },
      { status: 401 }
    );
  }

  const dbUser = user.id === "demo-user-id" ? getDemoDbUser(user.email) : await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Benutzer nicht gefunden" } },
      { status: 404 }
    );
  }

  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Fetch approved invoices that haven't been exported yet
  const invoices = await prisma.invoice.findMany({
    where: {
      companyId: dbUser.companyId!,
      status: "approved",
      erpExportedAt: null,
      ...(from || to
        ? {
            invoiceDate: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      supplier: true,
      items: true,
    },
    orderBy: { invoiceDate: "asc" },
  });

  if (invoices.length === 0) {
    return NextResponse.json(
      {
        error: {
          code: "NO_DATA",
          message: "Keine freigegebenen Rechnungen zum Exportieren",
        },
      },
      { status: 404 }
    );
  }

  // Build CSV rows
  const rows: string[] = [DATEV_HEADER];

  for (const invoice of invoices) {
    for (const item of invoice.items) {
      const lineTotal = Number(item.totalNet ?? 0);
      if (lineTotal === 0) continue;

      const konto = isTransportItem(item.description)
        ? KONTO_TRANSPORT
        : KONTO_ROHSTOFFE;

      const row = [
        formatDecimalDATEV(Math.abs(lineTotal)), // Umsatz
        lineTotal >= 0 ? "S" : "H", // Soll/Haben
        invoice.currency, // WKZ Umsatz
        "", // Kurs
        "", // Basis-Umsatz
        "", // WKZ Basis-Umsatz
        konto, // Konto
        GEGENKONTO_KREDITOREN, // Gegenkonto
        "", // BU-Schlüssel
        formatDateDATEV(invoice.invoiceDate), // Belegdatum
        invoice.invoiceNumber ?? "", // Belegfeld 1
        invoice.supplier?.name ?? "", // Belegfeld 2
        invoice.skontoAmount
          ? formatDecimalDATEV(Number(invoice.skontoAmount))
          : "", // Skonto
        escapeCSVField(item.description), // Buchungstext
      ].join(";");

      rows.push(row);
    }
  }

  const csv = rows.join("\r\n");

  // Mark invoices as exported
  const invoiceIds = invoices.map((inv) => inv.id);
  await prisma.invoice.updateMany({
    where: { id: { in: invoiceIds } },
    data: { erpExportedAt: new Date() },
  });

  // Audit log for export
  await prisma.auditLog.create({
    data: {
      companyId: dbUser.companyId!,
      userId: dbUser.id,
      entityType: "datev_export",
      entityId: dbUser.companyId ?? "demo",
      action: "exported",
      changes: {
        invoiceCount: invoices.length,
        invoiceIds,
      },
    },
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="DATEV_Export_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
