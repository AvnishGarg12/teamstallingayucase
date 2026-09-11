import { useState } from "react";
import { AlertTriangle, BellRing, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RedFlag } from "@/lib/ayucase/types";

export function RedFlagCard({ flags, className }: { flags: RedFlag[]; className?: string }) {
  const [notified, setNotified] = useState(false);
  if (!flags.length) return null;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-2xl border-2 border-danger bg-danger-soft p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-7 shrink-0 text-danger" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-danger">
            Urgent symptoms may be present. Please alert hospital staff or seek emergency care
            immediately.
          </h3>
          <ul className="mt-3 space-y-2">
            {flags.map((flag) => (
              <li key={flag.id} className="rounded-xl border border-danger/40 bg-background p-3">
                <p className="font-semibold text-foreground">{flag.label}</p>
                <p className="text-sm text-muted-foreground">{flag.detail}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Source: {flag.source}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setNotified(true)}
              disabled={notified}
            >
              <BellRing className="size-4" aria-hidden />
              Notify Triage Desk
            </Button>
            {notified && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-success">
                <CheckCircle2 className="size-4" aria-hidden />
                Demo only — triage desk alert simulated. Nothing was actually sent.
              </span>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            This is a rule-based safety check on your own words, not a diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
}
