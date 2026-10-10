"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useInView, useReducedMotion } from "motion/react";
import { Check, Plus } from "lucide-react";

import { cn } from "@settle/ui/lib/utils";

const SPRING = { type: "spring", stiffness: 300, damping: 22 } as const;
const EASE = [0.22, 1, 0.36, 1] as const;

// Shared by the demos: they start when scrolled into view and stop looping
// once someone interacts, so a click is never fought by the autoplay.
function useStart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();
  return { ref, inView, reduced: !!reduced };
}

function Segmented({
  options,
  value,
  onChange,
  dark,
}: {
  options: string[];
  value: number;
  onChange: (i: number) => void;
  dark?: boolean;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex rounded-full p-0.5 text-xs",
        dark ? "bg-primary-foreground/10" : "bg-foreground/[0.06]",
      )}
    >
      {options.map((o, i) => (
        <button
          key={o}
          type="button"
          role="tab"
          aria-selected={value === i}
          onClick={() => onChange(i)}
          className={cn(
            "cursor-pointer rounded-full px-3 py-1 transition-colors duration-200",
            value === i
              ? dark
                ? "bg-primary-foreground text-accent-foreground shadow-sm"
                : "bg-card text-foreground shadow-sm"
              : dark
                ? "text-primary-foreground/70 hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ---- How it works, step 1 ---------------------------------------------

const MEMBERS = ["Y", "R", "A", "K", "S", "M"];

// People join the group one by one; the button invites another.
export function InviteDemo() {
  const { ref, inView, reduced } = useStart();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setCount(3);
      return;
    }
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= 3) clearInterval(t);
    }, 450);
    return () => clearInterval(t);
  }, [inView, reduced]);

  return (
    <div ref={ref} className="flex w-full flex-col gap-3">
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {MEMBERS.slice(0, count).map((p) => (
            <m.span
              key={p}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={SPRING}
              className="flex size-9 items-center justify-center rounded-full border-2 border-card bg-accent text-xs font-semibold text-primary shadow-sm"
            >
              {p}
            </m.span>
          ))}
        </div>
        <button
          type="button"
          aria-label="Invite someone"
          onClick={() => setCount((c) => (c >= MEMBERS.length ? 1 : Math.max(c, 1) + 1))}
          className={cn(
            "flex size-9 cursor-pointer items-center justify-center rounded-full border border-dashed border-primary/50 text-primary transition-transform hover:scale-110 active:scale-95",
            count > 0 && "ml-2",
          )}
        >
          <Plus className="size-4" />
        </button>
      </div>
      <span className="text-xs text-muted-foreground">
        {count === 0 ? "Just you so far" : `${count} in Goa trip`}
      </span>
    </div>
  );
}

// ---- How it works, step 2 ---------------------------------------------

const METHODS = ["Chat", "Receipt", "Form"];

function MethodPanel({ index }: { index: number }) {
  if (index === 0)
    return (
      <div className="self-end rounded-[12px_12px_4px_12px] bg-primary px-3 py-2 text-xs text-primary-foreground">
        Cab to airport ₹640, split with Kabir
      </div>
    );
  if (index === 1)
    return (
      <div className="flex w-full flex-col gap-1 rounded-xl bg-muted p-3 text-xs text-foreground">
        <div className="flex justify-between"><span>Cab fare</span><span>₹600</span></div>
        <div className="flex justify-between"><span>Toll</span><span>₹40</span></div>
        <div className="flex justify-between border-t border-dashed border-secondary pt-1 font-semibold">
          <span>Total</span><span>₹640</span>
        </div>
      </div>
    );
  return (
    <div className="flex w-full flex-col gap-1.5 text-xs">
      {[["Amount", "₹640"], ["Split", "Equally"]].map(([k, v]) => (
        <div key={k} className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5">
          <span className="text-muted-foreground">{k}</span>
          <span className="font-medium text-foreground">{v}</span>
        </div>
      ))}
    </div>
  );
}

