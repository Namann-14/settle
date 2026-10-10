import { Check } from "lucide-react";

import { BentoCard } from "./bento";
import { AddMethodsDemo, InviteDemo, SettleUpDemo } from "./bento-demos";
import { Reveal } from "./motion";
import { DebtCollapse } from "./page-extras";
import { TraceLine } from "./scroll-effects";
import { SectionBadge, SectionHeading } from "./section-heading";

const steps = [
  {
    title: "Create a group",
    body: "Start a group for the flat, the Goa trip or date nights, and invite people with a link.",
    tone: "light",
    demo: <InviteDemo />,
  },
  {
    title: "Add expenses your way",
    body: "Chat a sentence, scan a receipt or fill a form. Split equally, by shares or exact amounts.",
    tone: "card",
    demo: <AddMethodsDemo />,
  },
  {
    title: "Settle up",
    body: "Settle works out the fewest payments needed to clear every balance, then records them.",
    tone: "light",
    demo: <SettleUpDemo />,
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 px-6 md:px-12 lg:px-20 pt-20 md:pt-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-14">
        <SectionHeading
          badge="How it works"
          title={
            <>
              Three steps to <em className="italic">even</em>
            </>
          }
        />
        <TraceLine steps={steps.length} />
        <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-3">
          {steps.map((step, i) => (
            <BentoCard
              key={step.title}
              tone={step.tone}
              eyebrow={`Step ${i + 1}`}
              title={step.title}
              description={step.body}
              delay={i * 0.1}
            >
              {step.demo}
            </BentoCard>
          ))}
        </div>
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
    <section className="px-6 md:px-12 lg:px-20 pt-20 md:pt-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <Reveal className="flex flex-1 flex-col gap-5">
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
        </Reveal>

        <Reveal
          delay={0.1}
          className="w-full flex-1 rounded-[22px] p-3.5 backdrop-blur-md"
          style={{
            background: "rgba(255, 255, 255, 0.55)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 25px 80px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-7">
            <DebtCollapse before={before} result={{ label: "Aman pays Kabir", amount: "₹400" }} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
