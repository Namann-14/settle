import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";

import "../index.css";
import Providers from "@/providers/providers";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Nexora - The Future of Smarter Automation",
  description: "Automate your busywork with intelligent agents that learn, adapt, and execute—so your team can focus on what matters most.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-background font-body text-foreground antialiased selection:bg-[#6366f1] selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

