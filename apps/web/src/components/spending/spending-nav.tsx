"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@settle/ui/lib/utils";

const TABS = [
  { label: "Overview", href: "/dashboard/spending" as const },
  { label: "Budgets", href: "/dashboard/spending/budgets" as const },
  { label: "Recurring", href: "/dashboard/spending/recurring" as const },
  { label: "Categories", href: "/dashboard/spending/categories" as const },
];

export function SpendingNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Spending" className="flex gap-1 overflow-x-auto rounded-full bg-muted p-1 text-[13px] sm:self-start">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 transition-colors",
              active ? "bg-card font-medium text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
