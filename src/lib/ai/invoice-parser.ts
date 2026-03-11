import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const ParsedInvoiceSchema = z.object({
  invoice_number: z.string(),
  invoice_date: z.string(),
  supplier_name: z.string(),
  supplier_tax_id: z.string().optional(),
  total_net: z.number(),
  total_vat: z.number(),
  total_gross: z.number(),
  currency: z.string().default("EUR"),
  items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unit: z.string(),
      unit_price: z.number(),
      total_net: z.number(),
      vat_rate: z.number().default(19),
    })
  ),
  confidence: z.number().min(0).max(100),
});

export type ParsedInvoice = z.infer<typeof ParsedInvoiceSchema>;

export async function parseInvoicePDF(
  fileBase64: string,
  mimeType: string = "application/pdf"
): Promise<ParsedInvoice> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Du bist ein Experte für die Analyse von deutschen Baurechnungen.
Extrahiere alle relevanten Daten aus der Rechnung und gib sie als strukturiertes JSON zurück.
Antwort NUR als JSON — kein Markdown, kein Text drumherum.
Setze confidence auf 0-100 basierend auf der Lesbarkeit und Vollständigkeit.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${fileBase64}`,
            },
          },
          {
            type: "text",
            text: "Analysiere diese Rechnung und extrahiere alle Felder als JSON.",
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = JSON.parse(content);
  return ParsedInvoiceSchema.parse(parsed);
}

export async function parseDeliveryNotePDF(
  fileBase64: string,
  mimeType: string = "application/pdf"
) {
  const DeliveryNoteSchema = z.object({
    delivery_number: z.string(),
    delivery_date: z.string(),
    supplier_name: z.string(),
    items: z.array(
      z.object({
        description: z.string(),
        quantity: z.number(),
        unit: z.string(),
        unit_price: z.number().optional(),
      })
    ),
    confidence: z.number().min(0).max(100),
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Du bist ein Experte für die Analyse von deutschen Lieferscheinen im Baugewerbe.
Extrahiere alle relevanten Daten und gib sie als JSON zurück.
Antwort NUR als JSON.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${fileBase64}`,
            },
          },
          {
            type: "text",
            text: "Analysiere diesen Lieferschein und extrahiere alle Felder als JSON.",
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  return DeliveryNoteSchema.parse(JSON.parse(content));
}
