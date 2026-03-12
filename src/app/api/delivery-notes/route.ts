import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getDemoDbUser } from "@/lib/demo-user";
export const dynamic = "force-dynamic";

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
  const id = searchParams.get("id");

  // Single delivery note by ID
  if (id) {
    const deliveryNote = await prisma.deliveryNote.findFirst({
      where: { id, companyId: dbUser.companyId! },
      include: {
        items: true,
        supplier: true,
        project: true,
        attachments: true,
      },
    });

    if (!deliveryNote) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Lieferschein nicht gefunden" } },
        { status: 404 }
      );
    }

    return NextResponse.json(deliveryNote);
  }

  // List
  const projectId = searchParams.get("projectId");
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  const deliveryNotes = await prisma.deliveryNote.findMany({
    where: {
      companyId: dbUser.companyId!,
      ...(projectId ? { projectId } : {}),
      ...(status ? { status } : {}),
      ...(date ? { deliveryDate: new Date(date) } : {}),
    },
    include: {
      supplier: true,
      project: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: deliveryNotes });
}

export async function PATCH(request: NextRequest) {
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

  const formData = await request.formData();
  const deliveryId = formData.get("deliveryId") as string;
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;
  const itemsJson = formData.get("items") as string;

  const deliveryNote = await prisma.deliveryNote.findFirst({
    where: { id: deliveryId, companyId: dbUser.companyId! },
  });

  if (!deliveryNote) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Lieferschein nicht gefunden" } },
      { status: 404 }
    );
  }

  // Update delivery note
  await prisma.deliveryNote.update({
    where: { id: deliveryId },
    data: {
      status,
      notes,
      confirmedById: user.id,
      confirmedAt: new Date(),
    },
  });

  // Update line items
  if (itemsJson) {
    const items = JSON.parse(itemsJson) as Array<{
      id: string;
      quantityDelivered: number;
      status: string;
      deviationNote: string;
    }>;

    for (const item of items) {
      await prisma.deliveryNoteItem.update({
        where: { id: item.id },
        data: {
          quantityDelivered: item.quantityDelivered,
          deviationFlag: item.status === "deviation",
          deviationNote: item.deviationNote || null,
        },
      });
    }
  }

  // Upload photos
  const photos = formData.getAll("photos") as File[];
  for (const photo of photos) {
    const fileName = `delivery-photos/${dbUser.companyId}/${deliveryId}/${Date.now()}-${photo.name}`;
    const buffer = Buffer.from(await photo.arrayBuffer());

    const { data: storageData } = await supabase.storage
      .from("documents")
      .upload(fileName, buffer, { contentType: photo.type });

    if (storageData) {
      const { data: publicUrl } = supabase.storage
        .from("documents")
        .getPublicUrl(storageData.path);

      await prisma.deliveryNoteAttachment.create({
        data: {
          deliveryNoteId: deliveryId,
          fileUrl: publicUrl.publicUrl,
          fileType: photo.type,
          fileName: photo.name,
          uploadedById: user.id,
        },
      });
    }
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      companyId: dbUser.companyId!,
      userId: user.id,
      entityType: "delivery_note",
      entityId: deliveryId,
      action: status === "confirmed" ? "confirmed" : "updated",
      changes: { status, notes },
    },
  });

  return NextResponse.json({ data: { id: deliveryId, status } });
}
