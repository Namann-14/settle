"use client";

import { useEffect, useRef, useState } from "react";
import { m, useInView, useReducedMotion } from "motion/react";
import { ArrowRightLeft, Check } from "lucide-react";

import { cn } from "@settle/ui/lib/utils";

import { Reveal } from "./motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// Burst of small dots from the click point (React Bits "Click Spark" idea).
function spark(host: HTMLElement, x: number, y: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const count = 9;
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("span");
    dot.className = "pointer-events-none absolute size-1 rounded-full bg-primary";
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    host.appendChild(dot);
    const angle = (Math.PI * 2 * i) / count;
    const dist = 22 + Math.random() * 12;
    dot
      .animate(
        [
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          {
            transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0)`,
            opacity: 0,
          },
        ],
        { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      )
      .finished.then(() => dot.remove())
      .catch(() => dot.remove());
  }
}

// Confirm / Edit pills of the AI capture card. Confirms itself once after the
// card scrolls into view; clicking toggles it.
export function ConfirmActions() {
  const wrap = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const inView = useInView(wrap, { once: true, margin: "-80px" });
  const [done, setDone] = useState(false);

  const burst = () => {
    const host = wrap.current;
    const btn = confirmRef.current;
    if (!host || !btn) return;
    const h = host.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    spark(host, b.left - h.left + b.width / 2, b.top - h.top + b.height / 2);
  };

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      setDone(true);
      burst();
    }, 2400);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <div ref={wrap} className="relative mt-1 flex gap-2">
      <button
        ref={confirmRef}
        type="button"
        onClick={() => {
          setDone((d) => !d);
          if (!done) burst();
        }}
        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-primary px-3 py-1 text-primary-foreground transition-transform active:scale-95"
      >
        {done && <Check className="size-3" />}
        {done ? "Confirmed" : "Confirm"}
      </button>
      <button
        type="button"
        className="cursor-pointer rounded-full border border-border px-3 py-1 text-foreground transition-colors hover:bg-accent active:scale-95"
      >
        Edit
      </button>
    </div>
  );
}

// Category pills; the highlight walks through them while visible. Hovering a
// pill takes over.
export function CategoryCycle({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!inView || reduced || hovering) return;
    const t = setInterval(() => setActive((a) => (a + 1) % items.length), 2000);
    return () => clearInterval(t);
  }, [inView, reduced, hovering, items.length]);

  return (
    <div
      ref={ref}
      className="flex flex-wrap gap-2 text-xs"
      onPointerLeave={() => setHovering(false)}
    >
      {items.map((c, i) => (
        <span
          key={c}
          onPointerEnter={() => {
            setHovering(true);
            setActive(i);
          }}
          className={cn(
            "cursor-default rounded-full border px-3 py-1 transition-all duration-300",
            i === active
              ? "scale-105 border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground",
          )}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

const RECEIPT = [
  ["2 × Masala dosa", "₹360"],
  ["1 × Filter coffee", "₹90"],
  ["GST", "₹22.50"],
];

// Receipt lines appear one by one under a scan line, then the total counts up.
export function ReceiptScan() {
  return (
    <div className="relative mt-1.5 flex flex-col gap-1.5 overflow-hidden rounded-xl bg-muted p-3.5 text-xs text-foreground">
      {RECEIPT.map(([label, amount], i) => (
        <m.div
          key={label}
          className="flex justify-between"
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.25 + i * 0.3, ease: EASE }}
        >
          <span>{label}</span>
          <span>{amount}</span>
        </m.div>
      ))}
      <m.div
        className="flex justify-between border-t border-dashed border-secondary pt-1.5 font-semibold"
        initial={{ opacity: 0, scale: 1.15 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 1.2 }}
      >
        <span>Total</span>
        <span>₹472.50</span>
      </m.div>
      <m.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-6 bg-linear-to-b from-transparent via-primary/20 to-transparent"
        initial={{ top: "-30%", opacity: 0 }}
        whileInView={{ top: "110%", opacity: [0, 1, 1, 0] }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.4, delay: 0.1, ease: "easeInOut" }}
      />
    </div>
  );
}

export function CurrencyConvert() {
  return (
    <div className="group/fx relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-muted p-3.5 text-sm text-foreground">
      <span className="font-semibold">€45.00</span>
      <ArrowRightLeft className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-500 group-hover/fx:rotate-180" />
      <span className="font-semibold">INR at today’s rate</span>
      <m.span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/50 to-transparent"
        initial={{ left: "-40%" }}
        whileInView={{ left: "130%" }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1, delay: 0.4, ease: "easeInOut" }}
      />
    </div>
  );
}

const RECURRING = [
  { name: "Flat rent", when: "Monthly · 1st", next: true },
  { name: "Wi‑Fi", when: "Monthly · 5th", next: false },
];

export function RecurringRows() {
  return (
    <div className="flex flex-col text-[13px] text-foreground">
      {RECURRING.map((row, i) => (
        <Reveal key={row.name} delay={0.1 + i * 0.12} y={8}>
          <div
            className={cn(
              "-mx-2 flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-accent/50",
              i === 0 && "border-b border-border/60",
            )}
          >
            <span className="flex items-center gap-2">
              {row.name}
              {row.next && (
                <span className="relative flex size-1.5" title="Next due">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
              )}
            </span>
            <span className="text-muted-foreground">{row.when}</span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
