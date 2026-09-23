import { SectionHeading } from "./section-heading";

const audiences = ["Roommates", "Trips", "Couples", "Friends", "Teams", "Events"];

export function TrustStrip() {
  return (
    <section id="about" className="border-y border-border bg-card px-6 md:px-12 lg:px-20 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <span className="text-[13px] uppercase tracking-[0.08em] text-muted-foreground">
          Made for every shared tab
        </span>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 font-display text-xl md:text-2xl text-foreground">
          {audiences.map((name, i) => (
            <span key={name} className={i % 2 === 1 ? "italic" : undefined}>
              {name}
            </span>
          ))}
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
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-border/70 bg-card p-7 transition-shadow hover:shadow-dashboard">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="font-display text-3xl leading-[1.05] text-foreground">{title}</h3>
      {children}
    </div>
  );
}

const Pill = ({ children, active }: { children: React.ReactNode; active?: boolean }) => (
  <span
    className={
      active
        ? "rounded-full bg-primary px-3 py-1 text-primary-foreground"
        : "rounded-full border border-border px-3 py-1 text-foreground"
    }
  >
    {children}
  </span>
);

export function Features() {
  return (
    <section id="features" className="scroll-mt-8 px-6 md:px-12 lg:px-20 pt-28">
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
          <div
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
                <div className="self-end rounded-[14px_14px_4px_14px] bg-primary px-3.5 py-2.5 text-[13px] text-primary-foreground">
                  Dinner at Toit ₹2,400, split with Riya and Aman
                </div>
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
                  <div className="mt-1 flex gap-2">
                    <Pill active>Confirm</Pill>
                    <Pill>Edit</Pill>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FeatureCard eyebrow="Receipt scan" title="Snap the bill, skip the typing">
            <div className="mt-1.5 flex flex-col gap-1.5 rounded-xl bg-muted p-3.5 text-xs text-foreground">
              <div className="flex justify-between"><span>2 × Masala dosa</span><span>₹360</span></div>
              <div className="flex justify-between"><span>1 × Filter coffee</span><span>₹90</span></div>
              <div className="flex justify-between"><span>GST</span><span>₹22.50</span></div>
              <div className="flex justify-between border-t border-dashed border-secondary pt-1.5 font-semibold">
                <span>Total</span><span>₹472.50</span>
              </div>
            </div>
          </FeatureCard>

          <FeatureCard eyebrow="Smart categories" title="Sorted before you ask">
            <div className="flex flex-wrap gap-2 text-xs">
              <Pill active>Food</Pill>
              {["Rent", "Travel", "Utilities", "Groceries", "Fun"].map((c) => (
                <Pill key={c}>{c}</Pill>
              ))}
            </div>
          </FeatureCard>

          <FeatureCard eyebrow="Multi-currency" title="Travel abroad, settle at home">
            <div className="flex items-center gap-2.5 rounded-xl bg-muted p-3.5 text-sm text-foreground">
              <span className="font-semibold">€45.00</span>
              <span className="text-muted-foreground">converted to</span>
              <span className="font-semibold">INR at today’s rate</span>
            </div>
          </FeatureCard>

          <FeatureCard eyebrow="Recurring expenses" title="Rent and Wi‑Fi, on autopilot">
            <div className="flex flex-col gap-2 text-[13px] text-foreground">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span>Flat rent</span>
                <span className="text-muted-foreground">Monthly · 1st</span>
              </div>
              <div className="flex justify-between">
                <span>Wi‑Fi</span>
                <span className="text-muted-foreground">Monthly · 5th</span>
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
