import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bot, Check, Mic, Send, SkipForward, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AiOrb, ClinicalDisclaimer } from "@/components/ayucase/Brand";
import { KioskShell } from "@/components/ayucase/Stepper";
import { RedFlagCard } from "@/components/ayucase/RedFlagCard";
import {
  ListenButton,
  SignLanguagePanel,
  VisualQuestionCard,
} from "@/components/ayucase/Accessibility";
import { useAyu } from "@/lib/ayucase/store";
import { useA11y } from "@/lib/ayucase/a11y";
import { CONFIRMATIONS, questionBilingual, SCREEN_GUIDE } from "@/lib/ayucase/i18n";
import { buildQuestionFlow, type Question } from "@/lib/ayucase/questions";
import { detectRedFlags } from "@/lib/ayucase/redFlags";
import { SECTIONS } from "@/lib/ayucase/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: "Guided case-taking — AyuCase" },
      {
        name: "description",
        content:
          "A friendly, one-question-at-a-time guided interview that builds a complete patient case history before the OPD consultation.",
      },
      { property: "og:title", content: "Guided case-taking — AyuCase" },
      {
        property: "og:description",
        content: "Answer simple questions with quick-select chips, voice input, or plain text.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InterviewPage,
});

interface Bubble {
  id: string;
  role: "ai" | "patient";
  text: string;
}

