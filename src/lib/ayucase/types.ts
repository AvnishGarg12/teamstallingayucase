export type LanguageCode = "en" | "hi" | "mr" | "ta" | "bn";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  native: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
];

export type SectionId =
  | "presenting"
  | "history"
  | "surgeries"
  | "medicines"
  | "family"
  | "lifestyle"
  | "womens"
  | "ayurveda";

export interface SectionMeta {
  id: SectionId;
  title: string;
  hint: string;
  optional?: boolean;
}

export const SECTIONS: SectionMeta[] = [
  { id: "presenting", title: "Current problem", hint: "What you are feeling now" },
  { id: "history", title: "Past illnesses", hint: "Old health problems, hospital stays" },
  { id: "surgeries", title: "Past surgeries", hint: "Any operations" },
  { id: "medicines", title: "Medicines & allergies", hint: "What you take, what harms you" },
  { id: "family", title: "Family history", hint: "Health of close family" },
  { id: "lifestyle", title: "Daily life", hint: "Food, sleep, habits" },
  { id: "womens", title: "Women's health", hint: "Only if it applies to you", optional: true },
  { id: "ayurveda", title: "Ayurveda details", hint: "Optional AYUSH section", optional: true },
];

export type AnswerValue = string | string[] | number;

export interface Answer {
  questionId: string;
  section: SectionId;
  question: string;
  value: AnswerValue;
  skipped?: boolean;
  answeredAt: string;
}

export interface PatientProfile {
  name: string;
  age: string;
  gender: "female" | "male" | "other" | "";
  mobile: string;
  city: string;
  abhaId?: string;
  emergencyContact?: string;
}

export type Confidence = "High" | "Medium" | "Needs Review";

export interface ExtractedField {
  label: string;
  value: string;
  confidence: Confidence;
}

export type DocumentKind = "Prescription" | "Lab report" | "Discharge summary";

export interface MedicalDocument {
  id: string;
  fileName: string;
  kind: DocumentKind;
  documentDate: string;
  facility: string;
  status: "processing" | "extracted";
  fields: ExtractedField[];
  /** Local preview of the captured photo. Not persisted across reloads. */
  previewUrl?: string;
  /** Path of the photo in the shared document store, visible to clinic staff. */
  storagePath?: string;
}

export interface RedFlag {
  id: string;
  label: string;
  detail: string;
  source: string;
  severity: "urgent" | "caution";
  detectedAt: string;
}

export interface SummaryItem {
  label: string;
  value: string;
  source: string;
  flagged?: boolean;
}

export interface CaseRecord {
  id: string;
  profile: PatientProfile;
  language: LanguageCode;
  consentGiven: boolean;
  answers: Answer[];
  documents: MedicalDocument[];
  redFlags: RedFlag[];
  status: "in-progress" | "submitted" | "approved" | "rejected";
  createdAt: string;
  queueTime?: string;
  doctorNote?: string;
}
