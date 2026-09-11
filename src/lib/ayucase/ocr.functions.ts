import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  kind: z.enum(["Prescription", "Lab report", "Discharge summary"]),
  dataUrl: z.string().min(32),
});

const FieldSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    label: { type: "string" },
    value: { type: "string" },
    confidence: { type: "string", enum: ["High", "Medium", "Needs Review"] },
  },
  required: ["label", "value", "confidence"],
} as const;

export interface OcrField {
  label: string;
  value: string;
  confidence: "High" | "Medium" | "Needs Review";
}

const HINTS: Record<string, string> = {
  Prescription:
    "Extract: Document date, Doctor / clinic, each medicine with dose and frequency (label them Medicine 1, Medicine 2, ...), and Advice.",
  "Lab report":
    "Extract: Document date, Laboratory, and each test result with its value and unit (use the test name as the label).",
  "Discharge summary":
    "Extract: Document date, Hospital, Reason for admission, Procedure done, Discharge advice.",
};

/** Reads a photographed medical document with Lovable AI and returns labelled fields. */
export const extractDocumentFields = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<{ fields: OcrField[]; error?: string }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { fields: [], error: "AI is not configured." };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          {
            role: "system",
            content:
              "You read photographed Indian medical documents. Transcribe only what is visible — never invent values. " +
              "Use confidence High when the text is clearly legible, Medium when partly unclear, and Needs Review when you had to guess. " +
              "If a detail is absent, use the value 'Not mentioned' with confidence 'Needs Review'. Return 4-10 fields.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `This is a ${data.kind}. ${HINTS[data.kind] ?? ""}`,
              },
              { type: "image_url", image_url: { url: data.dataUrl } },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "document_fields",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: { fields: { type: "array", items: FieldSchema } },
              required: ["fields"],
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("AI OCR failed", res.status, body);
      if (res.status === 429) return { fields: [], error: "Too many documents at once. Please try again in a moment." };
      if (res.status === 402) return { fields: [], error: "AI credits are exhausted. Ask the clinic admin to top up." };
      return { fields: [], error: "Could not read this document automatically." };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return { fields: [], error: "Could not read this document automatically." };

    try {
      const parsed = z
        .object({
          fields: z.array(
            z.object({
              label: z.string(),
              value: z.string(),
              confidence: z.enum(["High", "Medium", "Needs Review"]),
            }),
          ),
        })
        .parse(JSON.parse(content));
      if (!parsed.fields.length) return { fields: [], error: "No readable details found in this photo." };
      return { fields: parsed.fields };
    } catch {
      return { fields: [], error: "Could not read this document automatically." };
    }
  });