function InterviewPage() {
  const navigate = useNavigate();
  const { activeCase, ensureCase, saveAnswer, addRedFlags, settings, hydrated } =
    useAyu();
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [scale, setScale] = useState([5]);
  const [includeAyurveda, setIncludeAyurveda] = useState(true);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingAnswer = useRef<string>("");
  const { say } = useA11y();

  useEffect(() => {
    if (hydrated) ensureCase();
  }, [hydrated, ensureCase]);

  const chiefComplaint = String(
    activeCase?.answers.find((a) => a.questionId === "chief-complaint")?.value ?? "",
  );
  const gender = activeCase?.profile.gender ?? "";

  const flow = useMemo(
    () => buildQuestionFlow(chiefComplaint, gender, includeAyurveda),
    [chiefComplaint, gender, includeAyurveda],
  );

  const answeredIds = useMemo(
    () => new Set((activeCase?.answers ?? []).map((a) => a.questionId)),
    [activeCase],
  );

  const current: Question | undefined = flow[index];
  const done = !current;
  const currentText = current ? questionBilingual(current.id, current.text) : undefined;

  // Skip ahead over questions already answered in a previous session.
  useEffect(() => {
    if (!flow.length) return;
    if (current && answeredIds.has(current.id) && index < flow.length) {
      setIndex((i) => i + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, flow.length]);

  useEffect(() => {
    if (!current) return;
    setBubbles((prev) =>
      prev.some((b) => b.id === `q-${current.id}`)
        ? prev
        : [...prev, { id: `q-${current.id}`, role: "ai", text: current.text }],
    );
    const question = questionBilingual(current.id, current.text);
    if (pendingAnswer.current) {
      const answer = pendingAnswer.current;
      pendingAnswer.current = "";
      say({
        en: `${answer}. ${CONFIRMATIONS.answerSaved.en} ${question.en}`,
        hi: `${answer}. ${CONFIRMATIONS.answerSaved.hi} ${question.hi}`,
      });
    } else if (index === 0) {
      say({
        en: `${SCREEN_GUIDE["interview"]!.title.en} ${SCREEN_GUIDE["interview"]!.instructions.en} ${question.en}`,
        hi: `${SCREEN_GUIDE["interview"]!.title.hi} ${SCREEN_GUIDE["interview"]!.instructions.hi} ${question.hi}`,
      });
    } else {
      say(question);
    }
  }, [current, index, say]);

  useEffect(() => {
    if (!done || !pendingAnswer.current) return;
    const answer = pendingAnswer.current;
    pendingAnswer.current = "";
    say({
      en: `${answer}. Answer saved. All sections are covered. Next, add any old prescriptions or reports.`,
      hi: `${answer}. जवाब सुरक्षित हो गया। सभी सवाल पूरे हो गए हैं। अब पुराने पर्चे या रिपोर्ट जोड़ें।`,
    });
  }, [done, say]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [bubbles]);

  const commit = (value: string, skipped = false) => {
    if (!current) return;
    saveAnswer({
      questionId: current.id,
      section: current.section,
      question: current.text,
      value,
      skipped,
      answeredAt: new Date().toISOString(),
    });
    setBubbles((prev) => [
      ...prev,
      { id: `a-${current.id}`, role: "patient", text: skipped ? "Skipped for now" : value },
    ]);
    if (!skipped) {
      pendingAnswer.current = value;
      const flags = detectRedFlags(value, `Patient interview — "${current.text}"`);
      if (flags.length) {
        addRedFlags(flags);
        toast.warning("Possible urgent symptom noted", {
          description: "Please tell hospital staff. A doctor will review this.",
        });
        say(CONFIRMATIONS.emergency);
      }
    }
    setDraft("");
    setScale([5]);
    setIndex((i) => i + 1);
  };

  const startVoice = () => {
    const SR =
      typeof window !== "undefined" &&
      ((window as unknown as Record<string, unknown>)["SpeechRecognition"] ||
        (window as unknown as Record<string, unknown>)["webkitSpeechRecognition"]);
    if (!SR) {
      toast.info("Voice input is not available in this browser", {
        description: "Please type your answer or pick an option below.",
      });
      say({
        en: "Voice input is not available in this browser. Please type your answer or pick an option.",
        hi: "इस ब्राउज़र में बोलकर जवाब देना उपलब्ध नहीं है। कृपया जवाब लिखें या विकल्प चुनें।",
      });
      return;
    }
    try {
      const recognition = new (SR as new () => any)();
      recognition.lang =
        { en: "en-IN", hi: "hi-IN", mr: "mr-IN", ta: "ta-IN", bn: "bn-IN" }[settings.language] ??
        "en-IN";
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        setDraft(String(event.results[0][0].transcript));
        setListening(false);
      };
      recognition.onerror = () => {
        setListening(false);
        say({
          en: "I could not hear that. Please try again or type your answer.",
          hi: "आवाज़ समझ नहीं आई। कृपया दोबारा बोलें या जवाब लिखें।",
        });
      };
      recognition.onend = () => setListening(false);
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const sectionState = SECTIONS.map((section) => {
    const inFlow = flow.filter((q) => q.section === section.id);
    const answered = inFlow.filter((q) => answeredIds.has(q.id)).length;
    return {
      ...section,
      total: inFlow.length,
      answered,
      complete: inFlow.length > 0 && answered === inFlow.length,
      active: current?.section === section.id,
    };
  }).filter((s) => s.total > 0 || s.optional);

  const totalAnswered = flow.filter((q) => answeredIds.has(q.id)).length;
  const percent = flow.length ? Math.round((totalAnswered / flow.length) * 100) : 0;

  return (
    <KioskShell step={done ? "history" : "symptoms"}>

        {activeCase?.redFlags.length ? (
          <RedFlagCard flags={activeCase.redFlags} className="mt-6" />
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="flex min-h-[32rem] flex-col rounded-3xl border border-border bg-card shadow-card">
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Sparkles className="size-5" aria-hidden />
                </span>
                <div>
                  <h1 className="text-lg font-bold text-foreground">AyuCase assistant</h1>
                  <p className="text-xs text-muted-foreground">
                    One simple question at a time. No medical jargon.
                  </p>
                </div>
              </div>
              {currentText && <ListenButton text={currentText} />}
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
              {bubbles.map((b) => (
                <div
                  key={b.id}
                  className={cn("flex gap-3", b.role === "patient" && "flex-row-reverse")}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      b.role === "ai"
                        ? "bg-primary-soft text-primary"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {b.role === "ai" ? (
                      <Bot className="size-4" aria-hidden />
                    ) : (
                      <User className="size-4" aria-hidden />
                    )}
                  </span>
                  <p
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-base",
                      b.role === "ai"
                        ? "bg-surface text-foreground"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {b.text}
                  </p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <footer className="border-t border-border px-5 py-4">
              {done ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-base font-semibold text-foreground">
                    All sections covered. Thank you.
                  </p>
                  <Button size="lg" className="h-12 rounded-2xl" onClick={() => navigate({ to: "/documents" })}>
                    Add old reports
                    <ArrowRight className="size-5" aria-hidden />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentText && (
                    <VisualQuestionCard text={currentText} icon={current?.id === "chief-complaint" ? "complaint" : "symptoms"} />
                  )}
                  {current?.helper && (
                    <p className="text-sm text-muted-foreground">{current.helper}</p>
                  )}

                  {current?.input === "scale" ? (
                    <div className="rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">1 — very mild</span>
                        <span className="text-3xl font-bold text-primary">{scale[0]}</span>
                        <span className="text-sm text-muted-foreground">10 — worst</span>
                      </div>
                      <Slider
                        value={scale}
                        onValueChange={setScale}
                        min={1}
                        max={10}
                        step={1}
                        className="mt-4"
                        aria-label="Severity from 1 to 10"
                      />
                      <Button
                        className="mt-4 h-12 w-full rounded-2xl text-base"
                        onClick={() => commit(String(scale[0]))}
                      >
                        Confirm {scale[0]} out of 10
                      </Button>
                    </div>
                  ) : (
                    <>
                      {current?.chips?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {current.chips.map((chip) => (
                            <Button
                              key={chip}
                              type="button"
                              variant="outline"
                              onClick={() => commit(chip)}
                              onKeyDown={(event) => {
                                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                                event.preventDefault();
                                const items = Array.from(
                                  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button") ?? [],
                                );
                                const at = items.indexOf(event.currentTarget);
                                const move = event.key === "ArrowRight" ? 1 : -1;
                                items[(at + move + items.length) % items.length]?.focus();
                              }}
                              className="min-h-11 rounded-full border-2 px-4 py-2 text-base font-medium"
                            >
                              {chip}
                            </Button>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="lg"
                          className="h-12 rounded-2xl"
                          onClick={startVoice}
                        >
                          <Mic className="size-5" aria-hidden />
                          {listening ? "Listening…" : "Speak"}
                        </Button>
                        <Input
                          aria-label="Type your answer"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && draft.trim()) commit(draft.trim());
                          }}
                          placeholder="Or type your answer here"
                          className="h-12 min-w-[12rem] flex-1 text-base"
                        />
                        <Button
                          type="button"
                          size="lg"
                          className="h-12 rounded-2xl"
                          disabled={!draft.trim()}
                          onClick={() => commit(draft.trim())}
                        >
                          <Send className="size-5" aria-hidden />
                          Send
                        </Button>
                        {current?.allowSkip !== false && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="lg"
                            className="h-12 rounded-2xl"
                            onClick={() => commit("", true)}
                          >
                            <SkipForward className="size-5" aria-hidden />
                            Skip for now
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </footer>
          </section>

          <aside className="space-y-5">
            <SignLanguagePanel phraseId={current?.id === "chief-complaint" ? "complaint" : "symptoms"} />
            <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold text-foreground">Case Progress</h2>
                <span className="text-sm font-semibold text-primary">{percent}%</span>
              </div>
              <Progress value={percent} className="mt-3" />
              <ul className="mt-4 space-y-2">
                {sectionState.map((s) => (
                  <li
                    key={s.id}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border px-3 py-2.5",
                      s.active
                        ? "border-primary bg-primary-soft"
                        : s.complete
                          ? "border-success/40 bg-success-soft"
                          : "border-border bg-surface",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        s.complete
                          ? "bg-success text-success-foreground"
                          : s.active
                            ? "bg-primary text-primary-foreground"
                            : "bg-border text-muted-foreground",
                      )}
                    >
                      {s.complete ? <Check className="size-3.5" aria-hidden /> : s.answered}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">
                        {s.title}
                        {s.optional && (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            (optional)
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {s.total ? `${s.answered} of ${s.total} answered` : "Not included"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <Label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5">
                <span className="text-sm font-semibold text-foreground">
                  Include Ayurveda section
                </span>
                <Switch checked={includeAyurveda} onCheckedChange={setIncludeAyurveda} />
              </Label>

              <Button
                variant="outline"
                className="mt-4 h-12 w-full rounded-2xl border-2"
                onClick={() => navigate({ to: "/documents" })}
              >
                Go to documents
              </Button>
            </div>

            <ClinicalDisclaimer />
          </aside>
        </div>
    </KioskShell>
  );
}
