"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const colors = {
  50: "#f0fdf4",
  100: "#dcfce7",
  200: "#3ecf8e",
  300: "#10b981",
  400: "#059669",
  500: "#047857",
  600: "#065f46",
  700: "#064e3b",
  800: "#1e293b",
  900: "#0f172a",
};

export default function FloatingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement[]>([]);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Toggle mobile menu
  const toggleMenu = () => {
    if (isMenuOpen) {
      // Close menu animation
      if (mobileMenuRef.current) {
        gsap.to(mobileMenuRef.current, {
          duration: 0.4,
          y: -20,
          opacity: 0,
          ease: "power3.out",
          onComplete: () => setIsMenuOpen(false)
        });
      }
    } else {
      setIsMenuOpen(true);
      // Open menu animation (happens after state update and render)
      setTimeout(() => {
        if (mobileMenuRef.current) {
          gsap.fromTo(mobileMenuRef.current,
            { y: -20, opacity: 0 },
            { duration: 0.4, y: 0, opacity: 1, ease: "power3.out" }
          );
        }
      }, 10);
    }
  };

  useEffect(() => {
    // Animate hamburger icon
    if (hamburgerRef.current) {
      const topBar = hamburgerRef.current.querySelector('.hamburger-top');
      const middleBar = hamburgerRef.current.querySelector('.hamburger-middle');
      const bottomBar = hamburgerRef.current.querySelector('.hamburger-bottom');

      if (topBar && middleBar && bottomBar) {
        if (isMenuOpen) {
          gsap.to(topBar, { duration: 0.3, y: 9, rotation: 45, transformOrigin: "center" });
          gsap.to(middleBar, { duration: 0.3, opacity: 0 });
          gsap.to(bottomBar, { duration: 0.3, y: -9, rotation: -45, transformOrigin: "center" });
        } else {
          gsap.to(topBar, { duration: 0.3, y: 0, rotation: 0 });
          gsap.to(middleBar, { duration: 0.3, opacity: 1 });
          gsap.to(bottomBar, { duration: 0.3, y: 0, rotation: 0 });
        }
      }
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const nav = navRef.current;
    const logo = logoRef.current;
    const links = linksRef.current;
    const buttons = buttonsRef.current;

    if (!nav || !logo || !links || !buttons) return;

    // Initial animation - navbar entrance
    gsap.set(nav, { y: -100, opacity: 0 });
    gsap.set([logo, links, buttons], { y: 20, opacity: 0 });
    gsap.set(dotsRef.current, { scale: 0, opacity: 0 });

    // Animate navbar entrance
    const tl = gsap.timeline({ delay: 0.5 });
    tl.to(nav, { duration: 0.8, y: 0, opacity: 1, ease: "back.out(1.7)" })
      .to(logo, { duration: 0.6, y: 0, opacity: 1, ease: "power2.out" }, "-=0.4")
      .to(links, { duration: 0.6, y: 0, opacity: 1, ease: "power2.out" }, "-=0.5")
      .to(buttons, { duration: 0.6, y: 0, opacity: 1, ease: "power2.out" }, "-=0.5")
      .to(dotsRef.current, {
        duration: 0.4,
        scale: 1,
        opacity: 1,
        ease: "back.out(1.7)",
        stagger: 0.1
      }, "-=0.3");

    // Scroll-based animations
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newIsScrolled = scrollY > 50;

      if (newIsScrolled !== isScrolled) {
        setIsScrolled(newIsScrolled);

        if (newIsScrolled) {
          gsap.to(nav, {
            duration: 0.3,
            scale: 0.95,
            y: -5,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
            ease: "power2.out"
          });
        } else {
          gsap.to(nav, {
            duration: 0.3,
            scale: 1,
            y: 0,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            ease: "power2.out"
          });
        }
      }
    };

    // Floating animation for dots
    dotsRef.current.forEach((dot, index) => {
      if (dot) {
        gsap.to(dot, {
          duration: 2 + index * 0.5,
          y: "random(-3, 3)",
          rotation: "random(-5, 5)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.2
        });
      }
    });

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isScrolled]);

  return (
    <nav
      ref={navRef}
      className="fixed top-12 left-1/2 transform -translate-x-1/2 z-50 w-full px-4"
    >
      <div
        className="w-full max-w-7xl mx-auto rounded-sm relative px-4 sm:px-8 py-4 border border-border shadow-lg"
        style={{
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(62, 207, 142, 0.1)`,
        }}
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5 rounded-sm"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #3ecf8e 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div className="relative flex items-center justify-between">
          {/* Logo */}
          <div ref={logoRef}>
            <LogoComponent />
          </div>

          {/* Desktop Navigation Links - Hidden on mobile */}
          <div ref={linksRef} className="hidden md:flex items-center space-x-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>

          {/* Action Buttons - Show Sign In button on mobile, hide Get Started button */}
          <div ref={buttonsRef} className="hidden md:flex items-center space-x-4">
            <ActionButton href="/login" variant="outline">
              Sign In
            </ActionButton>
            <ActionButton href="/signup" variant="primary">
              Get Started
            </ActionButton>
          </div>

          {/* Mobile Sign In Button - Show only on mobile */}
          <div className="flex md:hidden items-center">
            <ActionButton href="/login" variant="outline">
              Sign In
            </ActionButton>
          </div>

          {/* Hamburger Menu Button - Show only on mobile */}
          <button
            ref={hamburgerRef}
            className="flex md:hidden flex-col items-center justify-center ml-4 w-8 h-8 rounded-sm border border-border p-1"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-top w-full h-0.5 bg-foreground mb-1.5 transform transition-all"></span>
            <span className="hamburger-middle w-full h-0.5 bg-foreground mb-1.5"></span>
            <span className="hamburger-bottom w-full h-0.5 bg-foreground transform transition-all"></span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="absolute left-0 right-0 top-full mt-2 border border-border rounded-sm shadow-lg bg-card backdrop-blur-md p-4 opacity-0"
            style={{ boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(62, 207, 142, 0.05)` }}
          >
            <div className="flex flex-col space-y-4">
              <MobileNavLink href="#features" onClick={toggleMenu}>Features</MobileNavLink>
              <MobileNavLink href="#how-it-works" onClick={toggleMenu}>How it works</MobileNavLink>
              <MobileNavLink href="#pricing" onClick={toggleMenu}>Pricing</MobileNavLink>
              <div className="pt-2 border-t border-border">
                <ActionButton href="/signup" variant="primary">
                  Get Started
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}

