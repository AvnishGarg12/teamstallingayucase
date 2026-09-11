import { cn } from "@/lib/utils";
import type { Confidence } from "@/lib/ayucase/types";

const styles: Record<Confidence, string> = {
  High: "border-success/40 bg-success-soft text-success",
  Medium: "border-warning/40 bg-warning-soft text-warning",
  "Needs Review": "border-danger/40 bg-danger-soft text-danger",
};

export function ConfidenceBadge({
  confidence,
  className,
}: {
  confidence: Confidence;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles[confidence],
        className,
      )}
    >
      {confidence}
    </span>
  );
}
