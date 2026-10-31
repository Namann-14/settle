"use client";

import { UserButton, useUser } from "@clerk/nextjs";

import { SidebarTrigger } from "@settle/ui/components/sidebar";

import { SearchPalette } from "@/components/dashboard/search-palette";
import { InvitationsBell } from "@/components/groups/invitations-bell";

export function Topbar() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="rounded-full" />
      <div className="max-w-sm flex-1">
        <SearchPalette />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <InvitationsBell />
        <span className="hidden text-[13px] text-muted-foreground sm:inline">
          {user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
        </span>
        <UserButton />
      </div>
    </header>
  );
}