function MobileNavLink({ href, children, onClick }: MobileNavLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = () => {
    if (linkRef.current) {
      gsap.to(linkRef.current, {
        duration: 0.2,
        color: "#3ecf8e",
        x: 3,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    if (linkRef.current) {
      gsap.to(linkRef.current, {
        duration: 0.2,
        color: "#94a3b8",
        x: 0,
        ease: "power2.out"
      });
    }
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      className="text-base font-medium text-muted-foreground py-2 px-1 rounded-sm hover:bg-muted/20 transition-colors"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

function LogoComponent() {
  const logoIconRef = useRef<HTMLDivElement>(null);
  const logoTextRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (logoIconRef.current && logoTextRef.current) {
      gsap.to(logoIconRef.current, {
        duration: 0.3,
        scale: 1.1,
        rotation: 5,
        ease: "back.out(1.7)"
      });
      gsap.to(logoTextRef.current, {
        duration: 0.3,
        x: 2,
        color: "#3ecf8e",
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    if (logoIconRef.current && logoTextRef.current) {
      gsap.to(logoIconRef.current, {
        duration: 0.3,
        scale: 1,
        rotation: 0,
        ease: "power2.out"
      });
      gsap.to(logoTextRef.current, {
        duration: 0.3,
        x: 0,
        color: "inherit",
        ease: "power2.out"
      });
    }
  };

  return (
    <Link
      href="/"
      className="flex items-center space-x-2 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={logoIconRef}
        className="h-10 flex items-center justify-center border border-primary bg-primary rounded"
      >
        <Image src='/settle-logo.png' alt="logo" width={100} height={100} />
      </div>
    </Link>
  );
}

interface ActionButtonProps {
  href: string;
  variant: "outline" | "primary";
  children: React.ReactNode;
}

function ActionButton({ href, variant, children }: ActionButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        duration: 0.2,
        scale: 1.05,
        y: -1,
        ease: "power2.out"
      });

      if (variant === "primary") {
        gsap.to(buttonRef.current, {
          duration: 0.2,
          boxShadow: "0 8px 25px rgba(62, 207, 142, 0.3)",
          ease: "power2.out"
        });
      }
    }
  };

  const handleMouseLeave = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        duration: 0.2,
        scale: 1,
        y: 0,
        boxShadow: "none",
        ease: "power2.out"
      });
    }
  };

  const baseClasses = "px-4 py-2 text-sm font-medium rounded-sm";
  const variantClasses = variant === "outline"
    ? "text-muted-foreground border border-border"
    : "bg-primary text-primary-foreground px-6";

  return (
    <Link
      ref={buttonRef}
      href={href}
      className={`${baseClasses} ${variantClasses} ${variant === 'primary' && 'w-full text-center md:w-auto'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  );
}

function NavLink({ href, children }: NavLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (linkRef.current && underlineRef.current) {
      gsap.to(linkRef.current, {
        duration: 0.2,
        color: "#3ecf8e",
        ease: "power2.out"
      });

      gsap.to(underlineRef.current, {
        duration: 0.3,
        width: "100%",
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    if (linkRef.current && underlineRef.current) {
      gsap.to(linkRef.current, {
        duration: 0.2,
        color: "#94a3b8",
        ease: "power2.out"
      });

      gsap.to(underlineRef.current, {
        duration: 0.3,
        width: "0%",
        ease: "power2.out"
      });
    }
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      className="relative text-sm font-medium tracking-wide text-muted-foreground rounded-sm"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="relative z-10">{children}</span>
      <div
        ref={underlineRef}
        className="absolute bottom-0 left-0 h-px bg-primary w-0"
      ></div>
    </Link>
  );
}