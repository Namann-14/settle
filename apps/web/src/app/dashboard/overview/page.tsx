import { PageContainer } from "@/components/dashboard/panel";
import { GroupsList, RecentActivity } from "@/components/dashboard/overview-lists";
import { StandingSection } from "@/components/dashboard/standing";
import { ThisMonthCard } from "@/components/dashboard/this-month-card";
import { Prefetch, serverQueries } from "@/lib/server-prefetch";

// Answers "where do I stand?": the net and a two-column ledger first, then
// groups, recent activity and this month's spending. currentUser and groups
// are prefetched by the dashboard layout; group balances follow on the client
// once the group ids are known.
export default function OverviewPage() {
  return (
    <Prefetch
      queries={[
        serverQueries.expenses({ limit: 8 }),
        serverQueries.settlements({ limit: 8 }),
        serverQueries.spendingSummary(),
      ]}
    >
      <PageContainer>
        <StandingSection />
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <GroupsList />
          <RecentActivity />
        </div>
        <ThisMonthCard />
      </PageContainer>
    </Prefetch>
  );
}
