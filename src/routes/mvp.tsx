import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  AudioLines,
  BarChart3,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileHeart,
  Fingerprint,
  GitCompareArrows,
  Hospital,
  Languages,
  MapPinned,
  Mic,
  Pill,
  QrCode,
  ScanLine,
  Search,
  ShieldCheck,
  Siren,
  Stethoscope,
  UserRound,
  Users,
  WandSparkles,
} from "lucide-react";
import { AppHeader, ClinicalDisclaimer } from "@/components/ayucase/Brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAyu } from "@/lib/ayucase/store";
import { DEMO_CASES } from "@/lib/ayucase/demoData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mvp")({
  head: () => ({
    meta: [
      { title: "Advanced MVP demo — AyuCase" },
      {
        name: "description",
        content:
          "AyuCase advanced MVP demonstration: AI OCR, FAST CASE, continuity, voice-to-case and clinical preparation.",
      },
    ],
  }),
  component: AdvancedMvp,
});

type FeatureId =
  | "ocr"
  | "completeness"
  | "fast"
  | "identity"
  | "brief"
  | "voice"
  | "continuity"
  | "comparison"
  | "checkin"
  | "referral"
  | "navigation"
  | "analytics";

const features: {
  id: FeatureId;
  title: string;
  description: string;
  icon: React.ElementType;
  group: string;
}[] = [
  {
    id: "ocr",
    title: "Handwritten OCR review",
    description: "Extract, score and verify medical fields",
    icon: ScanLine,
    group: "AI documentation",
  },
  {
    id: "completeness",
    title: "Case completeness",
    description: "Find missing information before consult",
    icon: ClipboardCheck,
    group: "AI documentation",
  },
  {
    id: "fast",
    title: "Emergency FAST CASE",
    description: "Essential details in a minimal workflow",
    icon: Siren,
    group: "Emergency",
  },
  {
    id: "identity",
    title: "Consent-based identification",
    description: "QR and demo fingerprint check-in",
    icon: Fingerprint,
    group: "Identity",
  },
  {
    id: "brief",
    title: "AI patient brief",
    description: "Doctor-ready overview with sources",
    icon: WandSparkles,
    group: "Clinical handoff",
  },
  {
    id: "voice",
    title: "Multilingual voice-to-case",
    description: "Speak naturally, review structured text",
    icon: AudioLines,
    group: "Accessible care",
  },
  {
    id: "continuity",
    title: "Cross-hospital continuity",
    description: "Consent-controlled records across providers",
    icon: GitCompareArrows,
    group: "Connected care",
  },
  {
    id: "comparison",
    title: "Report comparison",
    description: "See data trends without diagnosis",
    icon: Activity,
    group: "Connected care",
  },
  {
    id: "checkin",
    title: "One-tap hospital check-in",
    description: "Identify, match appointment and issue token",
    icon: CalendarCheck,
    group: "Connected care",
  },
  {
    id: "referral",
    title: "Smart referral",
    description: "Find a specialty and share selected records",
    icon: ArrowRight,
    group: "Connected care",
  },
  {
    id: "navigation",
    title: "Hospital navigation",
    description: "Floor, department and capacity demo",
    icon: MapPinned,
    group: "Hospital operations",
  },
  {
    id: "analytics",
    title: "Hospital analytics",
    description: "OPD load, wait time and follow-up signals",
    icon: BarChart3,
    group: "Hospital operations",
  },
];

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold text-foreground">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Status({
  children,
  tone = "success",
}: {
  children: React.ReactNode;
  tone?: "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        tone === "success" && "bg-success-soft text-success",
        tone === "warning" && "bg-warning-soft text-warning",
        tone === "danger" && "bg-danger-soft text-danger",
      )}
    >
      {tone === "success" ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <AlertTriangle className="size-3.5" />
      )}
      {children}
    </span>
  );
}

