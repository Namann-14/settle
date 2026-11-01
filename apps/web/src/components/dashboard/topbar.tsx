"use client";

import { UserButton, useUser } from "@clerk/nextjs";

import { SidebarTrigger } from "@settle/ui/components/sidebar";

import { SearchPalette } from "@/components/dashboard/search-palette";
import { InvitationsBell } from "@/components/groups/invitations-bell";

export function Topbar() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:px-6">
      <SidebarTrigger className="rounded-full" />
      <div className="min-w-0 max-w-sm flex-1">
        <SearchPalette />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <InvitationsBell />
        <span className="hidden text-meta text-muted-foreground sm:inline">
          {user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
        </span>
        <UserButton />
      </div>
    </header>
  );
}
