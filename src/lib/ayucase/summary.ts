import type { CaseRecord, SummaryItem } from "./types";

function ans(record: CaseRecord, id: string): string | null {
  const a = record.answers.find((x) => x.questionId === id);
  if (!a || a.skipped) return null;
  return String(a.value);
}

function joinAnswers(record: CaseRecord, ids: string[]): string | null {
  const parts = ids.map((id) => ans(record, id)).filter(Boolean) as string[];
  return parts.length ? parts.join("; ") : null;
}

export function buildDoctorSummary(record: CaseRecord): SummaryItem[] {
  const items: SummaryItem[] = [];
  const push = (label: string, value: string | null, source: string, flagged = false) => {
    if (value) items.push({ label, value, source, flagged });
  };

  push("Chief complaint", ans(record, "chief-complaint"), "Patient interview", record.redFlags.length > 0);
  push(
    "Onset & course",
    joinAnswers(record, ["onset", "trend"]),
    "Patient interview",
  );
  push("Site", ans(record, "location"), "Patient interview");
  const severity = ans(record, "severity");
  push("Patient-reported severity", severity ? `${severity} / 10` : null, "Patient interview");

  const followUps = record.answers
    .filter((a) => a.questionId.startsWith("fu-") && !a.skipped)
    .map((a) => `${a.question} → ${a.value}`);
  if (followUps.length)
    items.push({
      label: "Additional symptom details",
      value: followUps.join(" | "),
      source: "Patient interview — adaptive follow-up",
      flagged: record.redFlags.length > 0,
    });

  push("Past medical history", joinAnswers(record, ["past-illness", "hospitalisation"]), "Patient interview");
  push("Past surgical history", ans(record, "surgery"), "Patient interview");
  push("Current medicines", joinAnswers(record, ["medicines", "dosage"]), "Patient interview");
  push("Allergies", ans(record, "allergies"), "Patient interview", /sulpha|penicill/i.test(ans(record, "allergies") ?? ""));
  push("Family history", ans(record, "family"), "Patient interview");
  push(
    "Lifestyle",
    joinAnswers(record, ["smoking", "alcohol", "diet", "sleep", "activity"]),
    "Patient interview",
  );
  push(
    "Obstetric & menstrual history",
    joinAnswers(record, ["menstrual", "pregnancy", "obstetric"]),
    "Patient interview",
  );
  push(
    "Ayurveda (optional section)",
    joinAnswers(record, ["prakriti", "agni", "bowel", "ayush-treatment"]),
    "Patient interview — AYUSH section",
  );

  for (const doc of record.documents) {
    const highlights = doc.fields
      .filter((f) => f.label !== "Document date")
      .map((f) => `${f.label}: ${f.value} (${f.confidence})`)
      .join("; ");
    if (highlights)
      items.push({
        label: `${doc.kind} findings`,
        value: highlights,
        source: `${doc.kind} uploaded on ${doc.documentDate}`,
      });
  }

  return items;
}
