import { Link } from "@tanstack/react-router";
import { Accessibility, Building2, Languages, Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccessibilityButton } from "./Accessibility";
import { useAyu } from "@/lib/ayucase/store";
import { LANGUAGES } from "@/lib/ayucase/types";

/**
 * "Care pulse" emblem — medical cross inside a conversation bubble,
 * ringed by a restrained Indian-pattern geometry.
 */
export function CarePulseMark({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const ring = tone === "dark" ? "var(--color-warning)" : "var(--color-primary)";
  const bubble = tone === "dark" ? "var(--color-warning)" : "var(--color-primary)";
  const cross = tone === "dark" ? "var(--color-navy-deep)" : "var(--color-primary-foreground)";
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="AyuCase care pulse">
      <circle cx="24" cy="24" r="22" fill="none" stroke={ring} strokeOpacity="0.35" strokeWidth="1.5" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="24"
          y1="3.5"
          x2="24"
          y2="7.5"
          stroke={ring}
          strokeOpacity={i % 3 === 0 ? "0.9" : "0.35"}
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${i * 30} 24 24)`}
        />
      ))}
      <path
        d="M24 10c8 0 14 5.4 14 12.2 0 6.8-6 12.2-14 12.2-1.5 0-3-.2-4.3-.6l-6.2 3 1.6-5.3C12 29.3 10 26 10 22.2 10 15.4 16 10 24 10Z"
        fill={bubble}
      />
      <path d="M21.6 16.6h4.8v3.6H30v4.8h-3.6v3.6h-4.8v-3.6H18v-4.8h3.6z" fill={cross} />
    </svg>
  );
}

export function Logo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-2xl",
          tone === "dark" ? "bg-navy-deep/60" : "bg-primary-soft",
        )}
      >
        <CarePulseMark className="size-8" tone={tone} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-xl font-bold tracking-tight",
            tone === "dark" ? "text-primary-foreground" : "text-navy",
          )}
        >
          AyuCase
        </span>
        <span
          className={cn(
            "text-[0.68rem] font-semibold uppercase tracking-[0.18em]",
            tone === "dark" ? "text-warning" : "text-muted-foreground",
          )}
        >
          OPD Pre-consultation
        </span>
      </span>
    </span>
  );
}

/** Minimal abstract AI guide orb — no cartoon character. */
export function AiOrb({ className, active = true }: { className?: string; active?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full",
        "bg-[radial-gradient(circle_at_32%_28%,var(--color-warning),var(--color-primary)_58%,var(--color-navy)_100%)]",
        "shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-primary)_12%,transparent)]",
        active && "orb-pulse",
        className,
      )}
    >
      <span className="absolute inset-[22%] rounded-full bg-card/35 blur-[2px]" />
    </span>
  );
}

export function AbdmBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-info-soft px-3 py-1 text-xs font-semibold text-navy",
        className,
      )}
      title="Data model designed to align with ABDM and FHIR structures. Not connected to any live government system."
    >
      <ShieldCheck className="size-3.5" aria-hidden />
      ABDM / FHIR-ready
    </span>
  );
}

export function ClinicalDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-2xl border border-warning/50 bg-warning-soft px-4 py-3 text-sm text-navy",
        className,
      )}
    >
      <strong className="font-semibold">AyuCase supports documentation and triage.</strong> A doctor
      makes the final clinical decision. AyuCase does not diagnose, prescribe, or claim clinical
      certainty.
    </p>
  );
}

function StatusChip({
  icon: Icon,
  label,
  value,
  tone = "plain",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "plain" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "accent"
          ? "bg-warning text-warning-foreground"
          : "bg-primary-foreground/10 text-primary-foreground",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{label}: </span>
      {value}
    </span>
  );
}

/** Compact hospital status bar: OPD, language, accessibility, progress, session. */
export function StatusBar({ progress }: { progress?: { label: string; percent: number } | undefined }) {
  const { settings } = useAyu();
  const lang = LANGUAGES.find((l) => l.code === settings.language);
  const a11yOn = settings.largeText || settings.highContrast || settings.audioGuide;

  return (
    <div className="bg-navy text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-1.5">
        <StatusChip icon={Building2} label="Facility" value="Hospital OPD · Block A" />
        <StatusChip icon={Languages} label="Language" value={lang?.native ?? "English"} />
        <StatusChip
          icon={Accessibility}
          label="Accessibility mode"
          value={a11yOn ? "Accessibility ON" : "Accessibility"}
          tone={a11yOn ? "accent" : "plain"}
        />
        {progress && (
          <span className="ml-auto flex items-center gap-2 text-xs font-semibold">
            <span className="hidden sm:inline">{progress.label}</span>
            <span className="h-2 w-24 overflow-hidden rounded-full bg-primary-foreground/20">
              <span
                className="block h-full rounded-full bg-warning transition-[width] duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </span>
          </span>
        )}
        <StatusChip
          icon={Lock}
          label="Session"
          value="Secure session"
        />
      </div>
      <div aria-hidden className="tricolor-rule h-[3px] w-full opacity-80" />
    </div>
  );
}

export function AppHeader({
  right,
  progress,
}: {
  right?: React.ReactNode | undefined;
  progress?: { label: string; percent: number } | undefined;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <StatusBar progress={progress} />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" aria-label="AyuCase home">
          <Logo />
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <AbdmBadge className="hidden lg:inline-flex" />
          <AccessibilityButton />
          {right}
        </div>
      </div>
    </header>
  );
}

/** OPD token card shown after registration. */
export function OpdTokenCard({
  name,
  tokenNumber,
  department = "General Medicine",
  queueAhead = 4,
  className,
}: {
  name?: string;
  tokenNumber: string;
  department?: string;
  queueAhead?: number;
  className?: string;
}) {
  const initials =
    (name ?? "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "AC";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-kiosk p-5 text-primary-foreground shadow-lift",
        className,
      )}
    >
      <div aria-hidden className="tricolor-rule absolute inset-x-0 top-0 h-1" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warning">
            OPD Token / ओपीडी टोकन
          </p>
          <p className="mt-1 text-5xl font-bold leading-none">{tokenNumber}</p>
          <p className="mt-3 text-sm font-medium opacity-90">{department}</p>
        </div>
        <span className="flex size-14 items-center justify-center rounded-2xl bg-warning text-xl font-bold text-warning-foreground">
          {initials}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-primary-foreground/15 px-3 py-1">
          {queueAhead} patients ahead / आगे {queueAhead} मरीज़
        </span>
        <span className="rounded-full bg-primary-foreground/15 px-3 py-1">
          Approx. wait {queueAhead * 6} min
        </span>
      </div>
    </div>
  );
}
