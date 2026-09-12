import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  LogIn,
  LogOut,
  MessageSquareText,
  Printer,
  Search,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader, ClinicalDisclaimer } from "@/components/ayucase/Brand";
import { ConfidenceBadge } from "@/components/ayucase/ConfidenceBadge";
import { RedFlagCard } from "@/components/ayucase/RedFlagCard";
import { HealthTimeline } from "@/components/ayucase/HealthTimeline";
import { useAyu } from "@/lib/ayucase/store";
import { getDocumentPhotoUrl } from "@/lib/ayucase/documentStorage";
import {
  approveStaff,
  fetchStaffAccess,
  listStaffRequests,
  requestStaffAccess,
  revokeStaff,
  type StaffAccess,
  type StaffRequest,
} from "@/lib/ayucase/staff";
import { buildDoctorSummary } from "@/lib/ayucase/summary";
import { SECTIONS, type CaseRecord } from "@/lib/ayucase/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Doctor console — review OPD case summaries | AyuCase" },
      {
        name: "description",
        content:
          "Doctors review the waiting queue, read a structured pre-consultation summary with sources, check uploaded papers, and verify or send back each case.",
      },
      { property: "og:title", content: "Doctor console — AyuCase" },
      {
        property: "og:description",
        content: "Review, verify and print structured pre-consultation case summaries in the OPD.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DoctorPage,
});

type Filter = "waiting" | "verified" | "sent-back" | "all";
type Tab = "summary" | "documents" | "interview";

function DocumentPhoto({ path, label }: { path: string; label: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getDocumentPhotoUrl(path).then((signed) => {
      if (active) setUrl(signed);
    });
    return () => {
      active = false;
    };
  }, [path]);

  if (!url) {
    return (
      <div className="mt-3 flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground">
        Loading photo…
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-3 block">
      <img
        src={url}
        alt={`Photo of ${label}`}
        className="max-h-64 w-full rounded-xl border border-border object-contain"
        loading="lazy"
      />
    </a>
  );
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: "waiting", label: "Waiting" },
  { id: "verified", label: "Verified" },
  { id: "sent-back", label: "Sent back" },
  { id: "all", label: "All" },
];

function matchesFilter(c: CaseRecord, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "verified") return c.status === "approved";
  if (filter === "sent-back") return c.status === "rejected";
  return c.status !== "approved" && c.status !== "rejected";
}

function statusLabel(status: CaseRecord["status"]) {
  if (status === "approved") return "Verified";
  if (status === "rejected") return "Sent back";
  return "Awaiting review";
}

function StatusPill({ status }: { status: CaseRecord["status"] }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        status === "approved"
          ? "border-success/40 bg-success-soft text-success"
          : status === "rejected"
            ? "border-warning/40 bg-warning-soft text-warning"
            : "border-border bg-surface text-muted-foreground",
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone?: "danger";
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          tone === "danger" ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary",
        )}
      >
        {icon}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}

