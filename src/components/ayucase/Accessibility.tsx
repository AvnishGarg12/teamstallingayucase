import { useState, type ReactNode } from "react";
import {
  Accessibility,
  AlertTriangle,
  Captions,
  ChevronDown,
  Contrast,
  Ear,
  FileText,
  HandHeart,
  Hospital,
  Languages,
  Square,
  Stethoscope,
  Type,
  Volume2,
  Eye,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAyu, type SpeechRate } from "@/lib/ayucase/store";
import { useA11y, RATE_LABELS } from "@/lib/ayucase/a11y";
import { CONFIRMATIONS, SIGN_PHRASES, type Bilingual, type SignPhrase } from "@/lib/ayucase/i18n";
import { cn } from "@/lib/utils";

const RATES: SpeechRate[] = ["slow", "normal", "fast"];

/* ------------------------------------------------------------------ *
 * Speech speed
 * ------------------------------------------------------------------ */

export function SpeechSpeedControl({ className }: { className?: string }) {
  const { settings, setSettings } = useAyu();
  const { t, say } = useA11y();

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-semibold text-foreground" id="speech-speed-label">
        Speech speed / बोलने की गति
      </p>
      <div
        role="radiogroup"
        aria-labelledby="speech-speed-label"
        className="flex flex-wrap gap-2"
      >
        {RATES.map((rate) => {
          const active = settings.speechRate === rate;
          return (
            <button
              key={rate}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                setSettings({ speechRate: rate });
                say({ en: `Speech speed ${RATE_LABELS[rate].en}`, hi: `बोलने की गति ${RATE_LABELS[rate].hi}` });
              }}
              className={cn(
                "min-h-12 min-w-24 rounded-2xl border-2 px-4 text-base font-semibold transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary",
              )}
            >
              {t(RATE_LABELS[rate])}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Listen / Stop
 * ------------------------------------------------------------------ */

/** Large "Listen" button placed beside every AI question. */
export function ListenButton({
  text,
  className,
  label,
}: {
  text: Bilingual | string;
  className?: string;
  label?: string;
}) {
  const { say } = useA11y();
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      onClick={() => say(text, { force: true })}
      className={cn("h-12 min-w-32 rounded-2xl border-2 border-primary/30 text-base", className)}
      aria-label={label ?? "Listen to this question read aloud"}
    >
      <Volume2 className="size-5" aria-hidden />
      {label ?? "Listen / सुनें"}
    </Button>
  );
}

export function StopAudioButton({ className }: { className?: string }) {
  const { stop } = useA11y();
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={stop}
      className={cn("h-12 rounded-2xl border-2 text-base", className)}
      aria-label="Stop audio guidance speaking now"
    >
      <Square className="size-5" aria-hidden />
      Stop audio / आवाज़ रोकें
    </Button>
  );
}

/* ------------------------------------------------------------------ *
 * Status indicator
 * ------------------------------------------------------------------ */

export function A11yStatusIndicator({ className }: { className?: string }) {
  const { settings } = useAyu();
  const { speaking } = useA11y();
  if (!settings.audioGuide && !settings.visualGuide) return null;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      role="status"
      aria-live="polite"
    >
      {settings.audioGuide && (
        <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-warning px-3 py-1 text-xs font-bold text-warning-foreground">
          <Volume2 className="size-3.5" aria-hidden />
          Audio guidance ON{speaking ? " · speaking" : ""}
        </span>
      )}
      {settings.visualGuide && (
        <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
          <Eye className="size-3.5" aria-hidden />
          Visual guidance ON
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Accessibility menu (top bar)
 * ------------------------------------------------------------------ */

function ToggleRow({
  id,
  icon: Icon,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  icon: React.ElementType;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-4 rounded-2xl border-2 border-border bg-surface px-4 py-3">
      <Label htmlFor={id} className="flex items-start gap-3">
        <Icon className="mt-0.5 size-6 text-primary" aria-hidden />
        <span>
          <span className="block text-base font-semibold text-foreground">{label}</span>
          <span className="block text-xs font-normal text-muted-foreground">{hint}</span>
        </span>
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-describedby={`${id}-hint`} />
      <span id={`${id}-hint`} className="sr-only">
        {hint}
      </span>
    </div>
  );
}

/** Prominent top-bar accessibility button + settings dialog. */
export function AccessibilityButton({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { settings, setSettings } = useAyu();
  const { say, supported } = useA11y();
  const [open, setOpen] = useState(false);
  const active = settings.audioGuide || settings.visualGuide;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="lg"
          className={cn(
            "h-12 rounded-2xl border-2 text-base font-bold",
            active
              ? "border-warning bg-warning text-warning-foreground hover:bg-warning/90"
              : tone === "dark"
                ? "border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                : "border-primary bg-primary-soft text-navy hover:bg-primary-soft/80",
          )}
          aria-label="Open accessibility mode settings"
        >
          <Accessibility className="size-6" aria-hidden />
          Accessibility / सुलभता
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Accessibility className="size-6 text-primary" aria-hidden />
            Accessibility Mode / सुलभता मोड
          </DialogTitle>
          <DialogDescription>
            Turn on the help you need. Nothing is read aloud until you switch Audio Guidance on.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <ToggleRow
            id="a11y-audio"
            icon={Volume2}
            label="Audio Guidance / आवाज़ सहायता"
            hint="Screens, questions and confirmations are read aloud"
            checked={settings.audioGuide}
            onChange={(v) => {
              setSettings({ audioGuide: v });
              if (v) say(CONFIRMATIONS.audioOn, { force: true });
            }}
          />
          <ToggleRow
            id="a11y-visual"
            icon={Ear}
            label="Visual Guidance / दृश्य सहायता"
            hint="Large text, simple icons and captions instead of sound"
            checked={settings.visualGuide}
            onChange={(v) => setSettings({ visualGuide: v })}
          />
          <ToggleRow
            id="a11y-sign"
            icon={HandHeart}
            label="Sign-language assistant / सांकेतिक भाषा"
            hint="Demo: Indian Sign Language guidance for common prompts"
            checked={settings.signPanel}
            onChange={(v) => setSettings({ signPanel: v })}
          />
          <ToggleRow
            id="a11y-large"
            icon={Type}
            label="Large text / बड़े अक्षर"
            hint="Bigger letters everywhere"
            checked={settings.largeText}
            onChange={(v) => setSettings({ largeText: v })}
          />
          <ToggleRow
            id="a11y-contrast"
            icon={Contrast}
            label="High contrast / गहरा रंग"
            hint="Stronger black and white for low vision"
            checked={settings.highContrast}
            onChange={(v) => setSettings({ highContrast: v })}
          />

          <SpeechSpeedControl className="rounded-2xl border-2 border-border bg-surface p-4" />

          <div className="flex flex-wrap gap-2">
            <ListenButton
              label="Test the voice"
              text={CONFIRMATIONS.audioOn}
              className="flex-1"
            />
            <StopAudioButton className="flex-1" />
          </div>

          {!supported && (
            <p className="rounded-2xl border-2 border-warning bg-warning-soft px-4 py-3 text-sm font-semibold text-navy">
              This device cannot speak aloud. Visual Guidance and captions still work.
            </p>
          )}

          <A11yStatusIndicator />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ *
 * Per-screen bar: Audio + Visual Guidance on every patient screen
 * ------------------------------------------------------------------ */

export function PatientA11yBar({ className }: { className?: string }) {
  const { settings, setSettings } = useAyu();
  const { say } = useA11y();

  return (
    <section
      aria-label="Accessibility controls for this screen"
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-3xl border-2 border-primary/25 bg-card px-4 py-3 shadow-card",
        className,
      )}
    >
      <span className="flex items-center gap-2 text-sm font-bold text-navy">
        <Accessibility className="size-5 text-primary" aria-hidden />
        Accessibility / सुलभता
      </span>

      <Label
        htmlFor="bar-audio"
        className="flex min-h-11 items-center gap-2 rounded-2xl border border-border bg-surface px-3 text-sm font-semibold text-foreground"
      >
        <Volume2 className="size-5 text-primary" aria-hidden />
        Audio Guidance
        <Switch
          id="bar-audio"
          checked={settings.audioGuide}
          onCheckedChange={(v) => {
            setSettings({ audioGuide: v });
            if (v) say(CONFIRMATIONS.audioOn, { force: true });
          }}
          aria-label="Audio Guidance: read this screen aloud"
        />
      </Label>

      <Label
        htmlFor="bar-visual"
        className="flex min-h-11 items-center gap-2 rounded-2xl border border-border bg-surface px-3 text-sm font-semibold text-foreground"
      >
        <Eye className="size-5 text-primary" aria-hidden />
        Visual Guidance
        <Switch
          id="bar-visual"
          checked={settings.visualGuide}
          onCheckedChange={(v) => setSettings({ visualGuide: v })}
          aria-label="Visual Guidance: large text, icons and captions"
        />
      </Label>

      <StopAudioButton className="h-11" />
      <A11yStatusIndicator className="ml-auto" />
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Captions & transcript
 * ------------------------------------------------------------------ */

export function CaptionBar({ className }: { className?: string }) {
  const { settings } = useAyu();
  const { caption, transcript } = useA11y();
  const [showTranscript, setShowTranscript] = useState(false);
  if (!settings.audioGuide && !settings.visualGuide) return null;

  return (
    <section
      aria-label="Captions and transcript of audio guidance"
      className={cn("rounded-3xl border-2 border-primary/25 bg-card p-4 shadow-card", className)}
    >
      <div className="flex items-center gap-2">
        <Captions className="size-5 text-primary" aria-hidden />
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-navy">
          Captions / कैप्शन
        </h2>
      </div>
      <p
        className="mt-2 rounded-2xl bg-surface px-4 py-3 text-xl font-semibold leading-snug text-foreground"
        aria-live="polite"
      >
        {caption || "Guidance text will appear here."}
      </p>
      <Button
        type="button"
        variant="ghost"
        className="mt-2 h-11 rounded-2xl text-sm font-semibold"
        aria-expanded={showTranscript}
        onClick={() => setShowTranscript((v) => !v)}
      >
        <ChevronDown className={cn("size-4 transition-transform", showTranscript && "rotate-180")} aria-hidden />
        {showTranscript ? "Hide transcript" : `Show transcript (${transcript.length})`}
      </Button>
      {showTranscript && (
        <ol className="mt-2 max-h-52 space-y-1 overflow-y-auto rounded-2xl bg-surface p-3 text-sm text-foreground">
          {transcript.length ? (
            transcript.map((line, i) => (
              <li key={`${i}-${line.slice(0, 12)}`} className="border-b border-border/60 pb-1">
                {line}
              </li>
            ))
          ) : (
            <li className="text-muted-foreground">Nothing has been read out yet.</li>
          )}
        </ol>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Visual guidance: the spoken question shown big, with an icon
 * ------------------------------------------------------------------ */

const VISUAL_ICONS: Record<SignPhrase["icon"], React.ElementType> = {
  welcome: HandHeart,
  language: Languages,
  complaint: Hospital,
  symptoms: Activity,
  documents: FileText,
  ready: Stethoscope,
  emergency: AlertTriangle,
};

export function VisualQuestionCard({
  text,
  icon = "symptoms",
  children,
}: {
  text: Bilingual | string;
  icon?: SignPhrase["icon"];
  children?: ReactNode;
}) {
  const { settings } = useAyu();
  const { t } = useA11y();
  const Icon = VISUAL_ICONS[icon];
  if (!settings.visualGuide) return null;

  return (
    <section
      aria-label="Visual guidance"
      className="rounded-3xl border-2 border-primary bg-primary-soft p-5"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
          <Icon className="size-9" aria-hidden />
        </span>
        <p className="text-2xl font-bold leading-snug text-navy">{t(text)}</p>
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Sign-language assistant (demo)
 * ------------------------------------------------------------------ */

/**
 * Optional, collapsible Indian Sign Language demo panel. When a phrase gains a
 * `clipUrl` in i18n.ts, the panel plays that clip instead of the animated
 * avatar placeholder — no other change needed.
 */
export function SignLanguagePanel({
  phraseId = "welcome",
  className,
}: {
  phraseId?: string;
  className?: string;
}) {
  const { settings, setSettings } = useAyu();
  const { t } = useA11y();
  const [openPanel, setOpenPanel] = useState(true);
  const [selected, setSelected] = useState(phraseId);

  if (selected !== phraseId && SIGN_PHRASES.some((p) => p.id === phraseId)) {
    setSelected(phraseId);
  }

  if (!settings.signPanel) return null;

  const phrase = SIGN_PHRASES.find((p) => p.id === selected) ?? SIGN_PHRASES[0]!;
  const Icon = VISUAL_ICONS[phrase.icon];

  return (
    <section
      aria-label="Sign-language assistant"
      className={cn("rounded-3xl border-2 border-primary/25 bg-card p-4 shadow-card", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-navy">
            <HandHeart className="size-5 text-primary" aria-hidden />
            Sign-language assistant
          </h2>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            Demo: Indian Sign Language guidance for common prompts.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-11 rounded-2xl text-sm font-semibold"
          aria-expanded={openPanel}
          onClick={() => setOpenPanel((v) => !v)}
        >
          <ChevronDown className={cn("size-4 transition-transform", openPanel && "rotate-180")} aria-hidden />
          {openPanel ? "Hide" : "Show"}
        </Button>
      </div>

      {openPanel && (
        <div className="mt-4 space-y-3">
          {phrase.clipUrl ? (
            <video
              key={phrase.clipUrl}
              src={phrase.clipUrl}
              controls
              playsInline
              className="aspect-video w-full rounded-2xl bg-navy"
              aria-label={`Indian Sign Language clip: ${t(phrase.text)}`}
            />
          ) : (
            <div
              className="flex aspect-video w-full items-center justify-center rounded-2xl bg-kiosk"
              role="img"
              aria-label={`Sign-language avatar demonstrating: ${t(phrase.text)}`}
            >
              <SignAvatar />
            </div>
          )}

          <p className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3 text-lg font-bold text-navy">
            <Icon className="mt-1 size-6 shrink-0 text-primary" aria-hidden />
            {t(phrase.text)}
          </p>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a phrase to sign">
            {SIGN_PHRASES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                aria-pressed={p.id === selected}
                className={cn(
                  "min-h-11 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
                  p.id === selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary",
                )}
              >
                {t(p.text)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <ListenButton label="Listen to this phrase" text={phrase.text} />
            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-2xl text-sm"
              onClick={() => setSettings({ signPanel: false })}
            >
              Turn off sign-language panel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

/** Clean animated placeholder avatar — stands in for real ISL video. */
function SignAvatar() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full p-4" aria-hidden>
      <circle cx="100" cy="34" r="18" fill="var(--color-warning)" />
      <rect x="72" y="58" width="56" height="56" rx="18" fill="var(--color-primary-foreground)" opacity="0.9" />
      <g className="sign-wave-left">
        <rect x="46" y="60" width="18" height="42" rx="9" fill="var(--color-warning)" />
      </g>
      <g className="sign-wave-right">
        <rect x="136" y="60" width="18" height="42" rx="9" fill="var(--color-warning)" />
      </g>
      <circle cx="100" cy="86" r="9" fill="var(--color-primary)" />
    </svg>
  );
}
