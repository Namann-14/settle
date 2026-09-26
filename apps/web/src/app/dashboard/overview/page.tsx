import { AskAiCard } from "@/components/dashboard/ask-ai-card";
import { BalanceSummary } from "@/components/dashboard/balance-summary";
import { CostAnalysisCard, SpendChartCard } from "@/components/dashboard/chart-cards";
import { GroupsCard } from "@/components/dashboard/groups-card";
import { OverviewHeader } from "@/components/dashboard/overview-header";
import { ThisMonthCard } from "@/components/dashboard/this-month-card";
import { RecentSettlementsCard } from "@/components/dashboard/recent-settlements-card";
import { TransactionHistoryCard } from "@/components/dashboard/transaction-history-card";

export default function OverviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-2 py-4 md:px-4 md:py-6">
      <OverviewHeader />
      <BalanceSummary />
      <ThisMonthCard />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendChartCard />
        </div>
        <CostAnalysisCard />

        <GroupsCard />
        <div className="lg:col-span-2">
          <TransactionHistoryCard />
        </div>

        <div className="lg:col-span-2">
          <AskAiCard />
        </div>
        <RecentSettlementsCard />
      </div>
    </div>
  );
}