function DoctorPage() {
  const { doctorCases, setCaseStatus, saveNote, refreshCases } = useAyu();
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("waiting");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("summary");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteSavedAt, setNoteSavedAt] = useState<string | null>(null);
  const [access, setAccess] = useState<StaffAccess | null>(null);
  const [accessBusy, setAccessBusy] = useState(false);
  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([]);

  const visibleCases = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctorCases
      .filter((c) => matchesFilter(c, filter))
      .filter((c) => (q ? (c.profile.name || "").toLowerCase().includes(q) : true))
      .slice()
      .sort((a, b) => b.redFlags.length - a.redFlags.length);
  }, [doctorCases, filter, query]);

  const selected = useMemo(
    () => visibleCases.find((c) => c.id === selectedId) ?? visibleCases[0] ?? null,
    [visibleCases, selectedId],
  );
  const summary = useMemo(() => (selected ? buildDoctorSummary(selected) : []), [selected]);

  const stats = useMemo(
    () => ({
      waiting: doctorCases.filter((c) => matchesFilter(c, "waiting")).length,
      urgent: doctorCases.filter((c) => c.redFlags.length > 0).length,
      verified: doctorCases.filter((c) => c.status === "approved").length,
    }),
    [doctorCases],
  );

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setAuthReady(true);
    });
    void supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setAccess(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      let current = await fetchStaffAccess(session.user.id);
      if (current.requestStatus === "none") {
        await requestStaffAccess();
        current = await fetchStaffAccess(session.user.id);
      }
      if (!cancelled) setAccess(current);
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const isStaff = access?.isStaff ?? false;
  const isAdmin = access?.isAdmin ?? false;

  const loadRequests = useMemo(
    () => async () => setStaffRequests(await listStaffRequests()),
    [],
  );

  useEffect(() => {
    if (isAdmin) void loadRequests();
  }, [isAdmin, loadRequests]);

  useEffect(() => {
    if (isStaff) void refreshCases();
  }, [isStaff, refreshCases]);

  useEffect(() => {
    if (!isStaff) return;
    const channel = supabase
      .channel("cases-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cases" },
        () => void refreshCases(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isStaff, refreshCases]);

  useEffect(() => {
    if (selected && notes[selected.id] === undefined) {
      setNotes((n) => ({ ...n, [selected.id]: selected.doctorNote ?? "" }));
    }
  }, [selected, notes]);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthBusy(true);
    setAuthMessage(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/doctor` },
        });
        if (error) throw error;
        if (!data.session) {
          setAuthMessage("Check your email and open the confirmation link to finish.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setAuthMessage(err instanceof Error ? err.message : "Could not sign in. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleGoogle() {
    setAuthMessage(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/doctor`,
    });
    if (result.error) setAuthMessage("Google sign-in could not be completed.");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-clinical">
        <AppHeader />
        <main className="mx-auto flex max-w-md flex-col gap-5 px-4 py-16">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Stethoscope className="size-6" aria-hidden />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              {mode === "signup" ? "Create doctor account" : "Doctor sign in"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to see the cases patients submit at the kiosk.
            </p>
            <form className="mt-6 space-y-4" onSubmit={handleEmailAuth}>
              <div className="space-y-2">
                <Label htmlFor="doctor-email" className="text-base font-semibold">
                  Work email
                </Label>
                <Input
                  id="doctor-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.in"
                  className="h-12 rounded-2xl text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-password" className="text-base font-semibold">
                  Password
                </Label>
                <Input
                  id="doctor-password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-2xl text-base"
                  required
                  minLength={6}
                />
              </div>
              {authMessage && (
                <p className="text-sm font-medium text-warning" role="status">
                  {authMessage}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                className="h-14 w-full rounded-2xl text-base"
                disabled={authBusy || !authReady}
              >
                <LogIn className="size-5" aria-hidden />
                {mode === "signup" ? "Create account" : "Sign in"}
              </Button>
            </form>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mt-3 h-14 w-full rounded-2xl border-2 text-base"
              onClick={handleGoogle}
            >
              Continue with Google
            </Button>
            <button
              type="button"
              className="mt-4 w-full text-sm font-semibold text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setAuthMessage(null);
              }}
            >
              {mode === "signup"
                ? "Already have an account? Sign in"
                : "New here? Create a doctor account"}
            </button>
          </div>
          <ClinicalDisclaimer />
        </main>
      </div>
    );
  }

  if (!access || !isStaff) {
    return (
      <div className="min-h-screen bg-clinical">
        <AppHeader
          right={
            <Button variant="outline" size="sm" className="rounded-xl border-2" onClick={handleSignOut}>
              <LogOut className="size-4" aria-hidden />
              Sign out
            </Button>
          }
        />
        <main className="mx-auto flex max-w-md flex-col gap-5 px-4 py-16">
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-card">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ShieldCheck className="size-6" aria-hidden />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              {access ? "Waiting for approval" : "Checking your access…"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {access
                ? `Your request from ${session.user.email ?? "this account"} has been sent. A clinic admin must approve it before you can open patient cases.`
                : "One moment please."}
            </p>
            {access && (
              <Button
                variant="outline"
                className="mt-5 h-12 w-full rounded-2xl border-2"
                disabled={accessBusy}
                onClick={async () => {
                  setAccessBusy(true);
                  setAccess(await fetchStaffAccess(session.user.id));
                  setAccessBusy(false);
                }}
              >
                Check again
              </Button>
            )}
          </div>
          <ClinicalDisclaimer />
        </main>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-clinical">
      <AppHeader
        right={
          <span className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground">
              {session.user.email ?? "Doctor"}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-2"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </Button>
          </span>
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">OPD console</h1>
        <p className="mt-2 text-muted-foreground">
          Each summary is prepared from the patient's own words and their uploaded papers. Verify
          before using it in the consultation.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard icon={<Users className="size-5" aria-hidden />} value={stats.waiting} label="Waiting now" />
          <StatCard
            icon={<TriangleAlert className="size-5" aria-hidden />}
            value={stats.urgent}
            label="With urgent flags"
            tone="danger"
          />
          <StatCard
            icon={<CheckCircle2 className="size-5" aria-hidden />}
            value={stats.verified}
            label="Verified today"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[20rem_1fr]">
          <aside className="space-y-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search patient name"
                aria-label="Search patient name"
                className="h-11 rounded-2xl pl-9 text-base"
              />
            </div>

            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Queue filter">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-colors",
                    filter === f.id
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {visibleCases.map((c) => {
                const active = selected?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(c.id);
                      setTab("summary");
                    }}
                    className={cn(
                      "w-full rounded-2xl border-2 p-4 text-left transition-colors",
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-card hover:border-primary",
                    )}
                  >
                    <span className="block text-base font-semibold text-foreground">
                      {c.profile.name || "Unnamed patient"}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {c.profile.age ? `${c.profile.age} yrs` : "Age not given"}
                      {c.profile.gender ? ` · ${c.profile.gender}` : ""}
                      {c.queueTime ? ` · ${c.queueTime}` : ""}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-2">
                      <StatusPill status={c.status} />
                      {c.redFlags.length > 0 && (
                        <span className="rounded-full border border-warning/40 bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning">
                          {c.redFlags.length} urgent flag{c.redFlags.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {c.documents.length > 0 && (
                        <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                          {c.documents.length} paper{c.documents.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
              {visibleCases.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
                  No cases match this filter.
                </p>
              )}
            </div>
          </aside>

          <section className="space-y-5">
            {!selected ? (
              <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
                <ClipboardList className="mx-auto size-8 text-muted-foreground" aria-hidden />
                <p className="mt-3 font-medium text-foreground">Select a case to review</p>
              </div>
            ) : (
              <>
                {selected.redFlags.length > 0 && <RedFlagCard flags={selected.redFlags} />}

                <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {selected.profile.name || "Unnamed patient"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {[
                          selected.profile.age ? `${selected.profile.age} yrs` : null,
                          selected.profile.gender,
                          selected.profile.city,
                          selected.profile.abhaId ? `ABHA ${selected.profile.abhaId}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <span className="mt-2 inline-flex">
                        <StatusPill status={selected.status} />
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-2xl border-2"
                      onClick={() => window.print()}
                    >
                      <Printer className="size-4" aria-hidden />
                      Print
                    </Button>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-b border-border pb-3">
                    {(
                      [
                        { id: "summary" as const, label: "Summary", icon: ClipboardList },
                        { id: "documents" as const, label: `Papers (${selected.documents.length})`, icon: FileText },
                        { id: "interview" as const, label: "Interview", icon: MessageSquareText },
                      ]
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition-colors",
                          tab === t.id
                            ? "bg-primary-soft text-primary"
                            : "text-muted-foreground hover:bg-surface",
                        )}
                      >
                        <t.icon className="size-4" aria-hidden />
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {tab === "summary" && (
                    <ul className="mt-5 space-y-3">
                      {summary.map((item) => (
                        <li
                          key={item.label}
                          className={cn(
                            "rounded-2xl border px-4 py-3",
                            item.flagged
                              ? "border-danger/40 bg-danger-soft/40"
                              : "border-border bg-surface",
                          )}
                        >
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="mt-0.5 text-base text-foreground">{item.value}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Source: {item.source}</p>
                        </li>
                      ))}
                      {summary.length === 0 && (
                        <li className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
                          This case has no answers recorded yet.
                        </li>
                      )}
                    </ul>
                  )}

                  {tab === "documents" && (
                    <div className="mt-5 space-y-3">
                      {selected.documents.map((doc) => (
                        <div key={doc.id} className="rounded-2xl border border-border bg-surface p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-base font-semibold text-foreground">{doc.kind}</p>
                            <p className="text-xs text-muted-foreground">
                              {[doc.facility, doc.documentDate].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          {doc.storagePath && (
                            <DocumentPhoto path={doc.storagePath} label={doc.kind} />
                          )}
                          <ul className="mt-3 space-y-2">
                            {doc.fields.map((f) => (
                              <li
                                key={`${doc.id}-${f.label}`}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2"
                              >
                                <span className="text-sm text-foreground">
                                  <span className="font-semibold">{f.label}:</span> {f.value}
                                </span>
                                <ConfidenceBadge confidence={f.confidence} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {selected.documents.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
                          This patient did not upload any papers.
                        </p>
                      )}
                    </div>
                  )}

                  {tab === "interview" && (
                    <div className="mt-5 space-y-4">
                      {SECTIONS.map((section) => {
                        const rows = selected.answers.filter((a) => a.section === section.id);
                        if (rows.length === 0) return null;
                        return (
                          <div key={section.id}>
                            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                              {section.title}
                            </h3>
                            <ul className="mt-2 space-y-2">
                              {rows.map((a) => (
                                <li
                                  key={a.questionId}
                                  className="rounded-2xl border border-border bg-surface px-4 py-3"
                                >
                                  <p className="text-sm text-muted-foreground">{a.question}</p>
                                  <p className="mt-0.5 text-base text-foreground">
                                    {a.skipped ? "Skipped" : String(a.value)}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                      {selected.answers.length === 0 && (
                        <p className="rounded-2xl border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
                          No interview answers recorded.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="doctor-note" className="text-base font-semibold">
                        Consultation note
                      </Label>
                      {noteSavedAt === selected.id && (
                        <span className="text-xs font-medium text-success">Saved</span>
                      )}
                    </div>
                    <Textarea
                      id="doctor-note"
                      value={notes[selected.id] ?? ""}
                      onChange={(e) =>
                        setNotes((n) => ({ ...n, [selected.id]: e.target.value }))
                      }
                      placeholder="Add your own observation before verifying this summary."
                      className="min-h-24 rounded-2xl text-base"
                    />
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl border-2"
                      onClick={() => {
                        saveNote(selected.id, notes[selected.id] ?? "");
                        setNoteSavedAt(selected.id);
                      }}
                    >
                      Save note
                    </Button>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      size="lg"
                      className="h-12 rounded-2xl"
                      onClick={() => {
                        saveNote(selected.id, notes[selected.id] ?? "");
                        setCaseStatus(selected.id, "approved");
                      }}
                      disabled={selected.status === "approved"}
                    >
                      <CheckCircle2 className="size-5" aria-hidden />
                      Verify summary
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 rounded-2xl border-2"
                      onClick={() => {
                        saveNote(selected.id, notes[selected.id] ?? "");
                        setCaseStatus(selected.id, "rejected");
                      }}
                      disabled={selected.status === "rejected"}
                    >
                      <XCircle className="size-5" aria-hidden />
                      Send back for correction
                    </Button>
                  </div>
                </div>

                <HealthTimeline record={selected} />

                <ClinicalDisclaimer />
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
