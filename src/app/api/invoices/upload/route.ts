import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/inngest/client";
import { getDemoDbUser } from "@/lib/demo-user";
export const dynamic = "force-dynamic";

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

  const dbUser = user.id === "demo-user-id" ? getDemoDbUser(user.email) : await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Benutzer nicht gefunden" } },
      { status: 404 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Keine Datei hochgeladen" } },
      { status: 400 }
    );
  }

  // Upload to Supabase Storage
  const fileName = `invoices/${dbUser.companyId}/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data: storageData, error: storageError } = await supabase.storage
    .from("documents")
    .upload(fileName, buffer, {
      contentType: file.type,
    });

  if (storageError && typeof storageError === 'object' && 'message' in storageError) {
    return NextResponse.json(
      { error: { code: "UPLOAD_ERROR", message: (storageError as { message: string }).message } },
      { status: 500 }
    );
  }

  const { data: publicUrl } = supabase.storage
    .from("documents")
    .getPublicUrl(storageData.path);

  // Create invoice record
  const invoice = await prisma.invoice.create({
    data: {
      companyId: dbUser.companyId!,
      status: "received",
      invoiceDate: new Date(),
      totalNet: 0,
      totalVat: 0,
      totalGross: 0,
      fileUrl: publicUrl.publicUrl,
    },
  });

  // Send to Inngest for OCR processing
  const fileBase64 = buffer.toString("base64");
  await inngest.send({
    name: "invoice/uploaded",
    data: {
      invoiceId: invoice.id,
      fileBase64,
      mimeType: file.type,
    },
  });

  return NextResponse.json({
    data: { id: invoice.id, status: "processing" },
  });
}
