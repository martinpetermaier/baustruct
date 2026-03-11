import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(
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

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Benutzer nicht gefunden" } },
      { status: 404 }
    );
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, companyId: dbUser.companyId },
    include: {
      supplier: true,
      items: {
        include: {
          deliveryNoteItem: {
            include: {
              deliveryNote: {
                select: {
                  id: true,
                  deliveryNumber: true,
                  deliveryDate: true,
                  status: true,
                },
              },
            },
          },
        },
      },
      orderLinks: {
        include: {
          purchaseOrder: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalGross: true,
              supplier: { select: { name: true } },
            },
          },
          deliveryNote: {
            select: {
              id: true,
              deliveryNumber: true,
              deliveryDate: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Rechnung nicht gefunden" } },
      { status: 404 }
    );
  }

  // Compute match status summary
  const matchStatus = {
    status: invoice.threeWayMatchStatus ?? "pending",
    confidence: invoice.matchConfidence ? Number(invoice.matchConfidence) : null,
    linkedPOs: invoice.orderLinks.length,
    linkedDNs: invoice.orderLinks.filter((l) => l.deliveryNote).length,
  };

  return NextResponse.json({ data: { ...invoice, matchStatus } });
}
