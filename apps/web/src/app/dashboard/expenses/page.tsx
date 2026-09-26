import { ExpensesPage } from "@/components/expenses/expenses-page";
import { Prefetch, serverQueries } from "@/lib/server-prefetch";

export default function Page() {
  // Same default filter as ExpensesPage: the last 30 days (a UTC ISO date on
  // both sides, so the key matches the one the client builds).
  const since = new Date();
  since.setDate(since.getDate() - 30);
  return (
    <Prefetch queries={[serverQueries.expenses({ limit: 100, date_from: since.toISOString().slice(0, 10) })]}>
      <ExpensesPage />
    </Prefetch>
  );
}
