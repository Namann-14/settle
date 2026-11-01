"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

import { ThemeProvider } from "./theme-provider";

// Site-wide providers. Only what the landing page needs too; the dashboard's
// data, tooltip and toast providers live in DashboardProviders so public
// pages don't download them.
export default function Providers({ children }: { children: React.ReactNode }) {
  // The signed-in app follows the user's choice (Settings > Appearance, default
  // system). Public pages stay light: the landing art and video are made for it.
  const pathname = usePathname();
  const inApp = pathname?.startsWith("/dashboard") ?? false;

  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        forcedTheme={inApp ? undefined : "light"}
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ClerkProvider>
  );
}
