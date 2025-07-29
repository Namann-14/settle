"use client";

import React from "react";
import { Users, Receipt, Calculator, Shield, Smartphone, Zap } from "lucide-react";

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

const features = [
  {
    icon: Users,
    title: "Group Management",
    description: "Create and manage expense groups for friends, roommates, travel companions, or any shared activities.",
    delay: 0
  },
  {
    icon: Receipt,
    title: "Smart Receipt Scanning",
    description: "Upload receipts and let AI extract expense details automatically. No more manual data entry.",
    delay: 200
  },
  {
    icon: Calculator,
    title: "Flexible Splitting",
    description: "Split expenses equally, by percentage, or custom amounts. Handle complex scenarios effortlessly.",
    delay: 400
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your financial data is encrypted and secure. We prioritize your privacy above everything else.",
    delay: 600
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Access your expenses anywhere, anytime. Fully responsive design that works on all devices.",
    delay: 800
  },
  {
    icon: Zap,
    title: "Instant Settlements",
    description: "Clear dashboard shows who owes what. Settle debts quickly and transparently.",
    delay: 1000
  }
];

export default function FeaturesSection() {
  return (
    <div
      className="min-h-screen bg-background text-foreground relative w-full py-20 md:py-32 overflow-hidden"
    >
      {/* Grid Background */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="features-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(62,207,142,0.06)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#features-grid)" />
        <line x1="0" y1="25%" x2="100%" y2="25%" className="features-grid-line" stroke="rgba(62,207,142,0.1)" strokeWidth="0.5" />
        <line x1="0" y1="75%" x2="100%" y2="75%" className="features-grid-line" stroke="rgba(62,207,142,0.1)" strokeWidth="0.5" />
        <line x1="25%" y1="0" x2="25%" y2="100%" className="features-grid-line" stroke="rgba(62,207,142,0.1)" strokeWidth="0.5" />
        <line x1="75%" y1="0" x2="75%" y2="100%" className="features-grid-line" stroke="rgba(62,207,142,0.1)" strokeWidth="0.5" />
        
        {/* Detail dots */}
        <circle cx="25%" cy="25%" r="1.5" className="features-detail-dot" fill={colors[200]} />
        <circle cx="75%" cy="25%" r="1.5" className="features-detail-dot" fill={colors[200]} />
        <circle cx="25%" cy="75%" r="1.5" className="features-detail-dot" fill={colors[200]} />
        <circle cx="75%" cy="75%" r="1.5" className="features-detail-dot" fill={colors[200]} />
        <circle cx="50%" cy="50%" r="1" className="features-detail-dot" fill={colors[300]} />
      </svg>

      {/* Corner elements */}
      <div className="absolute top-8 left-8">
        <div
          className="w-2 h-2 opacity-30"
          style={{ background: colors[200] }}
        ></div>
      </div>
      <div className="absolute top-8 right-8">
        <div
          className="w-2 h-2 opacity-30"
          style={{ background: colors[200] }}
        ></div>
      </div>
      <div className="absolute bottom-8 left-8">
        <div
          className="w-2 h-2 opacity-30"
          style={{ background: colors[200] }}
        ></div>
      </div>
      <div className="absolute bottom-8 right-8">
        <div
          className="w-2 h-2 opacity-30"
          style={{ background: colors[200] }}
        ></div>
      </div>

      <div className="relative z-10 px-8 md:px-16 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2
            className="features-title text-xs md:text-sm font-mono font-light uppercase tracking-[0.2em] opacity-80 text-primary mb-4"
          >
            Core Features
          </h2>
          <div className="w-16 h-px opacity-30 bg-primary mx-auto mb-8"></div>
          <h3
            className="features-subtitle text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-foreground max-w-4xl mx-auto"
          >
            Everything you need to split expenses
            <span className="text-primary"> seamlessly</span>
          </h3>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="feature-card group relative"
              >
                {/* Card Background */}
                <div className="absolute inset-0 bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg"></div>
                
                {/* Card Content */}
                <div className="relative p-8 h-full flex flex-col">
                  {/* Icon */}
                  <div className="mb-6">
                    <div
                      className="feature-icon w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${colors[200]}20, ${colors[300]}10)` }}
                    >
                      <IconComponent
                        size={24}
                        className="text-primary"
                      />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="feature-text flex-1">
                    <h4 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Decorative dot */}
                  <div className="absolute top-4 right-4">
                    <div
                      className="w-1 h-1 rounded-full opacity-40"
                      style={{ background: colors[200] }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom decorative line */}
        <div className="mt-16 md:mt-24 flex justify-center">
          <div className="flex space-x-2">
            <div
              className="w-1 h-1 rounded-full opacity-40"
              style={{ background: colors[200] }}
            ></div>
            <div
              className="w-1 h-1 rounded-full opacity-60"
              style={{ background: colors[200] }}
            ></div>
            <div
              className="w-1 h-1 rounded-full opacity-40"
              style={{ background: colors[200] }}
            ></div>
          </div>
        </div>
      </div>

      {/* Mouse gradient effect */}
      <div
        className="absolute pointer-events-none w-96 h-96 rounded-full blur-3xl transition-all duration-500 ease-out opacity-0"
        style={{
          background: `radial-gradient(circle, ${colors[500]}08 0%, transparent 100%)`,
        }}
      ></div>
    </div>
  );
}
