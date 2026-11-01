"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";

import { SegmentedNav } from "@/components/dashboard/panel";

const TABS: readonly { label: string; href: Route }[] = [
  { label: "Overview", href: "/dashboard/spending" },
  { label: "Budgets", href: "/dashboard/spending/budgets" },
  { label: "Recurring", href: "/dashboard/spending/recurring" },
  { label: "Categories", href: "/dashboard/spending/categories" },
];

/** Sub-page navigation for Spending, in the shared pill track. */
export function SpendingNav() {
  const pathname = usePathname();
  return <SegmentedNav items={TABS} activeHref={pathname} label="Spending" />;
}
