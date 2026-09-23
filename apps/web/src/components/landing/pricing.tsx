import { Check } from "lucide-react";

import { GetStartedButton } from "./get-started-button";
import { SectionHeading } from "./section-heading";

const freeFeatures = [
  "Unlimited groups and expenses",
  "Simplified settle-up",
  "Smart categories",
  "AI expense capture",
];

const proFeatures = [
  "Everything in Free",
  "Receipt scanning",
  "AI insights and assistant",
  "Multi-currency and recurring",
];

function FeatureList({ items, inverted }: { items: string[]; inverted?: boolean }) {
  return (
    <ul
      className={`flex flex-col gap-2.5 text-sm ${inverted ? "text-primary-foreground/80" : "text-foreground/80"}`}
    >
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5">
          <Check className="h-4 w-4 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-8 px-6 md:px-12 lg:px-20 pt-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-14">
        <SectionHeading
          badge="Pricing"
          title={
            <>
              Free to split. <em className="italic">Pro</em> to go further.
            </>
          }
        />
        <div className="grid w-full max-w-[880px] grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-9">
            <span className="text-[15px] font-semibold text-foreground">Free</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-6xl leading-none text-foreground">₹0</span>
              <span className="text-sm text-muted-foreground">forever</span>
            </div>
            <FeatureList items={freeFeatures} />
            <GetStartedButton
              label="Get started"
              className="mt-auto rounded-full border border-border px-6 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-4 rounded-2xl bg-primary p-9 text-primary-foreground shadow-[0_25px_80px_-12px_rgba(46,89,70,0.35)]">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">Pro</span>
              <span className="rounded-full bg-primary-foreground px-2.5 py-0.5 text-xs text-primary">
                Coming soon
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-6xl italic leading-none">Soon</span>
            </div>
            <FeatureList items={proFeatures} inverted />
            <GetStartedButton
              label="Start free today"
              className="mt-auto rounded-full bg-primary-foreground px-6 py-3 text-center text-sm font-medium text-primary transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
