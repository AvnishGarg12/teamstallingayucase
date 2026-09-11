import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Contrast,
  Ear,
  FileText,
  HandHeart,
  Lock,
  RotateCcw,
  Stethoscope,
  Type,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AbdmBadge,
  AiOrb,
  ClinicalDisclaimer,
  Logo,
  StatusBar,
} from "@/components/ayucase/Brand";
import { CASE_STEPS } from "@/components/ayucase/Stepper";
import {
  AccessibilityButton,
  CaptionBar,
  ListenButton,
  SignLanguagePanel,
  SpeechSpeedControl,
  StopAudioButton,
  VisualQuestionCard,
} from "@/components/ayucase/Accessibility";
import { RAHUL, MEERA } from "@/lib/ayucase/demoData";
import { useAyu } from "@/lib/ayucase/store";
import { useA11y, useScreenAudio } from "@/lib/ayucase/a11y";
import { CONFIRMATIONS, SCREEN_GUIDE, SIGN_PHRASES } from "@/lib/ayucase/i18n";
import { LANGUAGES } from "@/lib/ayucase/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AyuCase — Your health story, ready before your consultation" },
      {
        name: "description",
        content:
          "AyuCase is a multilingual, AI-assisted pre-consultation and record digitisation kiosk for Indian hospital OPDs. Documentation and triage support only.",
      },
      { property: "og:title", content: "AyuCase — OPD pre-consultation kiosk" },
      {
        property: "og:description",
        content:
          "Capture a complete patient case history, organise old records, and flag urgent symptoms before the doctor visit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { settings, setSettings, startCase, activeCase, loadDemo } = useAyu();
  const { say } = useA11y();
  useScreenAudio(SCREEN_GUIDE["home"]);

  const toggles = [
    {
      key: "audioGuide" as const,
      icon: Volume2,
      label: "Audio Guidance / आवाज़ सहायता",
      hint: "Screens and questions are read aloud",
    },
    {
      key: "visualGuide" as const,
      icon: Ear,
      label: "Visual Guidance / दृश्य सहायता",
      hint: "Large text, icons and captions instead of sound",
    },
    {
      key: "signPanel" as const,
      icon: HandHeart,
      label: "Sign-language assistant / सांकेतिक भाषा",
      hint: "Demo: Indian Sign Language guidance for common prompts",
    },
    {
      key: "largeText" as const,
      icon: Type,
      label: "Large text / बड़े अक्षर",
      hint: "Bigger letters everywhere",
    },
    {
      key: "highContrast" as const,
      icon: Contrast,
      label: "High contrast / गहरा रंग",
      hint: "Stronger black and white",
    },
  ];

  return (
    <div className="min-h-screen bg-kiosk">
      <StatusBar />
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo tone="dark" />
          <div className="flex flex-wrap items-center gap-3">
            <AccessibilityButton tone="dark" />
            <AbdmBadge className="border-warning/40 bg-navy-deep/50 text-primary-foreground" />
          </div>
        </div>


        <section className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex items-center gap-4">
              <AiOrb className="size-14" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-warning">
                OPD Kiosk · स्वागत है
              </p>
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-5xl">
              Your health story, ready before you meet the doctor.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-primary-foreground/85">
              Answer simple questions in your own language, add your old prescriptions and reports,
              and walk into the doctor's room with everything already organised.
            </p>

            <VisualQuestionCard text={SIGN_PHRASES[1]!.text} icon="language" />

            <div className="mt-8 rounded-3xl glass-panel-dark p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-primary-foreground">
                  Choose your language / अपनी भाषा चुनें
                </h2>
                <ListenButton
                  label="Listen / सुनें"
                  text={SIGN_PHRASES[1]!.text}
                  className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25"
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {LANGUAGES.map((lang) => {
                  const active = settings.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSettings({ language: lang.code });
                        say(lang.native);
                      }}

                      aria-pressed={active}
                      className={cn(
                        "min-h-16 rounded-2xl border-2 px-4 py-3 text-left transition-colors",
                        active
                          ? "border-warning bg-warning text-warning-foreground"
                          : "border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground hover:border-warning/70",
                      )}
                    >
                      <span className="block text-lg font-bold">{lang.native}</span>
                      <span className="block text-xs opacity-80">{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                className="h-20 justify-between rounded-3xl bg-warning text-lg font-bold text-warning-foreground hover:bg-warning/90 sm:col-span-2"
                onClick={() => {
                  startCase();
                  navigate({ to: "/consent" });
                }}
              >
                <span className="flex items-center gap-3">
                  <FileText className="size-6" aria-hidden />
                  Start New Case / नया केस शुरू करें
                </span>
                <ArrowRight className="size-6" aria-hidden />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 justify-between rounded-2xl border-2 border-primary-foreground/40 bg-transparent text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={() =>
                  navigate({ to: activeCase?.consentGiven ? "/interview" : "/consent" })
                }
              >
                <span className="flex items-center gap-3">
                  <RotateCcw className="size-5" aria-hidden />
                  Continue Case / जारी रखें
                </span>
                <ArrowRight className="size-5" aria-hidden />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 justify-between rounded-2xl border-2 border-primary-foreground/40 bg-transparent text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={() => navigate({ to: "/doctor" })}
              >
                <span className="flex items-center gap-3">
                  <Stethoscope className="size-5" aria-hidden />
                  Doctor Login
                </span>
                <ArrowRight className="size-5" aria-hidden />
            <div className="mt-8 rounded-3xl border-2 border-warning/30 bg-warning-soft/30 p-6">
              <h2 className="text-lg font-bold text-primary-foreground">
                SIH Presentation: One-click Demo Scenarios
              </h2>
              <p className="mt-1 text-sm text-primary-foreground/80">
                Instantly load pre-filled patient cases for the judges.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-16 justify-between rounded-2xl border-2 border-primary/20 bg-card text-base font-bold text-navy hover:bg-surface"
                  onClick={() => {
                    loadDemo(MEERA);
                    navigate({ to: "/review" });
                  }}
                >
                  <span className="flex flex-col items-start leading-tight">
                    <span>Scenario 1: Meera Sharma</span>
                    <span className="text-xs font-normal opacity-70">Hindi · Chest Pain · Red Flags</span>
                  </span>
                  <ArrowRight className="size-5" aria-hidden />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-16 justify-between rounded-2xl border-2 border-primary/20 bg-card text-base font-bold text-navy hover:bg-surface"
                  onClick={() => {
                    loadDemo(RAHUL);
                    navigate({ to: "/review" });
                  }}
                >
                  <span className="flex flex-col items-start leading-tight">
                    <span>Scenario 2: Rahul Verma</span>
                    <span className="text-xs font-normal opacity-70">English · Fever · Routine</span>
                  </span>
                  <ArrowRight className="size-5" aria-hidden />
                </Button>
              </div>
            </div>
              </Button>
            </div>

            <p className="mt-6 flex items-start gap-2 text-sm text-primary-foreground/80">
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
              Your information is encrypted and shared only with your consent.
            </p>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-lift">
              <h2 className="text-lg font-bold text-navy">Make it easy to use</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Turn these on if reading or hearing is difficult.
              </p>
              <div className="mt-4 space-y-3">
                {toggles.map(({ key, icon: Icon, label, hint }) => (
                  <div
                    key={key}
                    className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <Label htmlFor={key} className="flex items-start gap-3">
                      <Icon className="mt-0.5 size-6 text-primary" aria-hidden />
                      <span>
                        <span className="block text-base font-semibold text-foreground">
                          {label}
                        </span>
                        <span className="block text-xs font-normal text-muted-foreground">
                          {hint}
                        </span>
                      </span>
                    </Label>
                    <Switch
                      id={key}
                      checked={settings[key]}
                      onCheckedChange={(checked) => {
                        setSettings({ [key]: checked });
                        if (key === "audioGuide" && checked)
                          say(CONFIRMATIONS.audioOn, { force: true });
                      }}
                    />
                  </div>
                ))}
              </div>
              <SpeechSpeedControl className="mt-4 rounded-2xl border border-border bg-surface p-4" />
              <div className="mt-3 flex flex-wrap gap-2">
                <StopAudioButton />
              </div>
            </div>

            <CaptionBar />
            <SignLanguagePanel phraseId="welcome" />
            <ClinicalDisclaimer />

            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div aria-hidden className="tricolor-rule mb-4 h-1 w-16 rounded-full" />
              <h2 className="text-lg font-bold text-navy">Your journey today</h2>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                {CASE_STEPS.map((step, i) => (
                  <li key={step.id} className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span>
                      <span lang="hi" className="block text-base font-semibold text-foreground">
                        {step.hi}
                      </span>
                      <span className="block text-xs">{step.en}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
