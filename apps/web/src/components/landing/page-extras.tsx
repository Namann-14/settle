"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { ArrowUp, Check, HandCoins, Receipt, UserPlus } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

// Round button with a progress ring; appears after the first screen.
export function BackToTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  const [show, setShow] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 900));

  return (
    <m.button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      initial={false}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.8, y: show ? 0 : 12 }}
      transition={{ duration: 0.25, ease: EASE }}
      style={{ pointerEvents: show ? "auto" : "none" }}
      className="group fixed bottom-6 right-6 z-40 flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-md backdrop-blur-md transition-colors hover:bg-background"
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
        <m.circle
          cx="22"
          cy="22"
          r="20.5"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ pathLength: progress }}
        />
      </svg>
      <ArrowUp className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </m.button>
  );
}

const ACTIVITY = [
  { icon: Receipt, text: "Riya added Seafood dinner", meta: "₹6,400 · Goa trip" },
  { icon: HandCoins, text: "Kabir settled up with you", meta: "₹4,600" },
  { icon: UserPlus, text: "Kavya joined Flat 4B", meta: "3 members" },
];

// Cycling "live activity" toast that floats over the hero preview.
export function ActivityToasts() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    if (reduced) {
      setIndex(0);
      return;
    }
    const start = setTimeout(() => setIndex(0), 1800);
    const t = setInterval(() => setIndex((i) => (i + 1) % ACTIVITY.length), 4200);
    return () => {
      clearTimeout(start);
      clearInterval(t);
    };
  }, [reduced]);

  const item = ACTIVITY[Math.max(index, 0)];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-5 right-8 z-10 hidden lg:block"
    >
      <AnimatePresence mode="wait">
        {index >= 0 && (
          <m.div
            key={index}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card/95 py-2 pl-2.5 pr-4 text-left shadow-lg backdrop-blur-md"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-primary">
              <item.icon className="size-3.5" />
            </span>
            <span className="flex flex-col">
              <span className="text-[11px] font-medium leading-tight text-foreground">
                {item.text}
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">{item.meta}</span>
            </span>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Three dots that bounce briefly before the assistant's reply lands.
export function TypingDots({ delay = 0.5 }: { delay?: number }) {
  return (
    <m.div
      aria-hidden
      className="absolute left-0 top-0 flex items-center gap-1 rounded-[16px_16px_16px_4px] border border-primary-foreground/15 bg-accent-foreground px-4 py-3.5"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: [0, 1, 1, 0] }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, times: [0, 0.2, 0.75, 1] }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-primary-foreground/60"
          style={{ animationDelay: `${i * 0.12}s`, animationDuration: "0.7s" }}
        />
      ))}
    </m.div>
  );
}

// The "before and after" of simplified debts: the tangle of IOUs gets struck
// out one by one, then the single settling payment lands.
export function DebtCollapse({
  before,
  result,
}: {
  before: { label: string; amount: string }[];
  result: { label: string; amount: string };
}) {
  const [run, setRun] = useState(0);
  const strikeAt = 0.7;
  const resultAt = strikeAt + before.length * 0.3 + 0.2;

  return (
    <div key={run} className="flex flex-col gap-4">
      <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Before</span>
      <div className="flex flex-col gap-2 text-sm text-foreground">
        {before.map((row, i) => (
          <m.div
            key={row.label}
            className="relative flex justify-between rounded-lg bg-muted px-3.5 py-2.5"
            initial={{ opacity: 1 }}
            whileInView={{ opacity: 0.45 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: strikeAt + i * 0.3 }}
          >
            <span>{row.label}</span>
            <span className="font-semibold">{row.amount}</span>
            <m.span
              aria-hidden
              className="absolute inset-x-3 top-1/2 h-px origin-left bg-foreground/70"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.35, delay: strikeAt + i * 0.3, ease: EASE }}
            />
          </m.div>
        ))}
      </div>
      <div className="h-px bg-border/70" />
      <span className="text-xs uppercase tracking-[0.08em] text-primary">After Settle</span>
      <m.div
        className="flex items-center justify-between rounded-xl bg-primary px-4 py-3.5 text-[15px] text-primary-foreground"
        initial={{ opacity: 0, scale: 0.92, y: 8 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: resultAt }}
      >
        <span className="flex items-center gap-2">
          <Check className="size-4" />
          {result.label}
        </span>
        <span className="font-semibold">{result.amount}</span>
      </m.div>
      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        className="cursor-pointer self-start text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Replay
      </button>
    </div>
  );
}
