"use client";

import { Bell, Search } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

import { Button } from "@settle/ui/components/button";
import { Input } from "@settle/ui/components/input";
import { SidebarTrigger } from "@settle/ui/components/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@settle/ui/components/tooltip";

export function Topbar() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="rounded-full" />
      <div className="relative max-w-sm flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        <Tooltip>
          {/* disabled inputs/buttons get pointer-events-none, which would kill
              hover entirely — wrap in a plain (non-disabled) span so the
              tooltip can still trigger on hover */}
          <TooltipTrigger render={<span className="block" />}>
            <Input
              className="h-9 rounded-full border-border bg-card pl-9 text-[13px] shadow-xs disabled:opacity-100"
              placeholder="Quick search"
              disabled
            />
          </TooltipTrigger>
          <TooltipContent>Search coming soon</TooltipContent>
        </Tooltip>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-border bg-card"
              aria-label="Notifications"
              disabled
            >
              <Bell />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications coming soon</TooltipContent>
        </Tooltip>
        <span className="hidden text-[13px] text-muted-foreground sm:inline">
          {user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
        </span>
        <UserButton />
      </div>
    </header>
  );
}
