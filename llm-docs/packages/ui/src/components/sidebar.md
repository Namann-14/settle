# packages/ui/src/components/sidebar.tsx

**Purpose:** Full app sidebar system (collapsible, icon mode, mobile drawer) - the largest UI component.

**Key contents:** SidebarProvider (open state, cookie persistence, Ctrl/Cmd+B shortcut), Sidebar, SidebarTrigger, SidebarRail, SidebarInset, header/footer/content/group/menu/menu-button/submenu parts, and SidebarSkeleton variants. Widths: 16rem desktop, 18rem mobile, 3rem icon-only.

**Depends on / used by:** Uses use-mobile hook, sheet, button, input, separator, skeleton, tooltip, `cn`, cva. Used by the dashboard layout in apps/web; theme tokens come from `--sidebar-*` in styles/globals.css.

**Decisions & caveats:** State is persisted in a `sidebar_state` cookie (7 days), so a server layout can read it and avoid hydration flicker. On mobile it renders as a Sheet instead of a fixed panel. Menu buttons use Base UI `useRender` for polymorphism instead of Radix `asChild`.
