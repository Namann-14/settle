import type { SpendingSummary } from "@/types";
import { request, withQuery } from "./http";

export const getSpendingSummary = (month?: string, trendMonths?: number) =>
  request<SpendingSummary>(withQuery("/api/spending/summary", { month, trend_months: trendMonths }));
