"use client";

import { useRef } from "react";
import {
  m,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

import { cn } from "@settle/ui/lib/utils";

type Range = [number, number];

function TraceDot({ progress, at }: { progress: MotionValue<number>; at: number }) {
  const on = useTransform(progress, [at - 0.04, at], [0, 1]);
  return (
    <span
      className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${at * 100}%` }}
    >
      <span className="absolute inset-0 rounded-full border border-border bg-background" />
      <m.span className="absolute inset-0 rounded-full bg-primary" style={{ opacity: on, scale: on }} />
    </span>
  );
}

// A line that draws itself as the section scrolls past, lighting a dot when
// it reaches each step. Desktop only, where the steps sit side by side.
export function TraceLine({ steps = 3 }: { steps?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "start 35%"] });
  const spring = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const full = useMotionValue(1);
  // Reduced motion: show the finished line.
  const progress = reduced ? full : spring;

  return (
    <div ref={ref} aria-hidden className="relative -my-4 hidden h-3 w-full lg:block">
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      <m.div
        className="absolute inset-x-0 top-1/2 h-px origin-left bg-primary"
        style={{ scaleX: progress }}
      />
      {Array.from({ length: steps }, (_, i) => (
        <TraceDot key={i} progress={progress} at={(i * 2 + 1) / (steps * 2)} />
      ))}
    </div>
  );
}

function Word({
  word,
  italic,
  progress,
  range,
}: {
  word: string;
  italic?: boolean;
  progress: MotionValue<number>;
  range: Range;
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <>
      <m.span className={cn("inline-block", italic && "italic")} style={{ opacity }}>
        {word}
      </m.span>{" "}
    </>
  );
}

// Headline that fills in word by word as it scrolls into the middle of the
// screen.
export function ScrollWords({
  words,
  className,
}: {
  words: { text: string; italic?: boolean }[];
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "start 48%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  if (reduced) {
    return (
      <span className={className}>
        {words.map((w, i) => (
          <span key={i} className={w.italic ? "italic" : undefined}>
            {w.text}{" "}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <Word
          key={i}
          word={w.text}
          italic={w.italic}
          progress={progress}
          range={[i / words.length, (i + 1) / words.length]}
        />
      ))}
    </span>
  );
}
