import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateOrderSchema = z.object({
  projectId: z.string().uuid(),
  supplierId: z.string().uuid(),
  requestedDeliveryDate: z.string().nullable().optional(),
  status: z.enum(["draft", "pending_approval"]).default("draft"),
  items: z.array(
    z.object({
      productId: z.string().optional(),
      description: z.string().optional(),
      quantity: z.number().positive(),
      unit: z.string(),
      unitPrice: z.number().min(0),
    })
  ),
});

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

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Benutzer nicht gefunden" } },
      { status: 404 }
    );
  }

  const { searchParams } = request.nextUrl;

  // Return form metadata for new order page
  if (searchParams.get("meta") === "form") {
    const [projects, suppliers, products] = await Promise.all([
      prisma.project.findMany({
        where: { companyId: dbUser.companyId, status: "active" },
        select: { id: true, name: true },
      }),
      prisma.supplier.findMany({
        where: { companyId: dbUser.companyId, isActive: true },
        select: { id: true, name: true },
      }),
      prisma.product.findMany({
        where: { companyId: dbUser.companyId, isActive: true },
        select: { id: true, name: true, unit: true, unitPrice: true },
      }),
    ]);

    return NextResponse.json({ projects, suppliers, products });
  }

  // List purchase orders
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");

  const orders = await prisma.purchaseOrder.findMany({
    where: {
      companyId: dbUser.companyId,
      ...(status ? { status } : {}),
      ...(projectId ? { projectId } : {}),
    },
    include: {
      supplier: true,
      project: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: orders });
}

export async function POST(request: NextRequest) {
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

  const body = await request.json();
  const parsed = CreateOrderSchema.safeParse(body);

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

  const { projectId, supplierId, requestedDeliveryDate, status, items } =
    parsed.data;

  // Generate order number: PO-YYYYMMDD-XXXX
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.purchaseOrder.count({
    where: { companyId: dbUser.companyId },
  });
  const orderNumber = `PO-${today}-${String(count + 1).padStart(4, "0")}`;

  // Calculate totals
  const totalNet = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const totalVat = totalNet * 0.19;
  const totalGross = totalNet + totalVat;

  const order = await prisma.purchaseOrder.create({
    data: {
      companyId: dbUser.companyId,
      projectId,
      supplierId,
      orderNumber,
      status,
      createdById: user.id,
      requestedDeliveryDate: requestedDeliveryDate
        ? new Date(requestedDeliveryDate)
        : null,
      totalNet,
      totalVat,
      totalGross,
      items: {
        create: items.map((item) => ({
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalNet: item.quantity * item.unitPrice,
        })),
      },
    },
    include: { items: true },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      companyId: dbUser.companyId,
      userId: user.id,
      entityType: "purchase_order",
      entityId: order.id,
      action: "created",
      changes: { status, orderNumber },
    },
  });

  return NextResponse.json({ data: order }, { status: 201 });
}
