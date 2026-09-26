import { cn } from "@settle/ui/lib/utils";

/** Share of the budget used at which a category starts to warn. */
export const WARN_AT = 0.8;

export function budgetState(spent: number, budget: number | null) {
  if (!budget || budget <= 0) return { ratio: 0, level: "none" as const };
  const ratio = spent / budget;
  return { ratio, level: ratio > 1 ? ("over" as const) : ratio >= WARN_AT ? ("warn" as const) : ("ok" as const) };
}

/**
 * A spent-vs-budget bar. The tick marks how much of the budget "should" be
 * used by today, so being ahead of pace is visible before going over.
 */
export function BudgetBar({
  spent,
  budget,
  pace,
  color,
  className,
}: {
  spent: number;
  budget: number;
  /** 0..1 through the month; omit to hide the pace tick. */
  pace?: number;
  color?: string;
  className?: string;
}) {
  const { ratio, level } = budgetState(spent, budget);
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={budget}
      aria-valuenow={spent}
      aria-label="Budget used"
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
    >
      <span
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-[width]",
          level === "over" && "bg-destructive",
          level === "warn" && "bg-amber-500",
        )}
        style={{
          width: `${Math.min(ratio, 1) * 100}%`,
          backgroundColor: level === "ok" ? (color ?? "var(--primary)") : undefined,
        }}
      />
      {pace !== undefined && pace > 0 && pace < 1 && (
        <span className="absolute inset-y-0 w-0.5 bg-foreground/40" style={{ left: `${pace * 100}%` }} aria-hidden />
      )}
    </div>
  );
}
