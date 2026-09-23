import { Check } from "lucide-react";

import { SectionBadge, SectionHeading } from "./section-heading";

const steps = [
  {
    title: "Create a group",
    body: "Start a group for the flat, the Goa trip or date nights, and invite people with a link.",
  },
  {
    title: "Add expenses your way",
    body: "Chat a sentence, scan a receipt or fill a form. Split equally, by shares or exact amounts.",
  },
  {
    title: "Settle up",
    body: "Settle works out the fewest payments needed to clear every balance, then records them.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-8 px-6 md:px-12 lg:px-20 pt-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-14">
        <SectionHeading
          badge="How it works"
          title={
            <>
              Three steps to <em className="italic">even</em>
            </>
          }
        />
        <ol className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((step, i) => {
            const last = i === steps.length - 1;
            return (
              <li
                key={step.title}
                className={
                  last
                    ? "flex flex-col gap-3 rounded-2xl bg-primary p-8 text-primary-foreground shadow-dashboard"
                    : "flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-8"
                }
              >
                <span
                  className={`font-display text-6xl italic leading-none ${last ? "text-primary-foreground/60" : "text-secondary"}`}
                >
                  0{i + 1}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p
                  className={`text-[15px] leading-relaxed ${last ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                >
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

const before = [
  { label: "Aman owes Riya", amount: "₹600" },
  { label: "Riya owes Kabir", amount: "₹600" },
  { label: "Kabir owes Aman", amount: "₹200" },
];

const perks = [
  "Live balances for every member",
  "One-tap record of each settlement",
  "Full history, nothing forgotten",
];

export function SettleShowcase() {
  return (
    <section className="px-6 md:px-12 lg:px-20 pt-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-5">
          <SectionBadge className="self-start">Simplified debts</SectionBadge>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tight text-foreground">
            Fewer payments, <em className="italic">zero</em> awkward maths
          </h2>
          <p className="max-w-md text-base md:text-[17px] leading-relaxed text-muted-foreground">
            When everyone owes everyone, Settle nets it all out. A tangle of IOUs
            becomes one or two transfers.
          </p>
          <ul className="flex flex-col gap-2.5 text-[15px] text-foreground">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-primary">
                  <Check className="h-3 w-3" />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="w-full flex-1 rounded-[22px] p-3.5 backdrop-blur-md"
          style={{
            background: "rgba(255, 255, 255, 0.55)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 25px 80px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 sm:p-7">
            <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Before</span>
            <div className="flex flex-col gap-2 text-sm text-foreground">
              {before.map((row) => (
                <div key={row.label} className="flex justify-between rounded-lg bg-muted px-3.5 py-2.5">
                  <span>{row.label}</span>
                  <span className="font-semibold">{row.amount}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-border/70" />
            <span className="text-xs uppercase tracking-[0.08em] text-primary">After Settle</span>
            <div className="flex items-center justify-between rounded-xl bg-primary px-4 py-3.5 text-[15px] text-primary-foreground">
              <span>Aman pays Kabir</span>
              <span className="font-semibold">₹400</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
