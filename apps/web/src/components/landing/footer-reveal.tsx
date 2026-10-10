"use client";

import { useEffect, useState } from "react";
import { m, useMotionValueEvent, useScroll } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

// The footer is a sticky layer parked behind the page, so it is technically
// "in view" from the first paint and `whileInView` would fire while it is
// still covered. This flips to true once the page is scrolled close enough to
// the bottom that the footer is actually being uncovered, and stays true.
export function useFooterRevealed(distance = 420) {
  const { scrollY } = useScroll();
  const [revealed, setRevealed] = useState(false);

  const check = () => {
    const root = document.documentElement;
    const remaining = root.scrollHeight - (window.scrollY + window.innerHeight);
    if (remaining < distance) setRevealed(true);
  };

  useEffect(check, []); // eslint-disable-line react-hooks/exhaustive-deps
  useMotionValueEvent(scrollY, "change", check);

  return revealed;
}

export function FooterReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const revealed = useFooterRevealed();
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {children}
    </m.div>
  );
}
