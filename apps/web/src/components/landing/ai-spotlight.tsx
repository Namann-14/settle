import { GetStartedButton } from "./get-started-button";
import { GrowBar, Reveal } from "./motion";
import { TypingDots } from "./page-extras";
import { ScrollFx } from "./scroll-effects";

const breakdown = [
  { group: "Flat", width: "w-44", color: "bg-primary-foreground/80" },
  { group: "Goa trip", width: "w-24", color: "bg-secondary" },
  { group: "Friends", width: "w-12", color: "bg-secondary/60" },
];

export function AiSpotlight() {
  return (
    <section className="px-6 md:px-12 lg:px-20 pt-32">
      <ScrollFx scale={[0.92, 1]} offset={["start end", "start 35%"]} className="mx-auto max-w-6xl">
      <Reveal className="flex flex-col gap-12 rounded-[28px] bg-accent-foreground p-8 text-primary-foreground sm:p-12 lg:flex-row lg:items-center lg:gap-16 lg:p-[72px]">
        <div className="flex flex-1 flex-col gap-5">
          <span className="self-start rounded-full border border-primary-foreground/20 px-3.5 py-1 text-[13px] text-primary-foreground/80">
            AI assistant
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tight">
            Ask your money <em className="italic">anything</em>
          </h2>
          <p className="max-w-md text-base md:text-[17px] leading-relaxed text-primary-foreground/70">
            Chat with an assistant that knows your groups, balances and history.
            Get answers, insights and follow-up suggestions.
          </p>
          <GetStartedButton
            label="Try the assistant"
            className="mt-2 self-start rounded-full bg-primary-foreground px-6 py-3 text-sm font-medium text-accent-foreground shadow-md btn-shine hover:shadow-lg active:scale-[0.98] cursor-pointer"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 rounded-[20px] border border-primary-foreground/15 bg-primary-foreground/5 p-5 sm:p-6">
          <Reveal className="self-end" delay={0.3} y={10}>
            <div className="rounded-[16px_16px_4px_16px] bg-primary-foreground px-4 py-3 text-sm text-foreground">
              How much did I spend on food this month?
            </div>
          </Reveal>
          <div className="relative">
          <TypingDots delay={0.55} />
          <Reveal delay={1.15} y={10}>
          <div className="flex flex-col gap-3 rounded-[16px_16px_16px_4px] border border-primary-foreground/15 bg-accent-foreground p-4 text-sm leading-relaxed text-primary-foreground/80">
            <span>
              Your share of food this month is{" "}
              <strong className="text-primary-foreground">₹6,240</strong>, mostly
              from the Flat group.
            </span>
            <div className="flex flex-col gap-1.5 text-xs">
              {breakdown.map((row, i) => (
                <div key={row.group} className="flex items-center gap-2">
                  <span className="w-16">{row.group}</span>
                  <GrowBar className={`h-2 rounded ${row.width} ${row.color}`} delay={1.55 + i * 0.12} />
                </div>
              ))}
            </div>
          </div>
          </Reveal>
          </div>
          <Reveal delay={2} y={8}>
            <div className="flex flex-wrap gap-2 text-xs text-primary-foreground/80">
              {["Who owes me the most?", "Compare with last month"].map((q) => (
                <span
                  key={q}
                  className="cursor-default rounded-full border border-primary-foreground/20 px-3 py-1.5 transition-colors hover:bg-primary-foreground/10"
                >
                  {q}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </Reveal>
      </ScrollFx>
    </section>
  );
}