function AdvancedMvp() {
  const { activeCase } = useAyu();
  const patient = activeCase ?? DEMO_CASES[1]!;
  const [selected, setSelected] = useState<FeatureId>("ocr");
  const [verified, setVerified] = useState(false);
  const [fastStarted, setFastStarted] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceSaved, setVoiceSaved] = useState(false);
  const [identified, setIdentified] = useState(false);
  const [family, setFamily] = useState(false);
  const [query, setQuery] = useState("");

  const activeFeature = features.find((item) => item.id === selected)!;
  const visibleFeatures = useMemo(
    () =>
      features.filter((item) =>
        `${item.title} ${item.description} ${item.group}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="min-h-screen bg-clinical">
      <AppHeader
        right={
          <Button asChild variant="outline" className="h-10 rounded-xl border-2">
            <Link to="/services">Care Hub</Link>
          </Button>
        }
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <Badge className="rounded-full bg-warning text-warning-foreground hover:bg-warning">
              <WandSparkles className="mr-1 size-3.5" /> Advanced MVP · Prototype / Demo
            </Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              From first interaction to follow-up
            </h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Explore the roadmap’s flagship demo journey: identify, capture, understand, organize,
              consult, connect and follow up.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <UserRound className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">
                {patient.profile.name || "Demo patient"}
              </p>
              <p className="text-xs text-muted-foreground">AI-assisted profile</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[19rem_1fr]">
          <aside className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <input
                aria-label="Search MVP features"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search MVP features"
                className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              {visibleFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSelected(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition",
                      selected === item.id
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-card hover:border-primary/50",
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm text-foreground">{item.title}</strong>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">{activeFeature.group}</p>
                <h2 className="text-xl font-bold text-foreground">{activeFeature.title}</h2>
              </div>
              <Status tone="warning">AI-generated · verify before clinical use</Status>
            </div>

            {selected === "ocr" && (
              <Panel
                eyebrow="Upload → understand → verify → save"
                title="Handwritten prescription recognition"
              >
                <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary-soft p-5">
                    <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-card">
                      <FileCheck2 className="size-16 text-primary/60" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-foreground">
                      sample-handwritten-prescription.jpg
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Prototype sample · handwriting detected
                    </p>
                    <Button variant="outline" className="mt-4 h-10 rounded-xl border-2">
                      <ScanLine className="mr-2 size-4" />
                      Run OCR again
                    </Button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground">AI interpretation</p>
                      <strong className="text-primary">Overall AI Confidence: 91%</strong>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-border">
                      <div className="h-full w-[91%] rounded-full bg-primary" />
                    </div>
                    <div className="mt-5 space-y-2">
                      {[
                        ["Medicine", "Amoxicillin", "89%", "success"],
                        ["Dosage", "500 mg", "86%", "warning"],
                        ["Frequency", "BD · twice daily", "91%", "success"],
                        ["Duration", "5 days", "97%", "success"],
                        ["Doctor name", "Dr. P. Menon", "58%", "danger"],
                      ].map(([label, value, confidence, tone]) => (
                        <div
                          key={label}
                          className={cn(
                            "flex flex-wrap items-center gap-3 rounded-xl border p-3",
                            tone === "danger"
                              ? "border-danger/40 bg-danger-soft"
                              : tone === "warning"
                                ? "border-warning/40 bg-warning-soft"
                                : "border-border bg-surface",
                          )}
                        >
                          <span className="w-24 text-sm font-semibold text-muted-foreground">
                            {label}
                          </span>
                          <span className="flex-1 text-sm font-bold text-foreground">{value}</span>
                          <span className="text-xs font-bold text-foreground">{confidence}</span>
                          {tone !== "success" && <AlertTriangle className="size-4 text-warning" />}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button className="h-11 rounded-xl" onClick={() => setVerified(true)}>
                        {verified ? (
                          <Check className="mr-2 size-4" />
                        ) : (
                          <FileCheck2 className="mr-2 size-4" />
                        )}
                        {verified ? "Verified and saved" : "Verify and save"}
                      </Button>
                      <Status tone={verified ? "success" : "warning"}>
                        {verified ? "Doctor verification recorded" : "Doctor verification required"}
                      </Status>
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-xs text-muted-foreground">
                  This is a confidence indicator for this prototype, not a measured OCR accuracy
                  claim. Evaluation methodology and labeled dataset are required before publishing
                  accuracy claims.
                </p>
              </Panel>
            )}

            {selected === "completeness" && (
              <Panel eyebrow="Before consultation" title="AI case completeness score">
                <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-primary-soft p-5">
                  <div>
                    <p className="text-5xl font-bold text-primary">87%</p>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">
                      Case completeness
                    </p>
                  </div>
                  <div className="min-w-56 flex-1">
                    <Progress value={87} className="h-3" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Documentation completeness only — not a clinical risk score.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Chief complaint", true],
                    ["Duration", true],
                    ["Previous history", true],
                    ["Current medication", true],
                    ["Allergy information", false],
                    ["Previous reports", true],
                  ].map(([label, complete]) => (
                    <div
                      key={label as string}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-sm font-semibold"
                    >
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full",
                          complete
                            ? "bg-success-soft text-success"
                            : "bg-warning-soft text-warning",
                        )}
                      >
                        {complete ? (
                          <Check className="size-4" />
                        ) : (
                          <AlertTriangle className="size-4" />
                        )}
                      </span>
                      <span className="flex-1 text-foreground">{label}</span>
                      <span className="text-xs text-muted-foreground">
                        {complete ? "Complete" : "Needs review"}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-5 h-11 rounded-xl border-2">
                  <ClipboardCheck className="mr-2 size-4" />
                  Review missing information
                </Button>
              </Panel>
            )}

            {selected === "fast" && (
              <Panel eyebrow="Emergency workflow" title="Emergency FAST CASE">
                <div className="rounded-2xl border-2 border-danger/40 bg-danger-soft p-5">
                  <div className="flex items-start gap-3">
                    <Siren className="size-7 text-danger" />
                    <div>
                      <h3 className="font-bold text-danger">
                        Capture only what the clinical team needs first
                      </h3>
                      <p className="mt-1 text-sm text-foreground">
                        Identity → critical history → allergies → medication → emergency contact →
                        clinician review
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {["Identity", "Allergies", "Emergency contact"].map((item, i) => (
                      <div key={item} className="rounded-xl bg-card p-3">
                        <p className="text-xs text-muted-foreground">0{i + 1}</p>
                        <p className="mt-1 text-sm font-bold text-foreground">{item}</p>
                        <p className="mt-1 text-xs text-success">Ready to capture</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="destructive"
                    className="mt-5 h-12 rounded-xl"
                    onClick={() => setFastStarted(true)}
                  >
                    {fastStarted ? (
                      <Check className="mr-2 size-4" />
                    ) : (
                      <Siren className="mr-2 size-4" />
                    )}
                    {fastStarted
                      ? "FAST CASE started — clinician review"
                      : "Start Emergency FAST CASE"}
                  </Button>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  This flow organizes information for urgent review; it does not diagnose or replace
                  emergency care.
                </p>
              </Panel>
            )}

            {selected === "identity" && (
              <Panel eyebrow="Identity and access" title="Consent-based patient identification">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-surface p-5">
                    <QrCode className="size-8 text-primary" />
                    <h3 className="mt-4 font-bold text-foreground">AyuCase QR check-in</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Share limited emergency information or identify a booked patient.
                    </p>
                    <Button className="mt-4 h-10 rounded-xl" onClick={() => setIdentified(true)}>
                      {identified ? "Patient matched" : "Scan demo QR"}
                    </Button>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-5">
                    <Fingerprint className="size-8 text-primary" />
                    <h3 className="mt-4 font-bold text-foreground">Demo fingerprint scan</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Prototype only. No live Aadhaar biometric authentication.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 h-10 rounded-xl border-2"
                      onClick={() => setIdentified(true)}
                    >
                      {identified ? "Consent match complete" : "Run demo fingerprint"}
                    </Button>
                  </div>
                </div>
                {identified && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-success/30 bg-success-soft p-4">
                    <CheckCircle2 className="size-5 text-success" />
                    <div>
                      <strong className="text-foreground">
                        Patient match found: {patient.profile.name || "Demo patient"}
                      </strong>
                      <p className="text-sm text-muted-foreground">
                        Limited profile available after consent. ABHA / Aadhaar integrations are
                        only where officially supported.
                      </p>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border p-4 text-sm">
                  <ShieldCheck className="size-5 text-success" />
                  <span className="text-muted-foreground">
                    Minimum necessary information is shown. Complete medical history is never
                    exposed by default.
                  </span>
                </div>
              </Panel>
            )}

            {selected === "brief" && (
              <Panel eyebrow="Doctor handoff" title="AI pre-consultation patient brief">
                <div className="rounded-2xl border border-primary/25 bg-primary-soft p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-primary">
                        Patient brief
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-foreground">
                        {patient.profile.name || "Meera Sharma"} · {patient.profile.age || "54"}{" "}
                        years
                      </h3>
                    </div>
                    <Badge className="rounded-full bg-warning text-warning-foreground hover:bg-warning">
                      AI Generated
                    </Badge>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {[
                      ["Chief complaint", "Chest tightness and shortness of breath"],
                      [
                        "Previous relevant history",
                        `${patient.documents.length} records available`,
                      ],
                      ["Current medication", "Metformin 500 mg · Amlodipine 5 mg"],
                      ["Recent reports", `${patient.documents.length} report(s) digitized`],
                      ["Missing information", "Blood group not recorded"],
                      ["AI alerts", "Potential red flags require clinician review"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-card p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  Generated from patient statements and uploaded documents. Verify before clinical
                  use.
                </div>
              </Panel>
            )}

            {selected === "voice" && (
              <Panel eyebrow="Accessible multilingual care" title="Voice-to-case">
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Mic className="size-5" />
                      </span>
                      <div>
                        <p className="font-bold text-foreground">
                          Speak in English, Hindi or Punjabi
                        </p>
                        <p className="text-sm text-muted-foreground">
                          The original statement stays visible for review.
                        </p>
                      </div>
                    </div>
                    <select className="h-10 rounded-xl border border-input bg-card px-3 text-sm">
                      <option>Hindi · हिन्दी</option>
                      <option>English</option>
                      <option>Punjabi · ਪੰਜਾਬੀ</option>
                    </select>
                  </div>
                  <Textarea
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    placeholder="Tap the microphone or type a demo statement… e.g. Mere pet mein teen din se jalan hai"
                    className="mt-5 min-h-28 rounded-xl"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      className="h-11 rounded-xl"
                      onClick={() => setVoiceText("Mere pet mein teen din se jalan aur dard hai.")}
                    >
                      <Mic className="mr-2 size-4" />
                      Simulate voice capture
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 rounded-xl border-2"
                      onClick={() => setVoiceSaved(true)}
                      disabled={!voiceText}
                    >
                      {voiceSaved ? (
                        <Check className="mr-2 size-4" />
                      ) : (
                        <Languages className="mr-2 size-4" />
                      )}
                      {voiceSaved ? "Saved for review" : "Structure this case"}
                    </Button>
                  </div>
                </div>
                {voiceSaved && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Original patient statement
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{voiceText}</p>
                    </div>
                    <div className="rounded-xl border border-primary/30 bg-primary-soft p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-primary">
                        AI structured interpretation
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        Abdominal burning and pain for approximately 3 days.
                      </p>
                    </div>
                  </div>
                )}
              </Panel>
            )}

            {selected === "continuity" && (
              <Panel eyebrow="Connected care" title="Cross-hospital medical record continuity">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1 rounded-2xl border border-border bg-surface p-4">
                    <Hospital className="size-5 text-primary" />
                    <p className="mt-3 font-bold text-foreground">City Care Hospital</p>
                    <p className="text-xs text-muted-foreground">2 consultations · 3 documents</p>
                  </div>
                  <ArrowRight className="hidden size-6 text-primary sm:block" />
                  <div className="flex-1 rounded-2xl border border-border bg-surface p-4">
                    <Hospital className="size-5 text-primary" />
                    <p className="mt-3 font-bold text-foreground">Government General Hospital</p>
                    <p className="text-xs text-muted-foreground">1 admission · 2 documents</p>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl border border-warning/40 bg-warning-soft p-4">
                  <p className="font-bold text-foreground">
                    Patient consent required before sharing
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select relevant reports and prescriptions. Bills remain excluded by default.
                  </p>
                  <Button className="mt-4 h-10 rounded-xl" onClick={() => setVerified(true)}>
                    {verified ? "Consent recorded for demo" : "Review shared records"}
                  </Button>
                </div>
              </Panel>
            )}

            {selected === "comparison" && (
              <Panel eyebrow="Reports" title="Smart report comparison">
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full min-w-[34rem] text-left text-sm">
                    <thead className="bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="p-3">Measure</th>
                        <th className="p-3">11 Sep 2025</th>
                        <th className="p-3">11 Sep 2026</th>
                        <th className="p-3">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Haemoglobin", "13.1 g/dL", "14.2 g/dL", "+1.1"],
                        ["Total WBC", "9,800 /µL", "11,800 /µL", "+2,000"],
                        ["Platelets", "2.0 lakh /µL", "2.1 lakh /µL", "+0.1"],
                      ].map((row) => (
                        <tr key={row[0]} className="border-t border-border">
                          <td className="p-3 font-bold text-foreground">{row[0]}</td>
                          <td className="p-3 text-muted-foreground">{row[1]}</td>
                          <td className="p-3 font-semibold text-foreground">{row[2]}</td>
                          <td className="p-3 font-bold text-primary">{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-info-soft p-4 text-sm">
                  <GitCompareArrows className="size-5 text-primary" />
                  <span className="text-foreground">
                    <strong>Data trend detected.</strong> This comparison does not provide a
                    diagnosis; a clinician must interpret the results.
                  </span>
                </div>
              </Panel>
            )}

            {selected === "checkin" && (
              <Panel eyebrow="Hospital arrival" title="One-tap hospital check-in">
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    ["1", "Patient identified"],
                    ["2", "Appointment found"],
                    ["3", "Records available"],
                    ["4", "Token generated"],
                  ].map(([n, label], i) => (
                    <div
                      key={n}
                      className={cn(
                        "rounded-2xl border p-4",
                        i < 3
                          ? "border-success/30 bg-success-soft"
                          : "border-primary/30 bg-primary-soft",
                      )}
                    >
                      <span className="flex size-8 items-center justify-center rounded-full bg-card text-sm font-bold text-primary">
                        {i < 3 ? <Check className="size-4" /> : n}
                      </span>
                      <p className="mt-3 text-sm font-bold text-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl bg-kiosk p-5 text-primary-foreground">
                  <p className="text-xs font-bold uppercase tracking-wide text-warning">
                    OPD token
                  </p>
                  <p className="mt-1 text-5xl font-bold">24</p>
                  <p className="mt-2 text-sm">
                    Currently serving 21 · 3 patients ahead · estimated wait 18 min
                  </p>
                </div>
                <Button className="mt-5 h-11 rounded-xl">
                  <CalendarCheck className="mr-2 size-4" />
                  Check in with demo QR
                </Button>
              </Panel>
            )}

            {selected === "referral" && (
              <Panel eyebrow="Connected specialist care" title="Smart referral recommendation">
                <div className="rounded-2xl border border-warning/40 bg-warning-soft p-5">
                  <div className="flex items-start gap-3">
                    <ArrowRight className="size-6 text-warning" />
                    <div>
                      <h3 className="font-bold text-foreground">Cardiology referral recommended</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Based on the clinician’s referral instruction. AyuCase does not make this
                        recommendation autonomously.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    "City Care Hospital · Cardiology · 1.8 km",
                    "HeartFirst Clinic · Cardiology · 4.2 km",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
                    >
                      <Stethoscope className="size-5 text-primary" />
                      <span className="flex-1 text-sm font-bold text-foreground">{item}</span>
                      <Button variant="outline" size="sm" className="rounded-lg border-2">
                        View slots
                      </Button>
                    </div>
                  ))}
                </div>
                <Button className="mt-5 h-11 rounded-xl">
                  <FileHeart className="mr-2 size-4" />
                  Select records for secure transfer
                </Button>
              </Panel>
            )}

            {selected === "navigation" && (
              <Panel eyebrow="Hospital operations" title="Smart hospital navigation">
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-foreground">
                    <span className="rounded-xl bg-primary-soft px-3 py-2 text-primary">OPD</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                    <span className="rounded-xl bg-primary-soft px-3 py-2 text-primary">
                      2nd floor
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                    <span className="rounded-xl bg-primary-soft px-3 py-2 text-primary">
                      Cardiology
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                    <span className="rounded-xl bg-warning-soft px-3 py-2 text-warning">
                      Room 204
                    </span>
                  </div>
                  <p className="mt-5 text-sm text-muted-foreground">
                    Demo floor map · live indoor positioning is not connected.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Emergency", "Available", "success"],
                    ["Appointments", "Available", "success"],
                    ["Diagnostics", "Limited", "warning"],
                  ].map(([label, value, tone]) => (
                    <div key={label} className="rounded-xl border border-border p-4">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p
                        className={cn(
                          "mt-2 font-bold",
                          tone === "success" ? "text-success" : "text-warning",
                        )}
                      >
                        {value}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Mock availability</p>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {selected === "analytics" && (
              <Panel eyebrow="Admin dashboard" title="Hospital analytics">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["248", "Daily patients"],
                    ["42 min", "Avg. wait time"],
                    ["68%", "Follow-up rate"],
                    ["34", "Lab bookings"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl bg-surface p-4">
                      <BarChart3 className="size-5 text-primary" />
                      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-border p-5">
                  <div
                    className="flex items-end gap-3"
                    aria-label="Department-wise patient load chart"
                  >
                    {[
                      ["Medicine", 72],
                      ["Cardio", 54],
                      ["Ortho", 46],
                      ["Diagnostics", 62],
                      ["Physio", 28],
                    ].map(([label, value]) => (
                      <div
                        key={label as string}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <div
                          className="w-full rounded-t-xl bg-primary"
                          style={{ height: `${Number(value) * 2}px` }}
                        />
                        <span className="text-center text-[10px] text-muted-foreground">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Prototype analytics using mock hospital data.
                  </p>
                </div>
              </Panel>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <Users className="size-5 text-primary" />
                  <div>
                    <h3 className="font-bold text-foreground">Family profiles</h3>
                    <p className="text-sm text-muted-foreground">Manage authorized dependents.</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 h-10 rounded-xl border-2"
                  onClick={() => setFamily(!family)}
                >
                  {family ? "Parent profile added" : "Add authorized family profile"}
                </Button>
                {family && (
                  <p className="mt-3 text-xs font-semibold text-success">
                    <Check className="mr-1 inline size-3" />
                    Mother · access limited to appointments and reports
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <Pill className="size-5 text-primary" />
                  <div>
                    <h3 className="font-bold text-foreground">Patient preparation</h3>
                    <p className="text-sm text-muted-foreground">Appointment tomorrow · 10:30 AM</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Check className="mr-2 inline size-4 text-success" />
                    Bring previous prescription
                  </li>
                  <li>
                    <Check className="mr-2 inline size-4 text-success" />
                    Recent blood report available
                  </li>
                  <li>
                    <AlertTriangle className="mr-2 inline size-4 text-warning" />
                    Allergy status needs review
                  </li>
                </ul>
              </div>
            </div>
            <ClinicalDisclaimer />
          </div>
        </div>
      </main>
    </div>
  );
}
