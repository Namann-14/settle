import { Skeleton } from "@settle/ui/components/skeleton";

function ListRowsSkeleton({ rows = 3, avatar }: { rows?: number; avatar?: boolean }) {
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

// Route-level placeholder in the overview's shape: headline, the two-column
// ledger, then the groups and activity lists and the month strip.
export function OverviewSkeleton() {
  return (
    <div
      aria-busy
      aria-label="Loading overview"
      className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-1 py-4 md:px-4 md:py-8"
    >
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-11 w-80 max-w-full rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-full" />
        </div>
        <Skeleton className="h-9 w-64 rounded-full" />
      </div>
      <div className="grid h-64 overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
        <div className="flex flex-col gap-4 px-6 py-5">
          <ListRowsSkeleton avatar />
        </div>
        <div className="hidden flex-col gap-4 border-l border-border px-6 py-5 md:flex">
          <ListRowsSkeleton avatar />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}
