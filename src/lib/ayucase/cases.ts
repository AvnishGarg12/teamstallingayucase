import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { CaseRecord, LanguageCode, MedicalDocument } from "./types";

interface CaseRow {
  id: string;
  profile: CaseRecord["profile"];
  language: string;
  answers: CaseRecord["answers"];
  documents: MedicalDocument[];
  red_flags: CaseRecord["redFlags"];
  status: string;
  queue_time: string | null;
  created_at: string;
  doctor_note: string;
}

function toRecord(row: CaseRow): CaseRecord {
  return {
    id: row.id,
    profile: row.profile,
    language: row.language as LanguageCode,
    consentGiven: true,
    answers: row.answers ?? [],
    documents: row.documents ?? [],
    redFlags: row.red_flags ?? [],
    status: row.status as CaseRecord["status"],
    createdAt: row.created_at,
    ...(row.queue_time ? { queueTime: row.queue_time } : {}),
    doctorNote: row.doctor_note ?? "",
  };
}

/** Local blob previews stay on the kiosk; shared photos travel as storage paths. */
function stripPreviews(documents: MedicalDocument[]) {
  return documents.map(({ previewUrl: _preview, ...rest }) => rest);
}

export async function pushCase(record: CaseRecord) {
  const { error } = await supabase.from("cases").upsert(
    {
      id: record.id,
      profile: record.profile as unknown as Json,
      language: record.language,
      answers: record.answers as unknown as Json,
      documents: stripPreviews(record.documents) as unknown as Json,
      red_flags: record.redFlags as unknown as Json,
      status: record.status,
      queue_time: record.queueTime ?? null,
      doctor_note: record.doctorNote ?? "",
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function pushCaseNote(id: string, note: string) {
  const { error } = await supabase.from("cases").update({ doctor_note: note }).eq("id", id);
  if (error) throw error;
}

export async function fetchCases(): Promise<CaseRecord[]> {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as CaseRow[]).map(toRecord);
}

export async function pushCaseStatus(id: string, status: CaseRecord["status"]) {
  const { error } = await supabase.from("cases").update({ status }).eq("id", id);
  if (error) throw error;
}
