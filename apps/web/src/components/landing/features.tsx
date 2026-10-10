import {
  CategoryCycle,
  ConfirmActions,
  CurrencyConvert,
  ReceiptScan,
  RecurringRows,
} from "./feature-demos";
import { Reveal, Spotlight } from "./motion";
import { ScrollFx } from "./scroll-effects";
import { SectionHeading } from "./section-heading";

const audiences = ["Roommates", "Trips", "Couples", "Friends", "Teams", "Events"];

export function TrustStrip() {
  return (
    <section id="about" className="border-y border-border bg-card px-6 md:px-12 lg:px-20 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <span className="text-[13px] uppercase tracking-[0.08em] text-muted-foreground">
          Made for every shared tab
        </span>
        <div className="marquee min-w-0 max-w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] md:max-w-[60%]">
          <div className="animate-marquee flex w-max font-display text-xl md:text-2xl text-foreground">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-10 pr-10">
                {audiences.map((name, i) => (
                  <span key={name} className={i % 2 === 1 ? "italic" : undefined}>
                    {name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </span>
  );
}

function FeatureCard({
  eyebrow,
  title,
  delay,
  drift,
  children,
}: {
  eyebrow: string;
  title: string;
  delay?: number;
  drift: [number, number];
  children: React.ReactNode;
}) {
  return (
    <ScrollFx className="h-full" y={drift}>
      <Reveal className="h-full" delay={delay}>
        <Spotlight className="flex h-full flex-col gap-3.5 rounded-2xl border border-border/70 bg-card p-7 hover:shadow-dashboard">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h3 className="font-display text-3xl leading-[1.05] text-foreground">{title}</h3>
          {children}
        </Spotlight>
      </Reveal>
    </ScrollFx>
  );
}

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 px-6 md:px-12 lg:px-20 pt-28">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-14">
        <SectionHeading
          badge="Features"
          title={
            <>
              Everything a shared wallet needs, <em className="italic">nothing</em> it doesn’t
            </>
          }
          description="Log an expense in a sentence. Settle does the maths, keeps the ledger and shows everyone where they stand."
        />

        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* AI capture, wide */}
          <Reveal
            className="rounded-[20px] p-3 backdrop-blur-md md:col-span-2"
            style={{
              background: "rgba(255, 255, 255, 0.55)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              boxShadow: "0 25px 80px -12px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div className="flex h-full flex-col gap-7 rounded-2xl border border-border/60 bg-card p-7 sm:flex-row">
              <div className="flex flex-1 flex-col gap-2.5">
                <Eyebrow>AI expense capture</Eyebrow>
                <h3 className="font-display text-[34px] leading-[1.05] text-foreground">
                  Type it like a text message
                </h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  Settle reads plain language and turns it into a structured, split
                  expense, ready for you to confirm.
                </p>
              </div>
              <div className="flex flex-[1.2] flex-col gap-2.5 rounded-xl bg-muted p-4">
                <Reveal className="self-end" y={10}>
                  <div className="rounded-[14px_14px_4px_14px] bg-primary px-3.5 py-2.5 text-[13px] text-primary-foreground">
                    Dinner at Toit ₹2,400, split with Riya and Aman
                  </div>
                </Reveal>
                <Reveal delay={0.5} y={10}>
                <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3.5 text-xs">
                  <div className="flex justify-between text-[13px] font-semibold text-foreground">
                    <span>Dinner at Toit</span>
                    <span>₹2,400.00</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-full bg-accent px-2 py-0.5 text-primary">Food &amp; Drink</span>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-primary">Split equally</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>You · Riya · Aman</span>
                    <span>₹800 each</span>
                  </div>
                  <ConfirmActions />
                </div>
                </Reveal>
              </div>
            </div>
          </Reveal>

          <FeatureCard eyebrow="Receipt scan" title="Snap the bill, skip the typing" delay={0.08} drift={[26, -26]}>
            <ReceiptScan />
          </FeatureCard>

          <FeatureCard eyebrow="Smart categories" title="Sorted before you ask" delay={0.04} drift={[18, -18]}>
            <CategoryCycle items={["Food", "Rent", "Travel", "Utilities", "Groceries", "Fun"]} />
          </FeatureCard>

          <FeatureCard eyebrow="Multi-currency" title="Travel abroad, settle at home" delay={0.08} drift={[34, -34]}>
            <CurrencyConvert />
          </FeatureCard>

          <FeatureCard eyebrow="Recurring expenses" title="Rent and Wi‑Fi, on autopilot" delay={0.12} drift={[22, -22]}>
            <RecurringRows />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
