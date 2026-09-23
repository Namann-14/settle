"use client";

import dynamic from "next/dynamic";

import {
  CategoryPanelSkeleton,
  ChartPanelSkeleton,
} from "@/components/dashboard/overview-skeleton";

// Chart cards pull in recharts (a genuinely large client-only dependency) —
// keep them out of the server render entirely and lazy-load on the client.
// `ssr: false` requires this to live in a Client Component — Next.js
// disallows it directly inside a Server Component like dashboard/page.tsx.
export const SpendChartCard = dynamic(
  () => import("@/components/dashboard/spend-chart-card").then((m) => m.SpendChartCard),
  { ssr: false, loading: () => <ChartPanelSkeleton /> },
);

export const CostAnalysisCard = dynamic(
  () => import("@/components/dashboard/cost-analysis-card").then((m) => m.CostAnalysisCard),
  { ssr: false, loading: () => <CategoryPanelSkeleton /> },
);
