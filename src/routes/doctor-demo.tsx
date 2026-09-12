import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Pencil,
  RotateCcw,
  TimerReset,
  Users,
  XCircle,
} from "lucide-react";
import { AppHeader, ClinicalDisclaimer, OpdTokenCard } from "@/components/ayucase/Brand";
import { ConfidenceBadge } from "@/components/ayucase/ConfidenceBadge";
import { RedFlagCard } from "@/components/ayucase/RedFlagCard";
import { HealthTimeline } from "@/components/ayucase/HealthTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_CASES } from "@/lib/ayucase/demoData";
import { demoMetrics, demoToken } from "@/lib/ayucase/demo";
import { buildDoctorSummary } from "@/lib/ayucase/summary";
import type { CaseRecord, SummaryItem } from "@/lib/ayucase/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctor-demo")({
  head: () => ({
    meta: [
      { title: "SIH Doctor Demo Dashboard — AyuCase" },
      { name: "description", content: "Review fictional AyuCase OPD cases, source evidence, confidence labels and urgent red flags." },
      { property: "og:title", content: "SIH Doctor Demo Dashboard — AyuCase" },
      { property: "og:description", content: "A safe fictional-case demonstration of AyuCase clinical review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DoctorDemoPage,
});

type DemoStatus = "waiting" | "approved" | "rejected";

function DoctorDemoPage() {
  const [selectedId, setSelectedId] = useState(DEMO_CASES[0]?.id ?? "");
  const [statuses, setStatuses] = useState<Record<string, DemoStatus>>({});
  const [editing, setEditing] = useState(false);
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({});
  const [announcement, setAnnouncement] = useState("Fictional demo dashboard ready.");
  const selected = DEMO_CASES.find((record) => record.id === selectedId) ?? DEMO_CASES[0];
  const status = selected ? statuses[selected.id] ?? "waiting" : "waiting";
  const summary = useMemo(() => (selected ? buildDoctorSummary(selected) : []), [selected]);

  if (!selected) return null;

  const metrics = demoMetrics(selected);
  const token = demoToken(selected);
  const editedValues = edits[selected.id] ?? {};

  const setStatus = (next: DemoStatus) => {
    setStatuses((current) => ({ ...current, [selected.id]: next }));
    setEditing(false);
    setAnnouncement(
      next === "approved"
        ? `${selected.profile.name} is Human Verified.`
        : `${selected.profile.name} was rejected and sent back for correction.`,
    );
  };

  return (
    <div className="min-h-screen bg-clinical">
      <AppHeader
        right={
          <Button asChild variant="outline" className="h-11 rounded-2xl border-2">
            <Link to="/doctor">Secure staff login</Link>
          </Button>
        }
      />
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Smart India Hackathon · Fictional data</p>
            <h1 className="mt-1 text-3xl font-bold text-foreground">Doctor Demo Dashboard</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">Review the queue, trace every fact to its source, and make the final human decision.</p>
          </div>
          <Button
            variant="outline"
            className="h-11 rounded-2xl border-2"
            onClick={() => {
              setStatuses({});
              setEdits({});
              setEditing(false);
              setAnnouncement("Demo reset.");
            }}
          >
            <RotateCcw className="size-4" aria-hidden /> Reset demo
          </Button>
        </div>

        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>

        <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Impact metrics">
          <Metric icon={<Users aria-hidden />} value="2" label="Patients in demo queue" />
          <Metric icon={<ClipboardCheck aria-hidden />} value="100%" label="Histories structured" />
          <Metric icon={<TimerReset aria-hidden />} value="~22 min" label="Doctor time saved" />
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[19rem_1fr]">
          <aside aria-label="Patient queue">
            <h2 className="text-lg font-bold text-foreground">Patient queue</h2>
            <div className="mt-3 space-y-3">
              {DEMO_CASES.map((record) => {
                const recordStatus = statuses[record.id] ?? "waiting";
                const active = record.id === selected.id;
                return (
                  <Button
                    key={record.id}
                    variant="outline"
                    onClick={() => {
                      setSelectedId(record.id);
                      setEditing(false);
                    }}
                    className={cn(
                      "h-auto min-h-24 w-full justify-start whitespace-normal rounded-2xl border-2 p-4 text-left",
                      active && "border-primary bg-primary-soft",
                    )}
                    aria-pressed={active}
                  >
                    <span className="w-full">
                      <span className="flex items-center justify-between gap-2">
                        <strong className="text-base text-foreground">{demoToken(record)} · {record.profile.name}</strong>
                        {record.redFlags.length > 0 && <AlertTriangle className="size-5 shrink-0 text-danger" aria-label="Urgent" />}
                      </span>
                      <span className="mt-1 block text-sm font-normal text-muted-foreground">{record.profile.age} yrs · {demoMetrics(record).queueStatus}</span>
                      <span className={cn("mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold", recordStatus === "approved" ? "bg-success-soft text-success" : "bg-warning-soft text-warning")}>{recordStatus === "approved" ? "Human Verified" : recordStatus === "rejected" ? "Needs correction" : "Awaiting review"}</span>
                    </span>
                  </Button>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0 space-y-5" aria-label={`Reviewing ${selected.profile.name}`}>
            {selected.redFlags.length > 0 && <RedFlagCard flags={selected.redFlags} />}

            <div className="grid gap-4 xl:grid-cols-[18rem_1fr]">
              <OpdTokenCard name={selected.profile.name} tokenNumber={token} department={metrics.department} queueAhead={selected.redFlags.length ? 0 : 3} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <CompactMetric label="Queue status" value={metrics.queueStatus} urgent={selected.redFlags.length > 0} />
                <CompactMetric label="Consultation" value={metrics.estimatedConsultation} />
                <CompactMetric label="History complete" value={`${metrics.completion}%`} />
                <CompactMetric label="Time saved" value={`~${metrics.timeSaved} min`} />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Clinical summary</h2>
                  <p className="text-sm text-muted-foreground">{selected.profile.name} · {selected.profile.age} years · {selected.profile.gender} · {metrics.documents} documents digitized</p>
                </div>
                {status === "approved" && (
                  <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-success/40 bg-success-soft px-4 text-sm font-bold text-success">
                    <CheckCircle2 className="size-5" aria-hidden /> Human Verified
                  </span>
                )}
              </div>

              <ul className="mt-5 space-y-3">
                {summary.map((item) => (
                  <SummaryRow
                    key={item.label}
                    item={item}
                    editing={editing}
                    value={editedValues[item.label] ?? item.value}
                    onChange={(value) => setEdits((current) => ({ ...current, [selected.id]: { ...(current[selected.id] ?? {}), [item.label]: value } }))}
                  />
                ))}
              </ul>

              <section className="mt-6" aria-labelledby="documents-title">
                <h3 id="documents-title" className="text-lg font-bold text-foreground">Document evidence</h3>
                <div className="mt-3 space-y-3">
                  {selected.documents.map((document) => (
                    <article key={document.id} className="rounded-2xl border border-border bg-surface p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-foreground"><FileText className="mr-2 inline size-4 text-primary" aria-hidden />{document.kind}</strong>
                        <span className="text-xs text-muted-foreground">Source: {document.facility} · {document.documentDate}</span>
                      </div>
                      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {document.fields.map((field, index) => (
                          <li key={`${field.label}-${index}`} className="flex items-start justify-between gap-3 rounded-xl bg-card px-3 py-2">
                            <span className="text-sm"><strong>{field.label}:</strong> {field.value}</span>
                            <ConfidenceBadge confidence={field.confidence} />
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Button size="lg" className="h-12 rounded-2xl" onClick={() => setStatus("approved")}>
                  <CheckCircle2 className="size-5" aria-hidden /> Approve
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-2xl border-2" onClick={() => {
                  setEditing((current) => !current);
                  setAnnouncement(editing ? "Summary edits saved locally." : "Summary edit mode opened.");
                }}>
                  <Pencil className="size-5" aria-hidden /> {editing ? "Save edits" : "Edit"}
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-2xl border-2 border-warning text-warning hover:bg-warning-soft" onClick={() => setStatus("rejected")}>
                  <XCircle className="size-5" aria-hidden /> Reject
                </Button>
              </div>
            </div>

            <HealthTimeline record={selected} />

            <ClinicalDisclaimer />
          </section>
        </div>
      </main>
    </div>
  );
}

function Metric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">{icon}</span><span><strong className="block text-2xl text-foreground">{value}</strong><span className="text-sm text-muted-foreground">{label}</span></span></div>;
}

function CompactMetric({ label, value, urgent = false }: { label: string; value: string; urgent?: boolean }) {
  return <div className={cn("rounded-2xl border bg-card p-4", urgent ? "border-danger bg-danger-soft" : "border-border")}><span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span><strong className={cn("mt-1 block text-base", urgent ? "text-danger" : "text-foreground")}>{value}</strong></div>;
}

function SummaryRow({ item, editing, value, onChange }: { item: SummaryItem; editing: boolean; value: string; onChange: (value: string) => void }) {
  return (
    <li className={cn("rounded-2xl border p-4", item.flagged ? "border-danger bg-danger-soft" : "border-border bg-surface")}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-foreground">{item.label}</h3><span className="rounded-full bg-info-soft px-2.5 py-1 text-xs font-semibold text-info">Source: {item.source}</span></div>
      {editing ? <Input className="mt-3 h-11" aria-label={`Edit ${item.label}`} value={value} onChange={(event) => onChange(event.target.value)} /> : <p className="mt-2 text-foreground">{value}</p>}
    </li>
  );
}
