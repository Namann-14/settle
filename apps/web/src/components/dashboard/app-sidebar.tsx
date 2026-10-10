"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@settle/ui/components/sidebar";

import { NavChats } from "@/components/dashboard/nav-chats";
import { NavMain } from "@/components/dashboard/nav-main";
import { SettleMark } from "@/components/settle-logo";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-1.5 font-display text-lg"
        >
          <SettleMark className="size-5" />
          <span className="group-data-[collapsible=icon]:hidden">Settle</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavChats />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <UserButton />
          <span className="truncate text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            Account
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
