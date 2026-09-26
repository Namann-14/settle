import { BudgetsPage } from "@/components/spending/budgets-page";
import { currentMonth } from "@/lib/months";
import { Prefetch, serverQueries } from "@/lib/server-prefetch";

export default function Page() {
  return (
    <Prefetch queries={[serverQueries.budgets(), serverQueries.spendingSummary(currentMonth())]}>
      <BudgetsPage />
    </Prefetch>
  );
}
