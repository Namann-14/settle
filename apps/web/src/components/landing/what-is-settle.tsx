import { GetStartedButton } from "./get-started-button";
import { Reveal, Spotlight } from "./motion";
import { AutoToggle, SettleLine, SplitCoinArt } from "./what-is-demos";

const cardBase = "relative flex h-[320px] flex-col justify-between overflow-hidden rounded-[22px] p-6";

export function WhatIsSettle() {
  return (
    <section id="what" className="scroll-mt-20 px-6 pt-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
          <div className="flex flex-col items-start gap-6">
            <h2 className="font-display text-5xl leading-none tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              What is <em className="italic">Settle</em>?
            </h2>
            <GetStartedButton
              label="Create a group"
              className="btn-shine rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98] cursor-pointer"
            />
          </div>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-[17px]">
            Settle is a shared-expense tracker that keeps every tab fair: log it in plain words,
            see who owes whom, and settle up in the fewest payments.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[2.15fr_1fr_1fr]">
          <Reveal className="md:col-span-2 lg:col-span-1">
            <Spotlight className={`${cardBase} border border-border/60 bg-linear-to-br from-accent via-muted to-secondary/40`}>
              <h3 className="relative z-10 font-display text-[34px] leading-[1.05] text-foreground">Splits that think</h3>
              <SplitCoinArt />
              <p className="relative z-10 max-w-[15rem] text-[15px] leading-relaxed text-muted-foreground">
                Describe an expense like a text message. Settle works out the shares and who paid.
              </p>
            </Spotlight>
          </Reveal>

          <Reveal delay={0.08}>
            <Spotlight inverted className={`${cardBase} bg-accent-foreground text-primary-foreground`}>
              <h3 className="font-display text-[34px] leading-[1.05]">
                Always balanced,
                <br />
                always clear
              </h3>
              <SettleLine />
              <p className="text-[15px] leading-relaxed text-primary-foreground/70">
                Live balances for every member, netted down to the fewest payments.
              </p>
            </Spotlight>
          </Reveal>

          <Reveal delay={0.16}>
            <Spotlight inverted className={`${cardBase} bg-accent-foreground text-primary-foreground`}>
              <h3 className="font-display text-[34px] leading-[1.05]">
                100%
                <br />
                hands-free
              </h3>
              <AutoToggle />
              <p className="text-[15px] leading-relaxed text-primary-foreground/70">
                Rent and Wi‑Fi log themselves every month. Nothing to remember.
              </p>
            </Spotlight>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
