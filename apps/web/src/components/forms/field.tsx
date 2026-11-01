import { cn } from "@settle/ui/lib/utils";

// Form controls for the groups/expenses/settlements dialogs. Plain native
// elements styled like DESIGN.md's inputs (8px corners, hairline stroke,
// Banknote Green focus ring), one size up from the shadcn default so text is
// 14px and phones get a 40px tap target.
export const controlClass =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 sm:h-9 dark:bg-input/30";

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5 text-meta font-medium", className)}>
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function FormError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-meta text-destructive">
      {error instanceof Error ? error.message : String(error)}
    </p>
  );
}

export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY"] as const;
