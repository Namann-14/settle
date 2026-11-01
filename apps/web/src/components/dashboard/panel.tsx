import Link from "next/link";
import type { Route } from "next";

import { cn } from "@settle/ui/lib/utils";

// The dashboard's shared page vocabulary. Every signed-in page is built from
// these so headers, surfaces, figures, tabs and buttons read the same
// everywhere. DESIGN.md ("App surfaces") is the rulebook they implement.

/** Centered page column. `narrow` for single-column pages like Settings. */
export function PageContainer({
  narrow,
  className,
  ...props
}: React.ComponentProps<"div"> & { narrow?: boolean }) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-8 px-1 py-4 md:px-4 md:py-8",
        narrow ? "max-w-3xl" : "max-w-6xl",
        className,
      )}
      {...props}
    />
  );
}

/** Page title, one plain line of context, and the page's primary actions. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col justify-between gap-4 sm:flex-row sm:items-end", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        {description && <p className="text-sm text-pretty text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** Flat, bordered surface. No shadow, no hover lift. */
export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-card-foreground md:px-6 md:py-5",
        className,
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-meta text-pretty text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** A row in a panel list: hairline between rows, none after the last. */
export const rowClass =
  "flex items-center justify-between gap-4 border-b border-border/50 py-3 text-sm last:border-b-0";

type Tone = "positive" | "negative" | "muted";
const toneClass: Record<Tone, string> = {
  positive: "text-primary",
  negative: "text-destructive",
  muted: "text-muted-foreground",
};

export interface Figure {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  /** Money figures are set in the serif; counts and names in Inter. */
  money?: boolean;
  tone?: Tone;
}

/**
 * A page's few key figures in one ruled strip, cells divided by hairlines.
 * Replaces the old stat tiles: no highlighted tile, no glow, colour only
 * where it carries meaning (owed / owing / over budget).
 */
export function FigureStrip({ figures, className }: { figures: Figure[]; className?: string }) {
  return (
    <dl
      className={cn(
        "grid divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card sm:divide-x sm:divide-y-0",
        figures.length === 2 && "sm:grid-cols-2",
        figures.length === 3 && "sm:grid-cols-3",
        figures.length >= 4 && "sm:grid-cols-2 sm:divide-y lg:grid-cols-4 lg:divide-y-0",
        className,
      )}
    >
      {figures.map((f) => (
        <div
          key={f.label}
          className="grid min-w-0 grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 px-5 py-3 sm:flex sm:flex-col sm:items-stretch sm:gap-1.5 sm:py-4 md:px-6"
        >
          <dt className="text-meta text-muted-foreground">{f.label}</dt>
          <dd
            className={cn(
              "truncate text-right tabular-nums sm:text-left",
              f.money ? "font-display text-2xl leading-none sm:text-figure" : "text-lg leading-7 font-semibold tracking-tight sm:text-xl",
              f.tone && toneClass[f.tone],
            )}
          >
            {f.value}
          </dd>
          {f.hint && <dd className="col-span-2 truncate text-xs text-muted-foreground">{f.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}

export function FigureStripSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      aria-hidden
      className={cn(
        "grid divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card sm:divide-x sm:divide-y-0",
        count === 3 && "sm:grid-cols-3",
        count === 2 && "sm:grid-cols-2",
        count >= 4 && "sm:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-2.5 px-5 py-4 md:px-6">
          <span className="h-3 w-24 animate-pulse rounded-full bg-muted" />
          <span className="h-7 w-28 animate-pulse rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  );
}

const buttonBase =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";
const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/85",
  secondary: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-destructive/10 text-destructive hover:bg-destructive/15",
} as const;
const buttonSizes = {
  md: "h-10 px-4 text-sm sm:h-9",
  sm: "h-11 px-3.5 text-xs sm:h-8 [&_svg]:size-3.5",
} as const;

/** Class string for the dashboard's pill buttons (also used on links). */
export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
} = {}) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

const segmentItem =
  "inline-flex h-10 shrink-0 items-center rounded-full px-2.5 text-meta sm:h-8 sm:px-3.5 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/50";
const segmentActive = "bg-accent font-medium text-accent-foreground";
const segmentIdle = "text-muted-foreground hover:text-foreground";
const segmentTrack =
  "inline-flex max-w-full gap-0.5 overflow-x-auto rounded-full border border-border bg-card p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/** Filter control: a pill track of mutually exclusive options. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: readonly { id: T; label: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn(segmentTrack, className)}>
      {options.map((o, i) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          // Radio-group keyboard model: one Tab stop, arrows move and select.
          tabIndex={value === o.id ? 0 : -1}
          onClick={() => onChange(o.id)}
          onKeyDown={(e) => {
            const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
            if (!step) return;
            e.preventDefault();
            const next = (i + step + options.length) % options.length;
            onChange(options[next].id);
            (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
          }}
          className={cn(segmentItem, value === o.id ? segmentActive : segmentIdle)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** The same track used as section navigation (e.g. Spending's sub-pages). */
export function SegmentedNav({
  items,
  activeHref,
  label,
  className,
}: {
  items: readonly { href: Route; label: string }[];
  activeHref: string;
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn(segmentTrack, "self-start", className)}>
      {items.map((item) => {
        const active = activeHref === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(segmentItem, active ? segmentActive : segmentIdle)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Search field in the dashboard's pill shape. */
export function SearchField({
  value,
  onChange,
  placeholder,
  icon,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm text-muted-foreground transition-colors focus-within:border-ring sm:h-9",
        className,
      )}
    >
      {icon}
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}
