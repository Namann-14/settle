"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HandCoins,
  LayoutDashboard,
  Receipt,
  SquarePen,
  Users,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@settle/ui/components/sidebar";

const items = [
  { title: "New chat", url: "/dashboard" as const, icon: SquarePen },
  { title: "Overview", url: "/dashboard/overview" as const, icon: LayoutDashboard },
  { title: "Groups", url: "/dashboard/groups" as const, icon: Users },
  { title: "Expenses", url: "/dashboard/expenses" as const, icon: Receipt },
  { title: "Settlements", url: "/dashboard/settlements" as const, icon: HandCoins },
];

// "/dashboard" only matches exactly; the rest also match their sub-pages
// (e.g. /dashboard/groups/<id> keeps Groups highlighted).
function isActive(pathname: string, url: string) {
  return url === "/dashboard" ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);
}

export function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              render={<Link href={item.url} />}
              isActive={isActive(pathname, item.url)}
              tooltip={item.title}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
