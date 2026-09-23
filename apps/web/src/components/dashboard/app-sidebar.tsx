"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { HandCoins } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@settle/ui/components/sidebar";

import { NavMain } from "@/components/dashboard/nav-main";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-1.5 font-display text-lg"
        >
          <HandCoins className="size-5 shrink-0 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">Settle</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
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
