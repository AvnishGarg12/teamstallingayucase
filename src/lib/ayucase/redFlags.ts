import type { RedFlag } from "./types";

interface Rule {
  id: string;
  label: string;
  detail: string;
  severity: "urgent" | "caution";
  patterns: RegExp[];
}

/**
 * Deterministic, rule-based safety net. This is NOT a diagnosis:
 * it only highlights wording that hospital staff should look at now.
 */
export const RED_FLAG_RULES: Rule[] = [
  {
    id: "chest-pain",
    label: "Severe chest pain or tightness",
    detail: "Patient described chest pain, pressure or tightness.",
    severity: "urgent",
    patterns: [/chest (pain|tightness|pressure|heaviness)/i, /pain in (the )?chest/i, /सीने/i],
  },
  {
    id: "breathing",
    label: "Difficulty breathing",
    detail: "Patient reported breathlessness or trouble breathing.",
    severity: "urgent",
    patterns: [
      /(short(ness)? of breath|breathless|trouble breathing|can'?t breathe|gasping|suffocat)/i,
      /सांस/i,
    ],
  },
  {
    id: "stroke",
    label: "Stroke-like symptoms",
    detail: "Face drooping, one-sided weakness or slurred speech mentioned.",
    severity: "urgent",
    patterns: [
      /(face droop|slurred speech|one side.*(weak|numb)|paralysis|cannot move (my )?(arm|leg))/i,
    ],
  },
  {
    id: "fainting",
    label: "Fainting or loss of consciousness",
    detail: "Patient mentioned fainting, blackout or collapse.",
    severity: "urgent",
    patterns: [/(faint|blackout|black out|passed out|unconscious|collapse)/i],
  },
  {
    id: "bleeding",
    label: "Severe bleeding",
    detail: "Heavy or uncontrolled bleeding mentioned.",
    severity: "urgent",
    patterns: [/(severe bleeding|heavy bleeding|bleeding a lot|vomiting blood|blood in stool)/i],
  },
  {
    id: "confusion",
    label: "New confusion",
    detail: "Sudden confusion or disorientation mentioned.",
    severity: "urgent",
    patterns: [/(confus|disorient|not making sense|cannot recognise|cannot recognize)/i],
  },
  {
    id: "seizure",
    label: "Seizure / fits",
    detail: "Seizure, convulsion or fits mentioned.",
    severity: "urgent",
    patterns: [/(seizure|convulsion|fits|jerking)/i],
  },
  {
    id: "self-harm",
    label: "Thoughts of self-harm",
    detail: "Patient mentioned suicidal thoughts or self-harm.",
    severity: "urgent",
    patterns: [/(suicid|end my life|harm myself|kill myself)/i],
  },
  {
    id: "infant-fever",
    label: "Very high fever in an infant",
    detail: "High fever reported in a baby or infant.",
    severity: "urgent",
    patterns: [/(infant|baby|newborn).{0,40}(high fever|10[3-6]|40 ?degree)/i],
  },
  {
    id: "severe-pain",
    label: "Very high pain score",
    detail: "Pain rated 9 or 10 out of 10.",
    severity: "caution",
    patterns: [/^(9|10)$/],
  },
];

export function detectRedFlags(text: string, source: string): RedFlag[] {
  const value = String(text ?? "").trim();
  if (!value) return [];
  const now = new Date().toISOString();
  return RED_FLAG_RULES.filter((rule) => rule.patterns.some((p) => p.test(value))).map((rule) => ({
    id: rule.id,
    label: rule.label,
    detail: rule.detail,
    source,
    severity: rule.severity,
    detectedAt: now,
  }));
}
