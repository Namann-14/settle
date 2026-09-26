import { SpendingOverview } from "@/components/spending/spending-overview";
import { currentMonth, isMonth, monthBounds } from "@/lib/months";
import { Prefetch, serverQueries } from "@/lib/server-prefetch";

export default async function SpendingPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const { month: requested } = await searchParams;
  const month = isMonth(requested) ? requested : currentMonth();
  const { from, to } = monthBounds(month);
  return (
    <Prefetch
      queries={[
        serverQueries.spendingSummary(month),
        serverQueries.expenses({ limit: 100, date_from: from, date_to: to }),
        serverQueries.incomes({ date_from: from, date_to: to }),
      ]}
    >
      <SpendingOverview month={month} />
    </Prefetch>
  );
}
