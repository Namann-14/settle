"use client";

import { useState } from "react";
import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  HandCoins,
  LayoutDashboard,
  Mic,
  Play,
  Receipt,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { AiSpotlight } from "@/components/landing/ai-spotlight";
import { Faq } from "@/components/landing/faq";
import { Features, TrustStrip } from "@/components/landing/features";
import { FinalCta, Footer } from "@/components/landing/footer";
import { GetStartedButton } from "@/components/landing/get-started-button";
import { HowItWorks, SettleShowcase } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

// Navbar Component
function Navbar() {
  return (
    <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 font-body">
      <a href="#home" className="flex items-center gap-1.5">
        <span className="text-xl font-semibold tracking-tight text-foreground">✦ Settle</span>
      </a>
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 cursor-pointer">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded-full px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer">
              Get Started
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="rounded-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            Dashboard
          </Link>
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}

const PREVIEW_GROUPS = [
  { initials: "GT", name: "Goa trip", members: 5, balance: "+₹6,240", tone: "text-primary" },
  { initials: "F4", name: "Flat 4B", members: 3, balance: "−₹1,420", tone: "text-destructive" },
  { initials: "OL", name: "Office lunch", members: 2, balance: "Settled", tone: "text-muted-foreground" },
];

const PREVIEW_EXPENSES = [
  { date: "Sep 21", description: "Seafood dinner", group: "Goa trip", payer: "Riya", amount: "₹6,400", share: "−₹1,280", tone: "text-destructive" },
  { date: "Sep 20", description: "Groceries", group: "Flat 4B", payer: "You", amount: "₹3,180", share: "+₹2,120", tone: "text-primary" },
  { date: "Sep 19", description: "Beach house, 3 nights", group: "Goa trip", payer: "You", amount: "₹24,000", share: "+₹19,200", tone: "text-primary" },
  { date: "Sep 15", description: "Internet, September", group: "Flat 4B", payer: "Kavya", amount: "₹1,199", share: "−₹400", tone: "text-destructive" },
];

// Static preview of the Settle dashboard. Illustrative sample data only.
function DashboardPreview() {
  const nav = [
    { icon: LayoutDashboard, label: "Overview", active: true },
    { icon: Users, label: "Groups" },
    { icon: Receipt, label: "Expenses" },
    { icon: HandCoins, label: "Settlements" },
  ];

  return (
    <div className="mt-10 w-full max-w-5xl select-none" aria-hidden="true">
      <div
        className="rounded-2xl overflow-hidden p-3 md:p-4 backdrop-blur-md"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 25px 80px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div className="flex bg-background rounded-xl overflow-hidden border border-border/50 text-left">
          {/* Sidebar */}
          <div className="hidden w-40 shrink-0 flex-col gap-0.5 border-r border-border bg-sidebar px-2 py-3 sm:flex">
            <div className="mb-3 flex items-center gap-2 px-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary font-display text-sm text-primary-foreground">
                s
              </span>
              <span className="text-[12px] font-semibold text-foreground">Settle</span>
            </div>
            {nav.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                  item.active ? "bg-accent font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="flex min-w-0 flex-1 flex-col gap-3 bg-secondary/10 p-3 sm:p-4">
            <p className="font-display text-xl leading-none text-foreground">
              Good evening, <em>Jane</em>
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-xs">
              <Sparkles className="size-3.5 shrink-0 text-primary" />
              <span className="flex-1 truncate text-[11px] text-muted-foreground">
                Dinner 2400 at Toit with Riya and Aman, I paid
              </span>
              <Mic className="size-3.5 text-primary" />
              <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground">
                Draft with AI
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-primary p-3 text-primary-foreground">
                <p className="text-[9px] uppercase tracking-wider opacity-70">You’re owed</p>
                <p className="font-display text-xl leading-tight">₹7,760</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">You owe</p>
                <p className="font-display text-xl leading-tight text-destructive">₹2,940</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Spent this month</p>
                <p className="font-display text-xl leading-tight">₹18,420</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1 rounded-xl border border-border bg-card p-3">
                <p className="mb-1 text-[11px] font-medium text-foreground">Your groups</p>
                {PREVIEW_GROUPS.map((g) => (
                  <div key={g.name} className="flex items-center gap-2 border-b border-border/40 py-2 last:border-b-0">
                    <span className="flex size-6 items-center justify-center rounded-md bg-accent text-[9px] font-semibold text-primary">
                      {g.initials}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[11px] font-medium text-foreground">{g.name}</span>
                      <span className="text-[9px] text-muted-foreground">{g.members} members</span>
                    </div>
                    <span className={`text-[11px] font-semibold ${g.tone}`}>{g.balance}</span>
                  </div>
                ))}
              </div>

              <div className="flex-1 rounded-xl bg-[oklch(0.32_0.045_162)] p-3 text-[oklch(0.95_0.012_160)] md:max-w-[46%]">
                <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[oklch(0.8_0.04_158)]">
                  <Sparkles className="size-3" /> Settle AI · settle-up plan
                </p>
                <p className="mt-1.5 font-display text-[15px] leading-snug">
                  Three payments clear everything. Start with <em>Kabir</em>.
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {[
                    ["Kabir pays you", "₹4,600"],
                    ["Aman pays you", "₹3,160"],
                    ["You pay Kavya", "₹1,420"],
                  ].map(([label, amount]) => (
                    <div key={label} className="flex items-center justify-between rounded-lg bg-white/[0.07] px-2 py-1.5 text-[10px]">
                      <span>{label}</span>
                      <span className="font-semibold">{amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card p-3">
              <p className="mb-2 text-[11px] font-medium text-foreground">Recent expenses</p>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-1.5 text-left font-normal">Date</th>
                    <th className="py-1.5 text-left font-normal">Description</th>
                    <th className="hidden py-1.5 text-left font-normal sm:table-cell">Group</th>
                    <th className="hidden py-1.5 text-left font-normal sm:table-cell">Paid by</th>
                    <th className="py-1.5 text-right font-normal">Amount</th>
                    <th className="py-1.5 text-right font-normal">Your share</th>
                  </tr>
                </thead>
                <tbody>
                  {PREVIEW_EXPENSES.map((e) => (
                    <tr key={e.description} className="border-b border-border/50 last:border-b-0">
                      <td className="py-2 text-muted-foreground">{e.date}</td>
                      <td className="py-2 font-medium text-foreground">{e.description}</td>
                      <td className="hidden py-2 text-muted-foreground sm:table-cell">{e.group}</td>
                      <td className="hidden py-2 text-muted-foreground sm:table-cell">{e.payer}</td>
                      <td className="py-2 text-right font-medium text-foreground">{e.amount}</td>
                      <td className={`py-2 text-right font-medium ${e.tone}`}>{e.share}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-x-hidden font-body">
      {/* Hero wrapper keeps the background video scoped to the hero */}
      <div id="home" className="relative min-h-screen flex flex-col">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-90"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
          type="video/mp4"
        />
      </video>

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center w-full flex-1 px-4 pt-4 pb-16">
        {/* Badge */}
        <a
          href="#how"
          className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground font-body mb-6 shadow-xs hover:border-foreground/20 transition-colors"
          style={
            {
              "--y": "10px",
              "--duration": "0.5s",
              "--delay": "0s",
            } as React.CSSProperties
          }
        >
          <Sparkles className="size-3.5 text-primary" />
          <span>Add expenses by typing or talking</span>
        </a>

        {/* Headline */}
        <h1
          className="animate-fade-up text-center font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] leading-[0.95] tracking-tight text-foreground max-w-3xl"
          style={
            {
              "--y": "16px",
              "--duration": "0.6s",
              "--delay": "0.1s",
            } as React.CSSProperties
          }
        >
          Split bills, <em className="font-display italic font-normal">not</em> friendships
        </h1>

        {/* Subheadline */}
        <p
          className="animate-fade-up mt-5 text-center text-base md:text-lg text-muted-foreground max-w-[650px] leading-relaxed font-body"
          style={
            {
              "--y": "16px",
              "--duration": "0.6s",
              "--delay": "0.2s",
            } as React.CSSProperties
          }
        >
          Settle tracks shared expenses for trips, flats and dinners. Describe an expense in
          plain words, see who owes whom, and settle up in the fewest payments.
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-up mt-6 flex items-center gap-3"
          style={
            {
              "--y": "16px",
              "--duration": "0.6s",
              "--delay": "0.3s",
            } as React.CSSProperties
          }
        >
          <GetStartedButton className="rounded-full px-6 py-3 text-sm font-medium font-body bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer" />
          <a
            href="#how"
            className="rounded-full px-5 py-3 text-sm font-medium font-body bg-background text-foreground hover:bg-secondary transition-all shadow-md"
          >
            See how it works
          </a>
          <button
            onClick={() => setShowVideoModal(true)}
            aria-label="Play demo video"
            className="h-11 w-11 rounded-full border-0 bg-background flex items-center justify-center hover:bg-secondary hover:scale-105 transition-all shadow-md cursor-pointer"
          >
            <Play className="h-4 w-4 fill-foreground text-foreground ml-0.5" />
          </button>
        </div>

        {/* Dashboard Preview */}
        <div
          className="animate-fade-up w-full flex justify-center"
          style={
            {
              "--y": "30px",
              "--duration": "0.8s",
              "--delay": "0.5s",
            } as React.CSSProperties
          }
        >
          <DashboardPreview />
        </div>
      </main>
      </div>

      <TrustStrip />
      <Features />
      <HowItWorks />
      <SettleShowcase />
      <AiSpotlight />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-up">
          <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
            <button
              onClick={() => setShowVideoModal(false)}
              aria-label="Close video"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              <video controls autoPlay className="w-full h-full object-cover">
                <source
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
