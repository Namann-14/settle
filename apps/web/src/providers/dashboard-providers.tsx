"use client";

import { Toaster } from "@settle/ui/components/sonner";
import { TooltipProvider } from "@settle/ui/components/tooltip";

import { QueryProvider } from "./query-provider";

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster richColors />
    </QueryProvider>
  );
}
