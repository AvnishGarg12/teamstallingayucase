import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Ambulance,
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileHeart,
  FileText,
  HeartPulse,
  Home,
  Hospital,
  MapPin,
  MessageCircle,
  Pill,
  Plus,
  QrCode,
  Receipt,
  Search,
  ShieldCheck,
  Siren,
  Stethoscope,
  TestTube2,
  UserRound,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { AppHeader, ClinicalDisclaimer } from "@/components/ayucase/Brand";
import { HealthTimeline } from "@/components/ayucase/HealthTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAyu } from "@/lib/ayucase/store";
import { DEMO_CASES } from "@/lib/ayucase/demoData";
import type { CaseRecord } from "@/lib/ayucase/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Care Hub — appointments, records and support | AyuCase" },
      {
        name: "description",
        content:
          "AyuCase digital patient journey: appointments, records, diagnostics, emergency support and follow-up care.",
      },
    ],
  }),
  component: CareHub,
});

type ServiceId = "appointments" | "diagnostics" | "records" | "medicines" | "emergency" | "physio";

const providers = [
  {
    name: "City Care Hospital",
    kind: "Hospital · General Medicine",
    distance: "1.8 km",
    accent: "bg-primary-soft",
    services: ["Cardiology", "Diagnostics", "ICU"],
  },
  {
    name: "Sanjivani Diagnostics",
    kind: "Diagnostic centre",
    distance: "2.4 km",
    accent: "bg-info-soft",
    services: ["Blood tests", "Home collection"],
  },
  {
    name: "Aarogya Physio Clinic",
    kind: "Physiotherapy centre",
    distance: "3.1 km",
    accent: "bg-success-soft",
    services: ["Sports rehab", "Home visits"],
  },
];

const tests = [
  "Complete blood count (CBC)",
  "Fasting blood sugar",
  "Lipid profile",
  "Liver function test",
];

