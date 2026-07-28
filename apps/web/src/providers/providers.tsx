"use client";

import { Toaster } from "@settle/ui/components/sonner";

import { ThemeProvider } from "./theme-provider";
import { ClerkProvider } from "@clerk/nextjs";

import { QueryProvider } from "./query-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" forcedTheme="light" enableSystem disableTransitionOnChange>
        <QueryProvider>{children}</QueryProvider>
        <Toaster richColors />
      </ThemeProvider>
    </ClerkProvider>
  );
}
