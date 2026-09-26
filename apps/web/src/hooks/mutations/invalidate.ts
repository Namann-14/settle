import type { QueryClient } from "@tanstack/react-query";

// Spending totals come from expenses, income and budgets.
export function invalidateSpending(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["spending-summary"] });
}

// Balances, the settle-up plan, group insights and spending totals are all
// derived from expenses and settlements, so any write to either makes them
// stale. The expense list is refreshed too, since recurring syncs add rows.
export function invalidateBalances(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["group-balances"] });
  queryClient.invalidateQueries({ queryKey: ["settle-plan"] });
  queryClient.invalidateQueries({ queryKey: ["group-insight"] });
  queryClient.invalidateQueries({ queryKey: ["expenses"] });
  invalidateSpending(queryClient);
}
