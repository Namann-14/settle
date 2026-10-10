"use client";

import { useRef } from "react";
import { m } from "motion/react";

import { useFooterRevealed } from "./footer-reveal";

const WORD = "settle";
const EASE = [0.22, 1, 0.36, 1] as const;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const letter = {
  hidden: { y: "55%", opacity: 0 },
  show: { y: "0%", opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

// Oversized wordmark that sits cropped at the bottom of the footer. Letters
// rise in once; hovering lights the letters under the cursor in the brand
// colour. Pointer position goes through CSS variables, so no re-renders.
// It starts once the sticky footer is being uncovered (`useFooterRevealed`);
// `whileInView` would fire at first paint, while the footer is still hidden.
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useFooterRevealed();

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  const mask = "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), #000, transparent 70%)";

  return (
    <m.div
      ref={ref}
      onPointerMove={onPointerMove}
      variants={container}
      initial="hidden"
      animate={revealed ? "show" : "hidden"}
      className="group/word relative h-[0.6em] select-none overflow-hidden font-display leading-none tracking-[0.05em]"
      style={{ fontSize: "clamp(6rem, 40vw, 28rem)" }}
      aria-hidden
    >
      <div className="flex justify-center text-primary/[0.12]">
        {WORD.split("").map((ch, i) => (
          <m.span key={i} variants={letter} className="inline-block">
            {ch}
          </m.span>
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0 flex justify-center text-primary opacity-0 transition-opacity duration-300 group-hover/word:opacity-100"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {WORD}
      </div>
    </m.div>
  );
}
