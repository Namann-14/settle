"use client";

import { Toaster } from "@settle/ui/components/sonner";
import { TooltipProvider } from "@settle/ui/components/tooltip";

import { ThemeProvider } from "./theme-provider";
import { ClerkProvider } from "@clerk/nextjs";

import { QueryProvider } from "./query-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" forcedTheme="light" enableSystem disableTransitionOnChange>
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProvider>
        <Toaster richColors />
      </ThemeProvider>
    </ClerkProvider>
  );
}
