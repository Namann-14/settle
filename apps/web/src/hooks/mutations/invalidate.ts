import type { QueryClient } from "@tanstack/react-query";

// Balances, the settle-up plan and group insights are all derived from
// expenses and settlements, so any write to either makes them stale.
export function invalidateBalances(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["group-balances"] });
  queryClient.invalidateQueries({ queryKey: ["settle-plan"] });
  queryClient.invalidateQueries({ queryKey: ["group-insight"] });
}