function SectionCard({
  icon: Icon,
  title,
  eyebrow,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6", className)}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">{title}</h2>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function CareHub() {
  const { activeCase } = useAyu();
  const patient = activeCase ?? DEMO_CASES[1]!;
  const [active, setActive] = useState<ServiceId>("appointments");
  const [booked, setBooked] = useState(false);
  const [sampleHome, setSampleHome] = useState(true);
  const [medReminder, setMedReminder] = useState(false);
  const [ambulance, setAmbulance] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProviders = useMemo(
    () =>
      providers.filter((p) =>
        `${p.name} ${p.kind} ${p.services.join(" ")}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );
  const appointmentLabel = booked ? "Appointment confirmed" : "Book appointment";

  return (
    <div className="min-h-screen bg-clinical">
      <AppHeader
        right={
          <Button asChild variant="outline" className="h-10 rounded-xl border-2">
            <Link to="/">New case</Link>
          </Button>
        }
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <Badge className="rounded-full bg-info-soft text-navy hover:bg-info-soft">
              <HeartPulse className="mr-1 size-3.5" /> Digital patient journey
            </Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Good morning, {patient.profile.name || "patient"}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Your records, care bookings and next steps in one place. Choose a service to continue.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="h-11 rounded-xl">
              <Link to="/mvp">
                <WandSparkles className="mr-2 size-4" />
                Advanced MVP demo
              </Link>
            </Button>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
              <span className="flex size-11 items-center justify-center rounded-xl bg-warning text-warning-foreground">
                <UserRound className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {patient.profile.name || "Patient profile"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {patient.profile.abhaId ? `ABHA ${patient.profile.abhaId}` : "ABHA not linked"}
                </p>
              </div>
              <Button size="icon" variant="ghost" aria-label="View patient QR">
                <QrCode className="size-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["appointments", CalendarDays, "Appointments", "Book, reminders and queue"],
              ["diagnostics", TestTube2, "Diagnostics", "Tests and home collection"],
              ["records", FileHeart, "My health records", "Timeline, reports and bills"],
              ["medicines", Pill, "Medicines & follow-up", "Reminders and next visit"],
              ["emergency", Siren, "Emergency assistance", "Card, contacts and ambulance"],
              ["physio", Stethoscope, "Physiotherapy", "Plans and home visits"],
            ] as const
          ).map(([id, Icon, title, hint]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={cn(
                "flex min-h-24 items-center gap-4 rounded-2xl border-2 p-4 text-left transition",
                active === id
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card hover:border-primary/50",
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <strong className="block text-base text-foreground">{title}</strong>
                <span className="mt-1 block text-sm text-muted-foreground">{hint}</span>
              </span>
              <ChevronRight className="ml-auto size-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            {active === "appointments" && (
              <SectionCard
                icon={CalendarDays}
                eyebrow="Smart appointments"
                title="Book your next visit"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-foreground">
                    Hospital
                    <select className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3">
                      <option>City Care Hospital</option>
                      <option>Government General Hospital</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-foreground">
                    Department
                    <select className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3">
                      <option>General Medicine</option>
                      <option>Cardiology</option>
                      <option>Orthopaedics</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-foreground">
                    Preferred date
                    <input
                      type="date"
                      className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3"
                      defaultValue="2026-09-15"
                    />
                  </label>
                  <label className="text-sm font-semibold text-foreground">
                    Time slot
                    <select className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-3">
                      <option>10:30 AM — 11:00 AM</option>
                      <option>11:30 AM — 12:00 PM</option>
                      <option>04:00 PM — 04:30 PM</option>
                    </select>
                  </label>
                </div>
                <Button className="mt-5 h-12 rounded-xl" onClick={() => setBooked(true)}>
                  {booked ? (
                    <Check className="mr-2 size-4" />
                  ) : (
                    <CalendarDays className="mr-2 size-4" />
                  )}
                  {appointmentLabel}
                </Button>
                {booked && (
                  <div className="mt-4 flex items-start gap-3 rounded-2xl border border-success/30 bg-success-soft p-4 text-sm">
                    <Check className="mt-0.5 size-5 text-success" />
                    <div>
                      <strong className="text-foreground">
                        15 Sep · 10:30 AM · General Medicine
                      </strong>
                      <p className="mt-1 text-muted-foreground">
                        City Care Hospital · Reminder will be sent before your visit.
                      </p>
                    </div>
                  </div>
                )}
              </SectionCard>
            )}

            {active === "diagnostics" && (
              <SectionCard
                icon={TestTube2}
                eyebrow="Online lab booking"
                title="Book a test or home sample collection"
              >
                <div className="space-y-3">
                  {tests.map((test, i) => (
                    <label
                      key={test}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface p-4"
                    >
                      <input
                        type="radio"
                        name="test"
                        defaultChecked={i === 0}
                        className="size-4 accent-[var(--color-primary)]"
                      />
                      <span className="flex-1 text-sm font-semibold text-foreground">{test}</span>
                      <span className="text-sm font-bold text-primary">
                        ₹{i === 0 ? "450" : "350"}
                      </span>
                    </label>
                  ))}
                </div>
                <label className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary-soft p-4 text-sm font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={sampleHome}
                    onChange={(e) => setSampleHome(e.target.checked)}
                    className="size-4 accent-[var(--color-primary)]"
                  />{" "}
                  <Home className="size-4 text-primary" /> Home sample collection{" "}
                  <span className="ml-auto text-xs text-muted-foreground">+₹100</span>
                </label>
                <Button className="mt-5 h-12 rounded-xl" onClick={() => setBooked(true)}>
                  <TestTube2 className="mr-2 size-4" />
                  {booked ? "Booking requested" : "Continue to booking"}
                </Button>
              </SectionCard>
            )}

            {active === "records" && (
              <>
                <SectionCard
                  icon={FileHeart}
                  eyebrow="Unified patient profile"
                  title="Your health records"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-surface p-4">
                      <FileText className="size-5 text-primary" />
                      <p className="mt-3 text-2xl font-bold text-foreground">
                        {patient.documents.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Digitised documents</p>
                    </div>
                    <div className="rounded-2xl bg-surface p-4">
                      <Receipt className="size-5 text-primary" />
                      <p className="mt-3 text-2xl font-bold text-foreground">₹2,840</p>
                      <p className="text-sm text-muted-foreground">Pending dues · City Care</p>
                    </div>
                    <div className="rounded-2xl bg-surface p-4">
                      <Hospital className="size-5 text-primary" />
                      <p className="mt-3 text-2xl font-bold text-foreground">2</p>
                      <p className="text-sm text-muted-foreground">Previous consultations</p>
                    </div>
                    <div className="rounded-2xl bg-surface p-4">
                      <ShieldCheck className="size-5 text-primary" />
                      <p className="mt-3 text-2xl font-bold text-foreground">Consent ready</p>
                      <p className="text-sm text-muted-foreground">ABDM / FHIR demo profile</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-5 h-12 rounded-xl border-2"
                    onClick={() => setShareOpen(true)}
                  >
                    <QrCode className="mr-2 size-4" />
                    Share selected records
                  </Button>
                </SectionCard>
                <HealthTimeline record={patient} />
              </>
            )}

            {active === "medicines" && (
              <SectionCard icon={Pill} eyebrow="Medication management" title="Stay on track">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-foreground">Metformin 500 mg</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        1 tablet · after breakfast and dinner
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      Long-term
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-success">
                    <Check className="size-4" /> Morning dose marked complete
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-foreground">Amlodipine 5 mg</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        1 tablet · after breakfast
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      Refill in 8 days
                    </Badge>
                  </div>
                </div>
                <Button className="mt-5 h-12 rounded-xl" onClick={() => setMedReminder(true)}>
                  {medReminder ? (
                    <Check className="mr-2 size-4" />
                  ) : (
                    <BellRing className="mr-2 size-4" />
                  )}
                  {medReminder ? "Reminder enabled" : "Enable medicine reminders"}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Reminders support adherence; always follow the prescription from your clinician.
                </p>
              </SectionCard>
            )}

            {active === "emergency" && (
              <SectionCard icon={Siren} eyebrow="Emergency assistance" title="Help is one tap away">
                <div className="rounded-2xl bg-danger-soft p-4">
                  <div className="flex items-start gap-3">
                    <Siren className="size-6 text-danger" />
                    <div>
                      <p className="font-bold text-danger">AyuCase Emergency Card</p>
                      <p className="mt-1 text-sm text-foreground">
                        {patient.profile.name || "Patient"} · Blood group not provided · Allergy:
                        Sulpha medicines
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Share only with consent. This card does not replace emergency medical care.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Button variant="outline" className="h-12 justify-start rounded-xl border-2">
                    <Users className="mr-2 size-4" />
                    Emergency contacts
                  </Button>
                  <Button
                    variant="destructive"
                    className="h-12 justify-start rounded-xl"
                    onClick={() => setAmbulance(true)}
                  >
                    <Ambulance className="mr-2 size-4" />
                    Request ambulance
                  </Button>
                </div>
                {ambulance && (
                  <div className="mt-4 rounded-2xl border border-warning/50 bg-warning-soft p-4">
                    <div className="flex items-center gap-3">
                      <Clock3 className="size-5 text-warning" />
                      <div>
                        <strong className="text-foreground">Demo request created</strong>
                        <p className="text-sm text-muted-foreground">
                          Finding an ALS ambulance near your location…
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-card px-3 py-1 text-primary">
                        Ambulance assigned
                      </span>
                      <span className="rounded-full bg-card px-3 py-1 text-muted-foreground">
                        Driver en route
                      </span>
                      <span className="rounded-full bg-card px-3 py-1 text-muted-foreground">
                        Hospital notified
                      </span>
                    </div>
                  </div>
                )}
              </SectionCard>
            )}

            {active === "physio" && (
              <SectionCard
                icon={Stethoscope}
                eyebrow="Physiotherapy"
                title="Your rehabilitation plan"
              >
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">Knee mobility programme</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Aarogya Physio Clinic · Dr. N. Joshi
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-primary">4/8</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
                    <div className="h-full w-1/2 rounded-full bg-primary" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    4 sessions completed · next session 18 Sep, 5:00 PM
                  </p>
                </div>
                <Button className="mt-5 h-12 rounded-xl" onClick={() => setBooked(true)}>
                  <Plus className="mr-2 size-4" />
                  Book next session
                </Button>
              </SectionCard>
            )}
          </div>

          <aside className="space-y-6">
            <SectionCard icon={Clock3} eyebrow="Today" title="Care at a glance">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 size-2 rounded-full bg-success" />
                  <div>
                    <p className="text-sm font-bold text-foreground">No appointment today</p>
                    <p className="text-xs text-muted-foreground">Book a visit when you need one.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 size-2 rounded-full bg-warning" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Follow-up due in 7 days</p>
                    <p className="text-xs text-muted-foreground">
                      General Medicine · City Care Hospital
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 size-2 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Queue status</p>
                    <p className="text-xs text-muted-foreground">
                      Your last token was 14 · completed
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>
            <SectionCard icon={MapPin} eyebrow="Nearby care" title="Find verified providers">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search service or facility"
                  className="h-11 rounded-xl pl-9"
                />
              </div>
              <div className="mt-4 space-y-3">
                {filteredProviders.map((provider) => (
                  <div key={provider.name} className="rounded-2xl border border-border p-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-xl",
                          provider.accent,
                        )}
                      >
                        <Hospital className="size-4 text-primary" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="truncate text-sm font-bold text-foreground">
                            {provider.name}
                          </p>
                          <ShieldCheck className="size-3.5 shrink-0 text-success" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {provider.kind} · {provider.distance}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {provider.services.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-surface px-2 py-1 text-[11px] font-semibold text-muted-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {!filteredProviders.length && (
                  <p className="py-3 text-sm text-muted-foreground">No matching providers found.</p>
                )}
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">
                <ShieldCheck className="mr-1 inline size-3 text-success" />
                AyuCase Verified means provider identity and listed services verified by AyuCase; it
                does not guarantee treatment quality or outcomes.
              </p>
            </SectionCard>
          </aside>
        </div>

        <ClinicalDisclaimer className="mt-8" />
        {shareOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/50 p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-lift">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Share medical history</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose what the next clinician can view.
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShareOpen(false)}
                  aria-label="Close"
                >
                  <X className="size-5" />
                </Button>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  "Blood reports",
                  "Prescriptions",
                  "Previous discharge summary",
                  "Bills and receipts",
                ].map((item, i) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm font-semibold"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={i < 3}
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {item}
                  </label>
                ))}
              </div>
              <Button className="mt-5 h-12 w-full rounded-xl" onClick={() => setShareOpen(false)}>
                <QrCode className="mr-2 size-4" />
                Generate secure QR
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Links expire automatically and are consent-controlled.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
