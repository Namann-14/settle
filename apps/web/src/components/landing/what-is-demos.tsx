"use client";

import { useEffect, useRef, useState } from "react";
import { animate, m, useInView, useReducedMotion } from "motion/react";

import { cn } from "@settle/ui/lib/utils";

import { Coin } from "./coin";

const SPRING = { type: "spring", stiffness: 220, damping: 20 } as const;

// Card 1: a coin that splits in two between friends. Splits once when it
// scrolls into view and again whenever you hover it.
export function SplitCoinArt() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hover, setHover] = useState(false);
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const on = setTimeout(() => setIntro(true), 700);
    const off = setTimeout(() => setIntro(false), 2400);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [inView]);

  const split = hover || intro;
  const people = ["R", "A", "K"];

  return (
    <div
      ref={ref}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="absolute bottom-0 right-0 top-0 w-[58%] min-w-[280px]"
    >
      {/* friends orbiting the coin */}
      <div className="absolute left-1/2 top-1/2 size-[250px] -translate-x-1/2 -translate-y-[42%] animate-[spin_26s_linear_infinite] motion-reduce:animate-none">
        <div className="absolute inset-0 rounded-full border border-dashed border-primary/25" />
        {people.map((p, i) => {
          const angle = (i / people.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <span
              key={p}
              className="absolute left-1/2 top-1/2 -ml-4 -mt-4 size-8"
              style={{ transform: `translate(${Math.cos(angle) * 125}px, ${Math.sin(angle) * 125}px)` }}
            >
              <span className="flex size-8 animate-[spin_26s_linear_infinite_reverse] items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-primary shadow-sm motion-reduce:animate-none">
                {p}
              </span>
            </span>
          );
        })}
      </div>

      <div className="absolute left-1/2 top-1/2 size-[150px] -translate-x-1/2 -translate-y-[42%]">
        <m.div className="absolute inset-0" animate={{ x: split ? -22 : 0, rotate: split ? -6 : 0 }} transition={SPRING}>
          <Coin half="left" id="split-l" />
        </m.div>
        <m.div className="absolute inset-0" animate={{ x: split ? 22 : 0, rotate: split ? 6 : 0 }} transition={SPRING}>
          <Coin half="right" id="split-r" />
        </m.div>
        <m.span
          aria-hidden
          className="absolute -left-12 top-1/2 rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold text-primary shadow-sm"
          animate={{ opacity: split ? 1 : 0, y: split ? -4 : 6 }}
        >
          ₹800
        </m.span>
        <m.span
          aria-hidden
          className="absolute -right-12 top-1/2 rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold text-primary shadow-sm"
          animate={{ opacity: split ? 1 : 0, y: split ? -4 : 6 }}
        >
          ₹800
        </m.span>
      </div>
    </div>
  );
}

const POINTS = 44;

// Card 2: a balance line that gets noisy when an expense lands and settles
// flat. Plays on scroll-in; hover to add another expense.
export function SettleLine() {
  const ref = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  const noise = useRef<number[]>([]);
  const running = useRef<ReturnType<typeof animate> | null>(null);
  const [settled, setSettled] = useState(true);

  const W = 120;
  const H = 36;

  const draw = (amp: number) => {
    const el = path.current;
    if (!el) return;
    let d = "";
    let lastY = H / 2;
    for (let i = 0; i < POINTS; i++) {
      const x = (i / (POINTS - 1)) * W;
      const wave = Math.sin(i * 0.9) * 0.5 + (noise.current[i] ?? 0);
      lastY = H / 2 + wave * amp * 13;
      d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${lastY.toFixed(1)} `;
    }
    el.setAttribute("d", d);
    dot.current?.setAttribute("cy", lastY.toFixed(1));
  };

  const play = () => {
    if (reduced) return;
    running.current?.stop();
    noise.current = Array.from({ length: POINTS }, () => Math.random() - 0.5);
    setSettled(false);
    running.current = animate(1, 0, {
      duration: 2.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: draw,
      onComplete: () => {
        draw(0);
        setSettled(true);
      },
    });
  };

  useEffect(() => {
    draw(0);
    if (inView) play();
    return () => running.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced]);

  return (
    <div ref={ref} onPointerEnter={() => settled && play()} className="absolute right-6 top-[124px] w-[150px]">
      <span
        className={cn(
          "text-[10px] uppercase tracking-wider transition-colors duration-300",
          settled ? "text-primary-foreground/70" : "text-primary-foreground/40",
        )}
      >
        {settled ? "Balanced · ₹0" : "New expense…"}
      </span>
      <svg viewBox={`0 0 ${W + 6} ${H}`} className="mt-1 w-full overflow-visible" aria-hidden>
        <path
          ref={path}
          d={`M0 ${H / 2} L${W} ${H / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-foreground/70"
        />
        <circle ref={dot} cx={W} cy={H / 2} r="2.5" className="fill-primary-foreground/80" />
      </svg>
    </div>
  );
}

// Card 3: an auto-sync switch. On, a dashed ring turns with a dot riding it;
// off, it stops. Click to try it.
export function AutoToggle() {
  const [on, setOn] = useState(true);

  return (
    <div className="absolute right-6 top-6 flex flex-col items-end gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Automatic recurring expenses"
        onClick={() => setOn((v) => !v)}
        className={cn(
          "relative h-6 w-11 cursor-pointer rounded-full p-0.5 transition-colors duration-300",
          on ? "bg-primary-foreground/35" : "bg-primary-foreground/15",
        )}
      >
        <m.span
          className="block size-5 rounded-full bg-primary-foreground shadow"
          animate={{ x: on ? 20 : 0 }}
          transition={SPRING}
        />
      </button>
      <span className="text-[10px] uppercase tracking-wider text-primary-foreground/55">
        Auto · {on ? "On" : "Off"}
      </span>

      <div className="relative mt-3 size-[68px]">
        <div
          className={cn(
            "absolute inset-0 rounded-full border border-dashed border-primary-foreground/35 transition-opacity duration-300 motion-reduce:animate-none",
            on ? "animate-[spin_14s_linear_infinite] opacity-100" : "opacity-40",
          )}
          style={{ animationPlayState: on ? "running" : "paused" }}
        >
          <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-primary-foreground/80" />
        </div>
        <m.div
          className="absolute inset-3 rounded-full border border-primary-foreground/30"
          animate={{ scale: on ? [1, 1.08, 1] : 1, opacity: on ? 1 : 0.4 }}
          transition={on ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        />
      </div>
    </div>
  );
}
