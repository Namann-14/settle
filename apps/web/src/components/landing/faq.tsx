import { Plus } from "lucide-react";

import { Reveal } from "./motion";
import { SectionBadge } from "./section-heading";

const faqs = [
  {
    q: "Does Settle move money?",
    a: "No. Settle tracks who owes whom and records settlements. You pay each other the way you already do.",
  },
  {
    q: "How does the AI understand my expenses?",
    a: "Type an expense the way you would text a friend, or scan a receipt. The AI pulls out the amount, payer, people and category, and you confirm before anything is saved.",
  },
  {
    q: "Can I split unevenly?",
    a: "Yes. Split equally, by shares, by percentage or by exact amounts per person.",
  },
  {
    q: "What about different currencies?",
    a: "Add expenses in the currency you paid in. Settle converts them so balances stay in one currency for the group.",
  },
  {
    q: "Who can see my group’s expenses?",
    a: "Only the members of that group. People join a group by invitation.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 px-6 md:px-12 lg:px-20 pt-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:gap-16">
        <Reveal className="flex flex-col gap-4 lg:w-[420px]">
          <SectionBadge className="self-start">FAQ</SectionBadge>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tight text-foreground">
            Questions, <em className="italic">answered</em>
          </h2>
        </Reveal>
        <div className="flex-1 border-b border-border">
          {faqs.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.06} y={10}>
            <details
              name="faq"
              open={i === 0}
              className="faq-item group border-t border-border py-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-135" />
              </summary>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
