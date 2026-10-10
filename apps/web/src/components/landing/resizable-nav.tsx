"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { Menu, X } from "lucide-react";

import { cn } from "@settle/ui/lib/utils";

// Resizable navbar, adapted from Aceternity UI's "Resizable Navbar": full
// width at the top of the page, then it shrinks into a floating frosted rectangular bar
// once you scroll. Rebuilt on the lightweight `m` component (the registry
// version uses the full `motion` build and `layoutId`, neither of which work
// inside our strict `LazyMotion`), with the site's colour tokens.

const SPRING = { type: "spring", stiffness: 200, damping: 30 } as const;
const SHADOW =
  "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 16px 68px rgba(47, 48, 55, 0.06)";

type NavLink = { href: string; label: string };

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

// Links with a pill that slides to whichever one is hovered.
function NavLinks({ links }: { links: NavLink[] }) {
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pill, setPill] = useState({ x: 0, width: 0, show: false });

  function hover(i: number) {
    const el = refs.current[i];
    if (el) setPill({ x: el.offsetLeft, width: el.offsetWidth, show: true });
  }

  return (
    <div
      className="relative flex items-center"
      onPointerLeave={() => setPill((p) => ({ ...p, show: false }))}
    >
      <m.span
        aria-hidden
        className="absolute inset-y-0 left-0 rounded-lg bg-foreground/[0.06]"
        initial={false}
        animate={{ x: pill.x, width: pill.width, opacity: pill.show ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
      />
      {links.map((link, i) => (
        <a
          key={link.href}
          ref={(el) => {
            refs.current[i] = el;
          }}
          href={link.href}
          onPointerEnter={() => hover(i)}
          onFocus={() => hover(i)}
          onBlur={() => setPill((p) => ({ ...p, show: false }))}
          className="relative rounded-lg px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function ResizableNav({
  links,
  logo,
  children,
}: {
  links: NavLink[];
  logo: React.ReactNode;
  children: React.ReactNode;
}) {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  const desktop = useIsDesktop();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 80));

  return (
    <>
      <div aria-hidden className="h-[72px]" />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-6 pt-4 md:px-12 lg:px-20">
        <m.div
          initial={false}
          animate={{
            width: scrolled ? (desktop ? "62%" : "100%") : "100%",
            y: scrolled ? 4 : 0,
            paddingLeft: scrolled ? 20 : 0,
            paddingRight: scrolled ? 12 : 0,
          }}
          transition={SPRING}
          style={{ boxShadow: scrolled ? SHADOW : "0 0 0 rgba(0,0,0,0)" }}
          className={cn(
            "pointer-events-auto relative mx-auto flex items-center justify-between rounded-xl border py-2 font-body transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 lg:min-w-[760px]",
            scrolled
              ? "border-border/70 bg-background/75 backdrop-blur-md"
              : "border-transparent bg-transparent",
          )}
        >
          {/* Scroll progress draws around the navbar's border and closes the loop at the bottom of the page */}
          <svg
            aria-hidden
            className="pointer-events-none absolute -left-px -top-px h-[calc(100%+2px)] w-[calc(100%+2px)] overflow-visible"
          >
            <m.rect
              width="100%"
              height="100%"
              rx="12"
              ry="12"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={false}
              animate={{ opacity: scrolled ? 1 : 0 }}
              style={{ pathLength: progress }}
            />
          </svg>

          {logo}

          <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <NavLinks links={links} />
          </nav>

          <div className="hidden lg:block">{children}</div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-foreground transition-colors hover:bg-foreground/[0.06] lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <AnimatePresence>
            {open && (
              <m.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 top-full mt-2 flex flex-col gap-1 rounded-2xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur-md lg:hidden"
              >
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/[0.06]"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-1 flex border-t border-border/60 pt-3">{children}</div>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      </header>
    </>
  );
}
