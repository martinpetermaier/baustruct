import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { getDemoDbUser } from "@/lib/demo-user";
export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  // Only buchhaltung and admin can approve invoices
  if (!["buchhaltung", "admin"].includes(dbUser.role)) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Nur Buchhaltung oder Admin können Rechnungen freigeben",
        },
      },
      { status: 403 }
    );
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, companyId: dbUser.companyId! },
  });

  if (!invoice) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Rechnung nicht gefunden" } },
      { status: 404 }
    );
  }

  if (invoice.status === "booked") {
    return NextResponse.json(
      {
        error: {
          code: "CONFLICT",
          message: "Rechnung wurde bereits gebucht",
        },
      },
      { status: 409 }
    );
  }

  // Update invoice status to approved (ready_to_book)
  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: "approved" },
  });

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      companyId: dbUser.companyId!,
      userId: dbUser.id,
      entityType: "invoice",
      entityId: id,
      action: "approved",
      changes: {
        previousStatus: invoice.status,
        newStatus: "approved",
        approvedBy: dbUser.name,
      },
    },
  });

  // Trigger DATEV export Inngest job
  await inngest.send({
    name: "invoice/approved",
    data: {
      invoiceId: id,
      companyId: dbUser.companyId!,
      approvedBy: dbUser.id,
    },
  });

  return NextResponse.json({
    data: {
      id: updated.id,
      status: updated.status,
      message: "Rechnung freigegeben — DATEV-Export wird vorbereitet",
    },
  });
}
