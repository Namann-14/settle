import { FooterWordmark } from "./footer-wordmark";
import { GetStartedButton } from "./get-started-button";
import { FooterReveal } from "./footer-reveal";
import { Magnet, Reveal } from "./motion";
import { ScrollWords } from "./scroll-effects";
import { SettleLogo } from "@/components/settle-logo";

export function FinalCta() {
  return (
    <section className="px-6 md:px-12 lg:px-20 pt-32">
      <Reveal className="relative mx-auto flex max-w-6xl flex-col items-center gap-5 overflow-hidden rounded-[28px] border border-border bg-linear-to-b from-muted to-accent px-6 py-20 text-center md:py-24">
        <span
          aria-hidden
          className="animate-drift pointer-events-none absolute -left-16 -top-20 size-72 rounded-full bg-primary/15 blur-3xl"
          style={{ "--dx": "40px", "--dy": "30px" } as React.CSSProperties}
        />
        <span
          aria-hidden
          className="animate-drift pointer-events-none absolute -bottom-24 -right-12 size-80 rounded-full bg-secondary/40 blur-3xl"
          style={{ "--dx": "-36px", "--dy": "-24px", "--drift-duration": "18s" } as React.CSSProperties}
        />
        <h2 className="relative max-w-3xl font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-foreground">
          <ScrollWords
            words={[
              { text: "Stop" },
              { text: "keeping" },
              { text: "score." },
              { text: "Start", italic: true },
              { text: "settling.", italic: true },
            ]}
          />
        </h2>
        <p className="relative text-base md:text-[17px] text-muted-foreground">
          Create your first group in under a minute.
        </p>
        <Magnet className="mt-2">
          <GetStartedButton className="rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-md btn-shine relative hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] cursor-pointer" />
        </Magnet>
      </Reveal>
    </section>
  );
}

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "App",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Groups", href: "/dashboard/groups" },
      { label: "Settlements", href: "/dashboard/settlements" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "#" },
      { label: "GitHub", href: "https://github.com/Namann-14/settle", external: true },
    ],
  },
];

const linkClass =
  "group/link relative inline-flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-foreground " +
  "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 hover:after:scale-x-100";

export function Footer() {
  return (
    <footer id="contact" className="sticky bottom-0 z-0 overflow-hidden bg-card">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[60rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto flex max-w-[88rem] flex-col gap-16 px-6 pt-16 md:px-12 lg:px-20">
        <FooterReveal className="flex flex-col justify-between gap-12 lg:flex-row">
          <div className="flex max-w-sm flex-col gap-5">
            <SettleLogo />
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Shared expenses, split fairly and settled simply. Describe it in a sentence, see who
              owes whom, and clear it in the fewest payments.
            </p>
            <Magnet>
              <GetStartedButton
                label="Create a group"
                className="btn-shine rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98] cursor-pointer"
              />
            </Magnet>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3 sm:gap-16">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground/70">
                  {col.title}
                </span>
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={linkClass}
                    {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {link.label}
                    {link.external && (
                      <span
                        aria-hidden
                        className="text-xs transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                      >
                        ↗
                      </span>
                    )}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </FooterReveal>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-[13px] text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Settle. All rights reserved.</span>
          <span>Split bills, not friendships.</span>
        </div>
      </div>

      <FooterWordmark />
    </footer>
  );
}
