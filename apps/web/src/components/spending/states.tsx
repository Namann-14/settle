import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { Panel, rowClass } from "@/components/dashboard/panel";

// Loading, error and link pieces shared by the Spending pages, so every data
// region has the same skeleton rhythm, inline retry and quiet panel action.

/** The quiet text action in a PanelHeader's right slot. */
export const quietLinkClass =
  "rounded-md text-xs text-muted-foreground underline-offset-4 outline-none transition-colors duration-150 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50";

/** Placeholder rows shaped like `rowClass` rows (optional leading icon, two lines, amount). */
export function RowsSkeleton({ rows = 4, icon = false }: { rows?: number; icon?: boolean }) {
  return (
    <div aria-busy aria-label="Loading" className="flex flex-col">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={rowClass}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {icon && <Skeleton className="size-8 shrink-0 rounded-full" />}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-2/5 rounded-full" />
              <Skeleton className="h-3 w-1/4 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-3.5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** A panel-sized placeholder: heading lines, then either rows or a chart block. */
export function PanelSkeleton({
  variant = "rows",
  rows = 4,
  className,
}: {
  variant?: "rows" | "chart";
  rows?: number;
  className?: string;
}) {
  return (
    <Panel aria-busy className={className}>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-28 rounded-full" />
        <Skeleton className="h-3 w-44 rounded-full" />
      </div>
      {variant === "chart" ? <Skeleton className="h-56 w-full rounded-xl" /> : <RowsSkeleton rows={rows} icon />}
    </Panel>
  );
}

/** Inline "couldn't load" line with a retry, for use inside a panel. */
export function LoadError({ what, onRetry, className }: { what: string; onRetry: () => void; className?: string }) {
  return (
    <p role="alert" className={cn("py-3 text-sm text-muted-foreground", className)}>
      Couldn’t load {what}.{" "}
      <button
        type="button"
        onClick={onRetry}
        className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        Try again
      </button>
    </p>
  );
}

/** One-line empty state inside a panel. */
export function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="py-3 text-sm text-muted-foreground">{children}</p>;
}
