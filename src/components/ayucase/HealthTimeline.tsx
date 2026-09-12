import { CalendarDays, FileText, HeartPulse, Stethoscope } from "lucide-react";
import type { CaseRecord } from "@/lib/ayucase/types";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  detail: string;
  source: string;
  icon: typeof CalendarDays;
}

function toTime(value: string) {
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) return Number.POSITIVE_INFINITY;
  const parsed = new Date(`${match[2]} ${match[1]}, ${match[3]}`).getTime();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Current visit"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function HealthTimeline({ record }: { record: CaseRecord }) {
  const events: TimelineEvent[] = record.documents.map((document) => ({
    id: document.id,
    date: document.documentDate,
    title: document.kind,
    detail:
      document.fields
        .filter((field) => field.label !== "Document date")
        .slice(0, 2)
        .map((field) => `${field.label}: ${field.value}`)
        .join(" · ") || "Document added to the patient record",
    source: document.facility,
    icon: FileText,
  }));

  events.push({
    id: `${record.id}-current`,
    date: dateLabel(record.createdAt),
    title: "Current OPD consultation",
    detail: record.redFlags.length
      ? `${record.redFlags.length} potential red flag${record.redFlags.length > 1 ? "s" : ""} sent for clinician review`
      : "Patient history prepared for clinician review",
    source: "AyuCase patient interview",
    icon: record.redFlags.length ? HeartPulse : Stethoscope,
  });

  const ordered = [...events].sort((a, b) => toTime(a.date) - toTime(b.date));

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6" aria-labelledby="health-timeline-title">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <CalendarDays className="size-5" aria-hidden />
        </span>
        <div>
          <h2 id="health-timeline-title" className="text-xl font-bold text-foreground">Patient health timeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">A chronological view of records and today’s visit. Verify details before clinical use.</p>
        </div>
      </div>
      <ol className="relative mt-5 space-y-4 border-l-2 border-primary/20 pl-5">
        {ordered.map((event) => {
          const Icon = event.icon;
          return (
            <li key={event.id} className="relative rounded-2xl border border-border bg-surface p-4">
              <span className="absolute -left-[2.05rem] top-4 flex size-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-bold text-foreground">{event.title}</h3>
                <time className="text-xs font-semibold text-primary">{event.date}</time>
              </div>
              <p className="mt-1 text-sm text-foreground">{event.detail}</p>
              <p className="mt-2 text-xs text-muted-foreground">Source: {event.source}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
