"use client";

import { ClerkProvider } from "@clerk/nextjs";

import { ThemeProvider } from "./theme-provider";

// Site-wide providers. Only what the landing page needs too; the dashboard's
// data, tooltip and toast providers live in DashboardProviders so public
// pages don't download them.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        forcedTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ClerkProvider>
  );
}
