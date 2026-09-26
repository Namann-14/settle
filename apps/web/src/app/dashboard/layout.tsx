import {
  SidebarInset,
  SidebarProvider,
} from "@settle/ui/components/sidebar";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { RecurringSync } from "@/components/dashboard/recurring-sync";
import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <RecurringSync />
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
