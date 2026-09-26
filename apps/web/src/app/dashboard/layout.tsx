import { SidebarInset, SidebarProvider } from "@settle/ui/components/sidebar";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { RecurringSync } from "@/components/dashboard/recurring-sync";
import { Topbar } from "@/components/dashboard/topbar";
import { Prefetch, serverQueries } from "@/lib/server-prefetch";
import { DashboardProviders } from "@/providers/dashboard-providers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProviders>
      {/* Data nearly every dashboard page and dialog needs. */}
      <Prefetch
        queries={[
          serverQueries.currentUser(),
          serverQueries.groups(),
          serverQueries.categories(),
        ]}
      >
        <SidebarProvider>
          <RecurringSync />
          <AppSidebar />
          <SidebarInset>
            <Topbar />
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </Prefetch>
    </DashboardProviders>
  );
}
