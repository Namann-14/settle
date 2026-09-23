import { Gauge } from "lucide-react";

import { AskAiCard } from "@/components/dashboard/ask-ai-card";
import { CostAnalysisCard, SpendChartCard } from "@/components/dashboard/chart-cards";
import { DashboardPlaceholderCard } from "@/components/dashboard/dashboard-placeholder-card";
import { GroupsCard } from "@/components/dashboard/groups-card";
import { QuickTipCard } from "@/components/dashboard/quick-tip-card";
import { RecentSettlementsCard } from "@/components/dashboard/recent-settlements-card";
import { TransactionHistoryCard } from "@/components/dashboard/transaction-history-card";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SpendChartCard />
      </div>
      <div className="flex flex-col gap-4">
        <GroupsCard />
      </div>

      <div className="lg:col-span-3">
        <TransactionHistoryCard />
      </div>

      <div className="lg:col-span-1">
        <CostAnalysisCard />
      </div>
      <DashboardPlaceholderCard
        title="Financial health"
        description="Overall balance health across your groups."
        icon={Gauge}
      />
      <AskAiCard />

      <div className="lg:col-span-2">
        <RecentSettlementsCard />
      </div>
      <QuickTipCard />
    </div>
  );
}
