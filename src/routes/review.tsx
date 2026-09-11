import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileText,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader, ClinicalDisclaimer, OpdTokenCard } from "@/components/ayucase/Brand";
import { CaptionBar, ListenButton, PatientA11yBar, VisualQuestionCard } from "@/components/ayucase/Accessibility";
import { KioskShell } from "@/components/ayucase/Stepper";
import { ConfidenceBadge } from "@/components/ayucase/ConfidenceBadge";
import { useAyu } from "@/lib/ayucase/store";
import { useA11y, useScreenAudio } from "@/lib/ayucase/a11y";
import { CONFIRMATIONS, SCREEN_GUIDE } from "@/lib/ayucase/i18n";
import { SECTIONS, type Answer, type SectionId } from "@/lib/ayucase/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review & submit your case — AyuCase" },
      {
        name: "description",
        content:
          "Check your details, answers and uploaded reports one last time, correct anything that looks wrong, and send your case to the doctor's queue.",
      },
      { property: "og:title", content: "Review & submit your case — AyuCase" },
      {
        property: "og:description",
        content:
          "A final patient-friendly check of profile, interview answers, documents and red flags before the case reaches the doctor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewPage,
});

function answerText(a: Answer) {
  if (a.skipped) return "Skipped";
  if (Array.isArray(a.value)) return a.value.length ? a.value.join(", ") : "Not answered";
  const v = String(a.value ?? "").trim();
  return v || "Not answered";
}

