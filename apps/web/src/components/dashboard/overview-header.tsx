"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Skeleton } from "@settle/ui/components/skeleton";

import { useGreeting } from "@/components/dashboard/home-composer";
import { Eyebrow } from "@/components/dashboard/panel";

export function OverviewHeader() {
  const greeting = useGreeting();
  // Date is client-only for the same hydration reason as the greeting.
  const [today, setToday] = useState<string | null>(null);
  useEffect(
    () =>
      setToday(
        new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }),
      ),
    [],
  );

  // Italicise the name after the comma to echo the landing page headlines.
  const [lead, name] = greeting?.split(", ") ?? [];

  return (
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-2">
        {today ? <Eyebrow>{today}</Eyebrow> : <Skeleton className="h-3 w-40 rounded-full" />}
        {greeting ? (
          <h1 className="font-display text-4xl leading-none tracking-tight text-foreground md:text-5xl">
            {name ? (
              <>
                {lead}, <em className="italic">{name}</em>
              </>
            ) : (
              greeting
            )}
          </h1>
        ) : (
          <Skeleton className="h-10 w-72 max-w-full rounded-xl md:h-12" />
        )}
        <p className="text-[15px] text-muted-foreground">Here’s where your groups stand today.</p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] sm:self-auto"
      >
        <Sparkles className="size-4" />
        Ask Settle AI
      </Link>
    </div>
  );
}
