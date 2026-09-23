import { GetStartedButton } from "./get-started-button";

export function FinalCta() {
  return (
    <section className="px-6 md:px-12 lg:px-20 pt-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 rounded-[28px] border border-border bg-linear-to-b from-muted to-accent px-6 py-20 text-center md:py-24">
        <h2 className="max-w-3xl font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-foreground">
          Stop keeping score. <em className="italic">Start settling.</em>
        </h2>
        <p className="text-base md:text-[17px] text-muted-foreground">
          Create your first group in under a minute.
        </p>
        <GetStartedButton className="mt-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] cursor-pointer" />
      </div>
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
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer id="contact" className="mt-28 border-t border-border bg-card px-6 md:px-12 lg:px-20 pt-16 pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="flex max-w-xs flex-col gap-3">
            <span className="text-xl font-semibold tracking-tight text-foreground">✦ Settle</span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Shared expenses, split fairly and settled simply.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3 sm:gap-20">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-2.5">
                <span className="font-semibold text-foreground">{col.title}</span>
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-[13px] text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Settle. All rights reserved.</span>
          <a
            href="https://github.com/Namann-14/settle"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
