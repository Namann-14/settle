"use client";

import { useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  Play,
  Search,
  Bell,
  ChevronDown,
  Check,
  Plus,
  MoreVertical,
  Home as HomeIcon,
  Clipboard,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  Settings,
  X,
} from "lucide-react";

// Navbar Component
function Navbar({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 font-body">
      <div className="flex items-center gap-1.5 cursor-pointer">
        <span className="text-xl font-semibold tracking-tight text-foreground">
          ✦ Nexora
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a
          href="#home"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Home
        </a>
        <a
          href="#pricing"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Pricing
        </a>
        <a
          href="#about"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          About
        </a>
        <a
          href="#contact"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Contact
        </a>
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
          <button
            onClick={onOpenDemo}
            className="rounded-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            Dashboard
          </button>
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}

// Chart SVG Component
function Chart() {
  return (
    <svg
      viewBox="0 0 400 80"
      className="h-20 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(239 84% 67%)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="hsl(239 84% 67%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,60 C30,55 50,30 80,35 C110,40 130,20 160,25 C190,30 210,15 240,20 C270,25 290,10 320,15 C350,20 380,5 400,10 L400,80 L0,80 Z"
        fill="url(#chartGradient)"
      />
      <path
        d="M0,60 C30,55 50,30 80,35 C110,40 130,20 160,25 C190,30 210,15 240,20 C270,25 290,10 320,15 C350,20 380,5 400,10"
        fill="none"
        stroke="hsl(239 84% 67%)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// Dashboard Component
function Dashboard() {
  const [activeTab, setActiveTab] = useState("Send");
  const [searchFocused, setSearchFocused] = useState(false);

  const actionButtons = [
    "Send",
    "Request",
    "Transfer",
    "Deposit",
    "Pay Bill",
    "Create Invoice",
  ];

  return (
    <div className="mt-8 w-full max-w-5xl select-none transition-all duration-300">
      <div
        className="rounded-2xl overflow-hidden p-3 md:p-4 backdrop-blur-md"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow:
            "0 25px 80px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div className="bg-background rounded-xl overflow-hidden border border-border/50">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-primary-foreground">
                    N
                  </span>
                </div>
                <span className="text-[11px] font-medium text-foreground">
                  Nexora
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-[11px] text-muted-foreground transition-all ${searchFocused ? "ring-2 ring-primary/20 bg-background" : ""
                  }`}
              >
                <Search className="w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="bg-transparent border-none outline-none w-20 sm:w-28 text-foreground placeholder:text-muted-foreground text-[11px]"
                />
                <span className="text-[10px] px-1 py-0.5 rounded bg-background border border-border">
                  ⌘K
                </span>
              </div>
              <button className="text-[11px] font-medium text-foreground px-3 py-1.5 rounded-md hover:bg-secondary transition-colors hidden sm:block">
                Move Money
              </button>
              <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                <Bell className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center cursor-pointer">
                <span className="text-[9px] font-medium text-primary-foreground">
                  JB
                </span>
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-36 sm:w-40 border-r border-border py-3 px-2 hidden sm:block">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-secondary/50 text-[11px] font-medium text-foreground cursor-pointer">
                  <HomeIcon className="w-3.5 h-3.5" />
                  <span>Home</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-secondary/30 text-[11px] text-muted-foreground cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Tasks</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-foreground font-medium">
                    10
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/30 text-[11px] text-muted-foreground cursor-pointer">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Transactions</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-secondary/30 text-[11px] text-muted-foreground cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payments</span>
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/30 text-[11px] text-muted-foreground cursor-pointer">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/30 text-[11px] text-muted-foreground cursor-pointer">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Capital</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-secondary/30 text-[11px] text-muted-foreground cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Accounts</span>
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
              <div className="mt-4 px-2">
                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Workflows
                </p>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/30 text-[11px] text-muted-foreground cursor-pointer">
                    <span>Trake rutes</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/30 text-[11px] text-muted-foreground cursor-pointer">
                    <span>Payments</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/30 text-[11px] text-muted-foreground cursor-pointer">
                    <span>Notifications</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/30 text-[11px] text-muted-foreground cursor-pointer">
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-secondary/30 p-3 sm:p-4">
              <p className="text-sm font-semibold text-foreground mb-3">
                Welcome, Jane
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {actionButtons.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => setActiveTab(btn)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-medium transition-all cursor-pointer ${activeTab === btn
                      ? "bg-[#6366f1] text-white shadow-xs"
                      : "bg-background border border-border text-foreground hover:bg-secondary/50"
                      }`}
                  >
                    {btn}
                  </button>
                ))}
                <span className="text-[10px] text-muted-foreground ml-1 cursor-pointer hover:underline">
                  Customize
                </span>
              </div>

              {/* Cards Row */}
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                {/* Balance Card */}
                <div className="flex-1 bg-background rounded-xl p-3 border border-border shadow-xs">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[11px] font-medium text-foreground">
                      Mercury Balance
                    </span>
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <div className="flex items-baseline gap-0.5 mb-2">
                    <span className="text-lg font-semibold text-foreground">
                      $8,450,190
                    </span>
                    <span className="text-xs text-muted-foreground">.32</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div>
                      <p className="text-[9px] text-muted-foreground">
                        Last 30 Days
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-green-600">
                        +$1.8M
                      </span>
                      <span className="text-[10px] font-medium text-red-500">
                        -$900K
                      </span>
                    </div>
                  </div>
                  <Chart />
                </div>

                {/* Accounts Card */}
                <div className="flex-1 bg-background rounded-xl p-3 border border-border shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-medium text-foreground">
                      Accounts
                    </span>
                    <div className="flex items-center gap-1">
                      <Plus className="w-3 h-3 text-muted-foreground cursor-pointer" />
                      <MoreVertical className="w-3 h-3 text-muted-foreground cursor-pointer" />
                    </div>
                  </div>
                  <div className="space-y-0">
                    <div className="flex items-center justify-between py-2.5 border-b border-border/40 text-xs">
                      <span className="text-muted-foreground">Credit</span>
                      <span className="font-medium text-foreground">
                        $98,125.50
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-border/40 text-xs">
                      <span className="text-muted-foreground">Treasury</span>
                      <span className="font-medium text-foreground">
                        $6,750,200.00
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5 text-xs">
                      <span className="text-muted-foreground">Operations</span>
                      <span className="font-medium text-foreground">
                        $1,592,864.82
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-background rounded-xl p-3 border border-border shadow-xs overflow-x-auto">
                <p className="text-[11px] font-medium text-foreground mb-2">
                  Recent Transactions
                </p>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border">
                      <th className="text-left py-1.5 font-normal">Date</th>
                      <th className="text-left py-1.5 font-normal">
                        Description
                      </th>
                      <th className="text-right py-1.5 font-normal">Amount</th>
                      <th className="text-right py-1.5 font-normal">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="py-2 text-muted-foreground">Mar 15</td>
                      <td className="py-2 text-foreground font-medium">AWS</td>
                      <td className="py-2 text-right text-foreground font-medium">
                        -$5,200
                      </td>
                      <td className="py-2 text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          Pending
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="py-2 text-muted-foreground">Mar 14</td>
                      <td className="py-2 text-foreground font-medium">
                        Client Payment
                      </td>
                      <td className="py-2 text-right text-foreground font-medium">
                        +$125,000
                      </td>
                      <td className="py-2 text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                          Completed
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="py-2 text-muted-foreground">Mar 12</td>
                      <td className="py-2 text-foreground font-medium">
                        Payroll
                      </td>
                      <td className="py-2 text-right text-foreground font-medium">
                        -$85,450
                      </td>
                      <td className="py-2 text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                          Completed
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <td className="py-2 text-muted-foreground">Mar 10</td>
                      <td className="py-2 text-foreground font-medium">
                        Office Supplies
                      </td>
                      <td className="py-2 text-right text-foreground font-medium">
                        -$1,200
                      </td>
                      <td className="py-2 text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                          Completed
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-x-hidden font-body">
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
      <Navbar onOpenDemo={() => setShowDemoModal(true)} />

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center w-full flex-1 px-4 pt-4 pb-16">
        {/* Badge */}
        <div
          className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground font-body mb-6 shadow-xs hover:border-foreground/20 transition-colors cursor-pointer"
          style={
            {
              "--y": "10px",
              "--duration": "0.5s",
              "--delay": "0s",
            } as React.CSSProperties
          }
        >
          <span>Now with GPT-5 support</span>
          <span>✨</span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up text-center font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] leading-[0.95] tracking-tight text-foreground max-w-2xl"
          style={
            {
              "--y": "16px",
              "--duration": "0.6s",
              "--delay": "0.1s",
            } as React.CSSProperties
          }
        >
          The Future of{" "}
          <em className="not-italic font-display italic font-normal">Smarter</em>{" "}
          Automation
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
          Automate your busywork with intelligent agents that learn, adapt, and
          execute—so your team can focus on what matters most.
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
          <button
            onClick={() => setShowDemoModal(true)}
            className="rounded-full px-6 py-3 text-sm font-medium font-body bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
          >
            Book a demo
          </button>
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
          <Dashboard />
        </div>
      </main>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-up">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full border border-border shadow-2xl relative">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Book a Nexora Demo
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Experience the power of autonomous AI automation configured for
              your workflow.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowDemoModal(false);
                alert("Thank you! Our team will contact you shortly.");
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Acme Inc."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors mt-2 cursor-pointer"
              >
                Schedule Demo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-up">
          <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
            <button
              onClick={() => setShowVideoModal(false)}
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