function ReviewPage() {
  const navigate = useNavigate();
  const { activeCase, ensureCase, updateCase, saveAnswer, submitCase, settings, hydrated } =
    useAyu();
  const [editProfile, setEditProfile] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [done, setDone] = useState(false);
  const { say } = useA11y();
  useScreenAudio(SCREEN_GUIDE["review"], hydrated);

  useEffect(() => {
    if (hydrated) ensureCase();
  }, [hydrated, ensureCase]);

  const profile = activeCase?.profile;
  const answers = activeCase?.answers ?? [];
  const documents = activeCase?.documents ?? [];
  const redFlags = activeCase?.redFlags ?? [];

  const grouped = useMemo(() => {
    return SECTIONS.map((s) => ({
      ...s,
      items: answers.filter((a) => a.section === (s.id as SectionId)),
    })).filter((s) => s.items.length > 0);
  }, [answers]);

  const needsReview = documents.flatMap((d) =>
    d.fields.filter((f) => f.confidence === "Needs Review").map((f) => ({ doc: d.fileName, f })),
  );

  const missingProfile =
    !profile?.name?.trim() || !profile?.age?.trim() || !profile?.mobile?.trim();

  const handleSubmit = () => {
    submitCase();
    setDone(true);
    say(CONFIRMATIONS.caseSent);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-clinical">
        <AppHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <PatientA11yBar />
          <CaptionBar className="mt-4 text-left" />
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-10" aria-hidden />
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Your case has been sent to the doctor
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Please wait in the OPD area. The doctor already has your history, medicines and reports,
            so your consultation will be quicker.
          </p>
          <div className="mt-6 rounded-3xl border border-border bg-card p-5 text-left shadow-card">
            <p className="text-sm text-muted-foreground">Case reference</p>
            <p className="text-lg font-semibold text-foreground">{activeCase?.id}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Sent at {activeCase?.queueTime ?? "just now"} · {answers.length} answers ·{" "}
              {documents.length} document{documents.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="h-14 rounded-2xl text-base">
              <Link to="/">Back to home</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 rounded-2xl border-2 text-base">
              <Link to="/doctor">Open doctor view</Link>
            </Button>
          </div>
          <ClinicalDisclaimer className="mt-8 text-left" />
        </main>
      </div>
    );
  }

  return (
    <KioskShell step="review">

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <section className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Check everything before you send
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                This is what the doctor will see. Read it once, change anything that is wrong, then
                press the send button.
              </p>
              <ListenButton className="mt-4" text={SCREEN_GUIDE["review"]!.instructions} />
            </div>
            <VisualQuestionCard text={SCREEN_GUIDE["review"]!.instructions} icon="ready" />

            {redFlags.length > 0 && (
              <div className="rounded-3xl border-2 border-danger/40 bg-danger-soft p-5">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-danger">
                  <AlertTriangle className="size-5" aria-hidden />
                  Things the doctor should see first ({redFlags.length})
                </h2>
                <ul className="mt-3 space-y-3">
                  {redFlags.map((f) => (
                    <li key={f.id} className="rounded-2xl bg-card/70 p-3">
                      <p className="font-semibold text-foreground">{f.label}</p>
                      <p className="text-sm text-muted-foreground">{f.detail}</p>
                      <p className="mt-1 text-xs text-muted-foreground">From: {f.source}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Profile */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-foreground">Your details</h2>
                <Button
                  variant="outline"
                  className="h-10 gap-2 rounded-xl border-2"
                  onClick={() => setEditProfile((v) => !v)}
                >
                  {editProfile ? <Check className="size-4" aria-hidden /> : <Pencil className="size-4" aria-hidden />}
                  {editProfile ? "Done" : "Change"}
                </Button>
              </div>

              {editProfile ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["name", "Full name"],
                      ["age", "Age"],
                      ["mobile", "Mobile number"],
                      ["city", "City / town"],
                      ["abhaId", "ABHA number (optional)"],
                      ["emergencyContact", "Emergency contact (optional)"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`p-${key}`} className="text-base font-semibold">
                        {label}
                      </Label>
                      <Input
                        id={`p-${key}`}
                        value={(profile?.[key] as string) ?? ""}
                        onChange={(e) =>
                          updateCase({
                            profile: { ...(profile ?? ({} as never)), [key]: e.target.value },
                          })
                        }
                        className="h-12 rounded-2xl text-base"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ["Full name", profile?.name],
                      ["Age", profile?.age],
                      ["Gender", profile?.gender],
                      ["Mobile number", profile?.mobile],
                      ["City / town", profile?.city],
                      ["ABHA number", profile?.abhaId],
                      ["Emergency contact", profile?.emergencyContact],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-surface px-4 py-3">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="text-base font-semibold text-foreground">
                        {String(value ?? "").trim() || "Not given"}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {missingProfile && !editProfile && (
                <p className="mt-4 rounded-2xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
                  Please add your name, age and mobile number before sending.
                </p>
              )}
            </div>

            {/* Answers */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Your answers ({answers.length})
                </h2>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 gap-2 rounded-xl border-2"
                >
                  <Link to="/interview">
                    <Pencil className="size-4" aria-hidden />
                    Back to questions
                  </Link>
                </Button>
              </div>

              {grouped.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-muted-foreground">
                  You have not answered any questions yet.{" "}
                  <Link to="/interview" className="font-semibold text-primary underline">
                    Start the questions
                  </Link>
                  .
                </p>
              ) : (
                <div className="mt-4 space-y-6">
                  {grouped.map((section) => (
                    <div key={section.id}>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                        {section.title}
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {section.items.map((a) => {
                          const editing = editingAnswer === a.questionId;
                          return (
                            <li
                              key={a.questionId}
                              className={cn(
                                "rounded-2xl border px-4 py-3",
                                a.skipped
                                  ? "border-dashed border-border bg-surface"
                                  : "border-border bg-surface",
                              )}
                            >
                              <p className="text-sm font-medium text-muted-foreground">
                                {a.question}
                              </p>
                              {editing ? (
                                <div className="mt-2 space-y-3">
                                  <Textarea
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    className="min-h-24 rounded-2xl text-base"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      className="h-11 rounded-xl"
                                      onClick={() => {
                                        saveAnswer({
                                          ...a,
                                          value: draft,
                                          skipped: false,
                                          answeredAt: new Date().toISOString(),
                                        });
                                        setEditingAnswer(null);
                                      }}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      className="h-11 rounded-xl"
                                      onClick={() => setEditingAnswer(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1 flex items-start justify-between gap-3">
                                  <p className="text-base font-semibold text-foreground">
                                    {answerText(a)}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="shrink-0 gap-1.5 rounded-xl"
                                    onClick={() => {
                                      setDraft(a.skipped ? "" : answerText(a));
                                      setEditingAnswer(a.questionId);
                                    }}
                                  >
                                    <Pencil className="size-4" aria-hidden />
                                    Change
                                  </Button>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Your papers ({documents.length})
                </h2>
                <Button asChild variant="outline" className="h-10 gap-2 rounded-xl border-2">
                  <Link to="/documents">
                    <Pencil className="size-4" aria-hidden />
                    Add or change
                  </Link>
                </Button>
              </div>

              {documents.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-muted-foreground">
                  No prescriptions or reports added. This is fine — you can still send your case.
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {documents.map((doc) => (
                    <li key={doc.id} className="rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5 text-primary" aria-hidden />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{doc.kind}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {doc.facility} · {doc.documentDate}
                          </p>
                        </div>
                      </div>
                      {doc.status === "processing" ? (
                        <p className="mt-3 text-sm text-muted-foreground">Still being read…</p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {doc.fields.map((f) => (
                            <li
                              key={f.label}
                              className="flex items-start justify-between gap-3 rounded-xl bg-card px-3 py-2"
                            >
                              <span className="min-w-0">
                                <span className="block text-xs text-muted-foreground">
                                  {f.label}
                                </span>
                                <span className="block text-sm font-medium text-foreground">
                                  {f.value || "Not mentioned"}
                                </span>
                              </span>
                              <ConfidenceBadge confidence={f.confidence} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {needsReview.length > 0 && (
                <p className="mt-4 rounded-2xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
                  {needsReview.length} detail{needsReview.length === 1 ? "" : "s"} could not be read
                  clearly. Please check them on the documents page.
                </p>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold text-foreground">Ready to send?</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <SummaryRow label="Your details" ok={!missingProfile} />
                <SummaryRow label={`${answers.length} answers`} ok={answers.length > 0} />
                <SummaryRow
                  label={`${documents.length} document${documents.length === 1 ? "" : "s"}`}
                  ok
                />
                <SummaryRow
                  label={`${redFlags.length} urgent point${redFlags.length === 1 ? "" : "s"}`}
                  ok
                />
              </ul>

              <Button
                size="lg"
                className="mt-5 h-16 w-full rounded-2xl text-lg"
                disabled={missingProfile}
                onClick={handleSubmit}
              >
                Send to the doctor
              </Button>
              {missingProfile && (
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Add your name, age and mobile number first.
                </p>
              )}

              <Button
                variant="ghost"
                className="mt-2 h-12 w-full rounded-2xl"
                onClick={() => navigate({ to: "/documents" })}
              >
                Go back
              </Button>

              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-info-soft px-3 py-2.5 text-xs text-info">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                Your information is shared only with the doctor you are visiting today.
              </p>
            </div>

            <ClinicalDisclaimer />
          </aside>
        </div>
    </KioskShell>
  );
}

function SummaryRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full",
          ok ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground",
        )}
        aria-hidden
      >
        {ok ? <Check className="size-3" /> : <AlertTriangle className="size-3" />}
      </span>
      <span className="text-foreground">{label}</span>
    </li>
  );
}
