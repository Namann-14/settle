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

// Groups, Expenses and Settlements are intentionally not built yet, and
// typedRoutes would reject linking to pages that don't exist. Rendered as
// disabled "coming soon" items instead of dead links, consistent with the
// same pattern used for search/notifications elsewhere in this dashboard.
const items = [
  { title: "New chat", url: "/dashboard" as const, icon: SquarePen, enabled: true },
  { title: "Overview", url: "/dashboard/overview" as const, icon: LayoutDashboard, enabled: true },
  { title: "Groups", icon: Users, enabled: false },
  { title: "Expenses", icon: Receipt, enabled: false },
  { title: "Settlements", icon: HandCoins, enabled: false },
] as const;

export function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) =>
          item.enabled ? (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={pathname === item.url}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem key={item.title}>
              {/* Not `disabled`/`aria-disabled` — both trigger
                  pointer-events-none in this variant's CSS, which would
                  block hover and kill the tooltip below. No onClick is
                  attached, so this is already non-interactive; the styling
                  here is purely visual. */}
              <SidebarMenuButton
                className="cursor-not-allowed opacity-50"
                tooltip={`${item.title} — coming soon`}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
