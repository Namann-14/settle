import { BentoCard } from "./bento";
import { BudgetDemo, SplitModesDemo, SyncDemo } from "./bento-demos";
import { SectionHeading } from "./section-heading";

export function SplitYourWay() {
  return (
    <section id="split" className="scroll-mt-20 px-6 pt-20 md:pt-32 md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-14">
        <SectionHeading
          badge="Split your way"
          title={
            <>
              Every split, <em className="italic">your</em> call
            </>
          }
          description="Pick how a bill is shared, keep an eye on what you spend, and let the whole group see the same numbers."
        />
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.9fr]">
          <BentoCard
            tone="dark"
            title={
              <>
                Budgets that
                <br />
                nudge you
              </>
            }
            description="Set a monthly limit for a category and watch it fill as you spend."
          >
            <BudgetDemo />
          </BentoCard>

          <BentoCard
            tone="dark"
            delay={0.08}
            title={
              <>
                One ledger,
                <br />
                everyone in
              </>
            }
            description="Every member of a group sees the same expenses and balances."
          >
            <SyncDemo />
          </BentoCard>

          <BentoCard
            tone="light"
            delay={0.16}
            className="md:col-span-2 lg:col-span-1"
            title={
              <>
                Equal, shares,
                <br />
                percent or exact
              </>
            }
            description="Change the split and every share updates. Try the tabs."
          >
            <SplitModesDemo />
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
