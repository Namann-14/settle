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
  // No extra axes: nothing uses Inter's optical-size axis, and it made the
  // font file roughly half again as large.
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Settle - Split bills, not friendships",
  description: "Track shared expenses for trips, flats and dinners. Add expenses in plain words, see who owes whom, and settle up in the fewest payments.",
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