// Chat, receipt or form: cycles through them until you pick one.
export function AddMethodsDemo() {
  const { ref, inView, reduced } = useStart();
  const [tab, setTab] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!inView || reduced || manual) return;
    const t = setInterval(() => setTab((x) => (x + 1) % METHODS.length), 2800);
    return () => clearInterval(t);
  }, [inView, reduced, manual]);

  return (
    <div ref={ref} className="flex w-full flex-col gap-3">
      <Segmented
        options={METHODS}
        value={tab}
        onChange={(i) => {
          setManual(true);
          setTab(i);
        }}
      />
      <div className="flex min-h-[84px] items-start">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={tab}
            className="flex w-full"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <MethodPanel index={tab} />
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---- How it works, step 3 ---------------------------------------------

const PAYMENTS = [
  { label: "Kabir pays you", amount: "₹4,600" },
  { label: "You pay Kavya", amount: "₹1,420" },
];

// Mark each payment as done; clearing both settles the group.
export function SettleUpDemo() {
  const { ref, inView, reduced } = useStart();
  const [done, setDone] = useState<boolean[]>([false, false]);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!inView || manual) return;
    if (reduced) {
      setDone([true, true]);
      return;
    }
    const a = setTimeout(() => setDone([true, false]), 1500);
    const b = setTimeout(() => setDone([true, true]), 2700);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [inView, reduced, manual]);

  const all = done.every(Boolean);

  return (
    <div ref={ref} className="flex w-full flex-col gap-2">
      {PAYMENTS.map((p, i) => (
        <div
          key={p.label}
          className="flex items-center justify-between gap-2 rounded-xl bg-card/80 py-2 pl-3 pr-2 text-xs"
        >
          <span className={cn("transition-all", done[i] && "text-muted-foreground line-through")}>
            {p.label} <span className="font-semibold">{p.amount}</span>
          </span>
          <button
            type="button"
            aria-pressed={done[i]}
            onClick={() => {
              setManual(true);
              setDone((d) => d.map((v, j) => (j === i ? !v : v)));
            }}
            className={cn(
              "flex h-6 min-w-[68px] cursor-pointer items-center justify-center gap-1 rounded-full px-2.5 text-[11px] font-medium transition-colors active:scale-95",
              done[i]
                ? "bg-primary text-primary-foreground"
                : "border border-border text-foreground hover:bg-accent",
            )}
          >
            {done[i] ? <><Check className="size-3" /> Paid</> : "Mark paid"}
          </button>
        </div>
      ))}
      <div className="h-5 text-xs font-medium text-primary">
        <AnimatePresence>
          {all && (
            <m.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1"
            >
              <Check className="size-3.5" /> All settled
            </m.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---- Split it your way: split modes -----------------------------------

const MODES = ["Equal", "Shares", "Percent", "Exact"];
const PEOPLE = ["You", "Riya", "Aman"];
const SPLITS: { note: string; values: number[] }[] = [
  { note: "Everyone pays the same", values: [800, 800, 800] },
  { note: "Shares 2 : 1 : 1", values: [1200, 600, 600] },
  { note: "50% · 30% · 20%", values: [1200, 720, 480] },
  { note: "Typed amounts", values: [1000, 900, 500] },
];
const MAX = 1200;

export function SplitModesDemo() {
  const { ref, inView, reduced } = useStart();
  const [mode, setMode] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!inView || reduced || manual) return;
    const t = setInterval(() => setMode((x) => (x + 1) % MODES.length), 2600);
    return () => clearInterval(t);
  }, [inView, reduced, manual]);

  const split = SPLITS[mode];

  return (
    <div ref={ref} className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          options={MODES}
          value={mode}
          onChange={(i) => {
            setManual(true);
            setMode(i);
          }}
        />
        <span className="text-xs text-muted-foreground">Dinner at Toit · ₹2,400</span>
      </div>
      <div className="flex flex-col gap-3">
        {PEOPLE.map((name, i) => (
          <div key={name} className="flex items-center gap-3 text-sm">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card text-[11px] font-semibold text-primary shadow-xs">
              {name[0]}
            </span>
            <span className="w-11 shrink-0 text-foreground">{name}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foreground/[0.07]">
              <m.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${(split.values[i] / MAX) * 100}%` }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
              />
            </div>
            <span className="w-14 shrink-0 text-right font-medium tabular-nums text-foreground">
              ₹{split.values[i].toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{split.note}</span>
    </div>
  );
}

// ---- Split it your way: budget bar ------------------------------------

const LIMIT = 10000;
const START = 6200;
const STEP = 1200;

function barColor(spent: number) {
  if (spent > LIMIT) return "#ef6a5b";
  if (spent >= LIMIT * 0.8) return "#f5b942";
  return "rgba(255,255,255,0.82)";
}

// A food budget that fills as you add expenses: calm, then amber, then red.
export function BudgetDemo() {
  const [spent, setSpent] = useState(START);
  const over = spent > LIMIT;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-primary-foreground/70">Food · this month</span>
        <span className="font-medium tabular-nums">
          ₹{spent.toLocaleString("en-IN")}
          <span className="text-primary-foreground/50"> / ₹{LIMIT.toLocaleString("en-IN")}</span>
        </span>
      </div>
      <m.div
        className="h-2.5 overflow-hidden rounded-full bg-primary-foreground/15"
        animate={over ? { x: [0, -4, 4, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        key={over ? "over" : "ok"}
      >
        <m.div
          className="h-full rounded-full"
          initial={false}
          animate={{ width: `${Math.min(spent / LIMIT, 1) * 100}%`, backgroundColor: barColor(spent) }}
          transition={{ type: "spring", stiffness: 140, damping: 20 }}
        />
      </m.div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setSpent((s) => (s > LIMIT ? START : s + STEP))}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-primary-foreground px-3.5 py-1.5 text-xs font-medium text-accent-foreground transition-transform hover:-translate-y-px active:scale-95"
        >
          {over ? "Reset" : <><Plus className="size-3.5" /> ₹1,200 dinner</>}
        </button>
        <span className={cn("text-xs transition-colors", over ? "text-[#ef6a5b]" : "text-primary-foreground/60")}>
          {over
            ? `Over by ₹${(spent - LIMIT).toLocaleString("en-IN")}`
            : spent >= LIMIT * 0.8
              ? "Nearly there"
              : "On track"}
        </span>
      </div>
    </div>
  );
}

// ---- Split it your way: group sync ------------------------------------

const LEDGER = [
  ["Groceries", "₹3,180"],
  ["Cab to airport", "₹850"],
  ["Chai", "₹120"],
  ["Wi‑Fi", "₹1,199"],
];

// Add an expense and every member's avatar lights up as it reaches them.
export function SyncDemo() {
  const { ref, inView, reduced } = useStart();
  const [shown, setShown] = useState(1);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const t = setTimeout(() => {
      setShown(2);
      setPulse(1);
    }, 1400);
    return () => clearTimeout(t);
  }, [inView, reduced]);

  const rows = LEDGER.slice(0, shown).reverse();

  return (
    <div ref={ref} className="flex w-full flex-col gap-3">
      <div className="flex min-h-[88px] flex-col gap-1.5 overflow-hidden">
        <AnimatePresence initial={false}>
          {rows.slice(0, 3).map(([name, amount]) => (
            <m.div
              key={name}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="flex justify-between rounded-lg bg-primary-foreground/10 px-3 py-2 text-xs">
                <span>{name}</span>
                <span className="font-semibold">{amount}</span>
              </div>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {["R", "A", "K"].map((p, i) => (
            <span
              key={p}
              className="relative flex size-7 items-center justify-center rounded-full border-2 border-accent-foreground bg-primary-foreground/90 text-[11px] font-semibold text-accent-foreground"
            >
              {p}
              {pulse > 0 && (
                <m.span
                  key={`${pulse}-${i}`}
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-primary-foreground"
                  initial={{ scale: 1, opacity: 0.9 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ delay: 0.3 + i * 0.22, duration: 0.7 }}
                />
              )}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setShown((s) => (s >= LEDGER.length ? 1 : s + 1));
            setPulse((p) => p + 1);
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-primary-foreground px-3.5 py-1.5 text-xs font-medium text-accent-foreground transition-transform hover:-translate-y-px active:scale-95"
        >
          <Plus className="size-3.5" /> Add expense
        </button>
      </div>
    </div>
  );
}
