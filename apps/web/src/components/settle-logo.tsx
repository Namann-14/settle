import { cn } from "@settle/ui/lib/utils";

// Split-coin mark. Mirrors public/brand/settle-mark.svg but uses theme
// colors so it follows light/dark mode.
export function SettleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("size-6 shrink-0", className)}>
      <path
        d="M12.69 35.31A16 16 0 0 1 35.31 12.69Z"
        transform="translate(-1.6 -1.6)"
        className="fill-primary"
      />
      <path
        d="M35.31 12.69A16 16 0 0 1 12.69 35.31Z"
        transform="translate(1.6 1.6)"
        className="fill-primary/45"
      />
    </svg>
  );
}

export function SettleLogo({
  className,
  markClassName,
  wordmarkClassName,
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2 text-foreground", className)}>
      <SettleMark className={markClassName} />
      <span className={cn("font-display text-2xl leading-none", wordmarkClassName)}>Settle</span>
    </span>
  );
}
