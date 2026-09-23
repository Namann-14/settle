import { cn } from "@settle/ui/lib/utils";

export function SectionBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-border bg-background px-3.5 py-1 text-[13px] text-primary shadow-xs",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  badge,
  title,
  description,
  align = "center",
}: {
  badge: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
      )}
    >
      <SectionBadge>{badge}</SectionBadge>
      <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tight text-foreground max-w-3xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl text-base md:text-[17px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
