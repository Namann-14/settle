"use client";

import { Bell, Search } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

import { Button } from "@settle/ui/components/button";
import { Input } from "@settle/ui/components/input";
import { Separator } from "@settle/ui/components/separator";
import { SidebarTrigger } from "@settle/ui/components/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@settle/ui/components/tooltip";

export function Topbar() {
  const { user } = useUser();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Tooltip>
          {/* disabled inputs/buttons get pointer-events-none, which would kill
              hover entirely — wrap in a plain (non-disabled) span so the
              tooltip can still trigger on hover */}
          <TooltipTrigger render={<span className="block" />}>
            <Input className="pl-8" placeholder="Quick search" disabled />
          </TooltipTrigger>
          <TooltipContent>Search coming soon</TooltipContent>
        </Tooltip>
      </div>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          <Button variant="ghost" size="icon" disabled>
            <Bell />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Notifications coming soon</TooltipContent>
      </Tooltip>
      <span className="hidden text-sm text-muted-foreground sm:inline">
        {user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
      </span>
      <UserButton />
    </header>
  );
}
