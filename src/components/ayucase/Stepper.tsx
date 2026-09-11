import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppHeader } from "./Brand";
import { CaptionBar, PatientA11yBar } from "./Accessibility";

export const CASE_STEPS = [
  { id: "profile", hi: "पहचान", en: "Identify" },
  { id: "symptoms", hi: "लक्षण", en: "Symptoms" },
  { id: "history", hi: "इतिहास", en: "History" },
  { id: "documents", hi: "दस्तावेज़", en: "Documents" },
  { id: "review", hi: "डॉक्टर समीक्षा", en: "Doctor Review" },
] as const;

export type StepId = (typeof CASE_STEPS)[number]["id"];

function indexOf(step: StepId) {
  return CASE_STEPS.findIndex((s) => s.id === step);
}

export function stepProgress(step: StepId) {
  const i = indexOf(step);
  return {
    label: `${CASE_STEPS[i]?.hi} · Step ${i + 1}/${CASE_STEPS.length}`,
    percent: Math.round(((i + 1) / CASE_STEPS.length) * 100),
  };
}

function Marker({ state, index }: { state: "done" | "active" | "todo"; index: number }) {
  return (
    <span
      className={cn(
        "flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-2xl border-2 text-sm font-bold transition-colors",
        state === "done" && "border-primary bg-primary text-primary-foreground",
        state === "active" &&
          "border-warning bg-warning text-warning-foreground shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-warning)_22%,transparent)]",
        state === "todo" && "border-border bg-card text-muted-foreground",
      )}
      aria-current={state === "active" ? "step" : undefined}
    >
      {state === "done" ? <Check className="size-5" aria-hidden /> : index + 1}
    </span>
  );
}

/** Large horizontal stepper — used on mobile. */
export function Stepper({ current }: { current: StepId }) {
  const currentIndex = indexOf(current);
  return (
    <nav aria-label="Case progress" className="w-full lg:hidden">
      <ol className="flex items-start gap-1">
        {CASE_STEPS.map((step, index) => {
          const state = index < currentIndex ? "done" : index === currentIndex ? "active" : "todo";
          return (
            <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
              <div className="flex w-full items-center gap-1">
                <span
                  aria-hidden
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    index === 0 ? "opacity-0" : index <= currentIndex ? "bg-primary" : "bg-border",
                  )}
                />
                <Marker state={state} index={index} />
                <span
                  aria-hidden
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    index === CASE_STEPS.length - 1
                      ? "opacity-0"
                      : index < currentIndex
                        ? "bg-primary"
                        : "bg-border",
                  )}
                />
              </div>
              <span
                lang="hi"
                className={cn(
                  "text-[0.72rem] font-bold leading-tight",
                  state === "todo" ? "text-muted-foreground" : "text-navy",
                )}
              >
                {step.hi}
              </span>
              <span className="hidden text-[0.65rem] font-medium text-muted-foreground sm:block">
                {step.en}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Vertical journey rail — desktop. */
export function JourneyRail({ current }: { current: StepId }) {
  const currentIndex = indexOf(current);
  return (
    <nav
      aria-label="Case journey"
      className="sticky top-32 hidden h-fit w-60 shrink-0 rounded-3xl bg-sidebar p-4 text-sidebar-foreground shadow-lift lg:block"
    >
      <p className="px-1 pb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-warning">
        Patient journey
      </p>
      <ol className="space-y-1">
        {CASE_STEPS.map((step, index) => {
          const state = index < currentIndex ? "done" : index === currentIndex ? "active" : "todo";
          return (
            <li key={step.id}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5",
                  state === "active" && "bg-sidebar-accent",
                )}
                aria-current={state === "active" ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold",
                    state === "done" && "border-warning/60 bg-warning/20 text-warning",
                    state === "active" && "border-warning bg-warning text-warning-foreground",
                    state === "todo" && "border-sidebar-border text-sidebar-foreground/70",
                  )}
                >
                  {state === "done" ? <Check className="size-4" aria-hidden /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span lang="hi" className="block truncate text-sm font-bold">
                    {step.hi}
                  </span>
                  <span className="block truncate text-[0.7rem] opacity-75">{step.en}</span>
                </span>
              </div>
              {index < CASE_STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "ml-7 block h-3 w-0.5 rounded-full",
                    index < currentIndex ? "bg-warning/70" : "bg-sidebar-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Shared kiosk layout: status bar + header, desktop journey rail,
 * mobile stepper, and the page content.
 */
export function KioskShell({
  step,
  children,
  headerRight,
  wide,
}: {
  step: StepId;
  children: ReactNode;
  headerRight?: ReactNode | undefined;
  wide?: boolean | undefined;
}) {
  return (
    <div className="min-h-screen bg-clinical">
      <AppHeader right={headerRight} progress={stepProgress(step)} />
      <div
        className={cn(
          "mx-auto flex gap-8 px-4 py-6 md:py-8",
          wide ? "max-w-7xl" : "max-w-6xl",
        )}
      >
        <JourneyRail current={step} />
        <main className="min-w-0 flex-1">
          <Stepper current={step} />
          <PatientA11yBar className="mt-6" />
          <CaptionBar className="mt-4" />
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
