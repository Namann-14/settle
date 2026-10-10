"use client";

import { useEffect, useRef } from "react";
import {
  LazyMotion,
  MotionConfig,
  animate,
  domAnimation,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { cn } from "@settle/ui/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

// One provider for the whole landing page. `domAnimation` keeps the bundle
// small (no drag/layout) and `strict` makes a stray full `motion.*` import
// throw instead of silently pulling the big build back in.
export function LandingMotion({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}

// Fade and lift once when scrolled into view. Opacity and transform only:
// animating a blur filter repaints the whole block every frame.
export function Reveal({
  children,
  className,
  style,
  delay = 0,
  y = 16,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  y?: number;
}) {
  return (
    <m.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </m.div>
  );
}

// Horizontal bar that grows from the left when scrolled into view.
export function GrowBar({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <m.span
      className={cn("origin-left", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    />
  );
}

// Card with a cursor-following glow and border highlight. The pointer
// position goes through CSS variables so moving the mouse never re-renders.
export function Spotlight({
  children,
  className,
  inverted,
}: {
  children: React.ReactNode;
  className?: string;
  inverted?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  const glow = inverted ? "var(--primary-foreground)" : "var(--primary)";

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn(
        "group/spot relative transition-transform duration-300 ease-out hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, ${glow} ${inverted ? 14 : 9}%, transparent), transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(200px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, ${glow} 60%, transparent), transparent 70%)`,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
        }}
      />
    </div>
  );
}

// Subtle 3D tilt that follows the pointer. Fine pointers only.
export function Tilt({
  children,
  className,
  max = 3,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 120, damping: 18 });
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 120, damping: 18 });

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <m.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 1400 }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {children}
    </m.div>
  );
}

// Counts up from zero when it first scrolls into view. Server HTML holds the
// final value, so it reads correctly without JS.
export function CountUp({
  value,
  prefix = "",
  decimals = 0,
  delay = 0,
  className,
}: {
  value: number;
  prefix?: string;
  decimals?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const format = (n: number) =>
    `${prefix}${n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !inView) return;
    el.textContent = format(0);
    const controls = animate(0, value, {
      duration: 1.4,
      delay,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = format(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value, delay, prefix, decimals]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}

// Pulls its child toward the cursor while hovered (React Bits "Magnet").
export function Magnet({
  children,
  className,
  strength = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 });

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <m.div
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {children}
    </m.div>
  );
}

// Types each phrase, holds, erases, then moves to the next. Writes straight
// to the DOM so a keystroke never triggers a React render.
export function Typewriter({
  phrases,
  className,
}: {
  phrases: string[];
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let phrase = 0;
    let chars = 0;
    let erasing = false;

    const tick = () => {
      if (cancelled) return;
      const text = phrases[phrase];
      chars += erasing ? -1 : 1;
      el.textContent = text.slice(0, chars);
      let wait = erasing ? 18 : 42;
      if (!erasing && chars === text.length) {
        erasing = true;
        wait = 1800;
      } else if (erasing && chars === 0) {
        erasing = false;
        phrase = (phrase + 1) % phrases.length;
        wait = 350;
      }
      timer = setTimeout(tick, wait);
    };

    // Let the first phrase sit for a beat before it starts cycling.
    timer = setTimeout(() => {
      erasing = true;
      chars = phrases[0].length;
      tick();
    }, 2600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phrases, reduced]);

  return (
    <span className={cn("inline-flex min-w-0 items-center", className)}>
      <span ref={ref} className="truncate">
        {phrases[0]}
      </span>
      <span aria-hidden className="ml-px h-3 w-px shrink-0 animate-caret bg-primary" />
    </span>
  );
}
