import { cn } from "@settle/ui/lib/utils";

import { Reveal, Spotlight } from "./motion";

// Card language shared by the landing's "demo" cards (What is Settle, How it
// works, Split it your way): display-serif title top-left, a small
// self-playing demo in the middle, one line of copy at the bottom. Light and
// dark tones alternate so a row never reads as one block.
const TONES = {
  light: "border border-border/60 bg-linear-to-br from-accent via-muted to-secondary/40",
  card: "border border-border/70 bg-card",
  dark: "bg-accent-foreground text-primary-foreground",
} as const;

export function BentoCard({
  tone = "light",
  eyebrow,
  title,
  description,
  delay,
  className,
  children,
}: {
  tone?: keyof typeof TONES;
  eyebrow?: string;
  title: React.ReactNode;
  description: React.ReactNode;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <Reveal delay={delay} className={cn("h-full", className)}>
      <Spotlight
        inverted={dark}
        className={cn(
          "flex h-full min-h-[360px] flex-col gap-4 overflow-hidden rounded-[22px] p-6",
          TONES[tone],
        )}
      >
        <div className="flex flex-col gap-2">
          {eyebrow && (
            <span
              className={cn(
                "text-xs uppercase tracking-[0.08em]",
                dark ? "text-primary-foreground/60" : "text-muted-foreground",
              )}
            >
              {eyebrow}
            </span>
          )}
          <h3 className="font-display text-[34px] leading-[1.05]">{title}</h3>
        </div>
        <div className="flex flex-1 items-center">{children}</div>
        <p
          className={cn(
            "text-[15px] leading-relaxed",
            dark ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      </Spotlight>
    </Reveal>
  );
}
