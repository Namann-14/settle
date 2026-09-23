import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { Panel } from "@/components/dashboard/panel";

// Placeholders shaped like the overview cards, shown while the route loads
// and while each card's data is still coming back from the API.

export function StatSkeleton({ highlight }: { highlight?: boolean }) {
  const tone = highlight ? "bg-primary-foreground/20" : undefined;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl p-5",
        highlight ? "bg-primary" : "border border-border/70 bg-card",
      )}
    >
      <Skeleton className={cn("h-3 w-24 rounded-full", tone)} />
      <Skeleton className={cn("h-10 w-32 rounded-lg", tone)} />
      <Skeleton className={cn("h-3 w-36 rounded-full", tone)} />
    </div>
  );
}

function HeaderSkeleton({ action }: { action?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-3 w-48 rounded-full" />
      </div>
      {action && <Skeleton className="h-8 w-32 rounded-full" />}
    </div>
  );
}

export function ChartPanelSkeleton() {
  return (
    <Panel className="h-full">
      <HeaderSkeleton action />
      <div className="flex h-60 items-end gap-3 border-b border-border/50 pb-2">
        {[45, 70, 30, 90, 55, 35, 80, 60, 40, 75].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </div>
      <Skeleton className="h-3 w-40 rounded-full" />
    </Panel>
  );
}

export function CategoryPanelSkeleton() {
  return (
    <Panel className="h-full">
      <HeaderSkeleton />
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="flex flex-col gap-3">
        {[60, 48, 40, 52, 36].map((w, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-3.5 rounded-full" style={{ width: `${w}%` }} />
            <Skeleton className="h-3.5 w-8 rounded-full" />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ListRowsSkeleton({ rows = 3, avatar }: { rows?: number; avatar?: boolean }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border/50 py-3 last:border-b-0">
          {avatar && <Skeleton className="size-9 shrink-0 rounded-[10px]" />}
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/5 rounded-full" />
            {avatar && <Skeleton className="h-3 w-1/4 rounded-full" />}
          </div>
          <Skeleton className="h-3.5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function TableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-6 pb-3">
        {["w-1/4", "w-1/6", "w-1/6", "ml-auto w-1/6"].map((w, i) => (
          <Skeleton key={i} className={cn("h-3 rounded-full", w)} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-6 border-t border-border/50 py-3.5">
          <Skeleton className="h-3.5 w-1/4 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3.5 w-14 rounded-full" />
          <Skeleton className="ml-auto h-3.5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <div
      aria-busy
      aria-label="Loading overview"
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-2 py-4 md:px-4 md:py-6"
    >
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-40 rounded-full" />
          <Skeleton className="h-12 w-80 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-60 rounded-full" />
        </div>
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatSkeleton highlight />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartPanelSkeleton />
        </div>
        <CategoryPanelSkeleton />

        <Panel>
          <HeaderSkeleton />
          <ListRowsSkeleton avatar />
        </Panel>
        <Panel className="lg:col-span-2">
          <HeaderSkeleton />
          <TableRowsSkeleton />
        </Panel>

        <Skeleton className="h-52 rounded-2xl lg:col-span-2" />
        <Panel>
          <HeaderSkeleton />
          <ListRowsSkeleton />
        </Panel>
      </div>
    </div>
  );
}
