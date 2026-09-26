import "server-only";

import {
  HydrationBoundary,
  QueryClient,
  defaultShouldDehydrateQuery,
  dehydrate,
} from "@tanstack/react-query";
import { connection } from "next/server";

import { backendFetch } from "@/lib/backend";
import type {
  ListExpensesParams,
  ListIncomesParams,
  ListSettlementsParams,
} from "@/types";

// Server-side prefetching for the dashboard. Without it, data only starts
// loading after the page's JS and Clerk have booted in the browser, and then
// every card goes browser -> Next proxy -> api. Here the server starts those
// same api calls while it renders, and streams the results into the React
// Query cache under the exact keys the client hooks use, so the hooks find
// their data already there (or in flight) instead of fetching it again.

const qs = (params?: object) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
};

/**
 * Query definitions mirroring the client hooks in src/hooks. The keys must
 * match those hooks exactly, or the prefetched data is simply never used.
 */
export const serverQueries = {
  currentUser: () => ({ queryKey: ["currentUser"], queryFn: () => backendFetch("/users/me") }),
  groups: () => ({ queryKey: ["groups"], queryFn: () => backendFetch("/groups") }),
  group: (id: string) => ({ queryKey: ["groups", id], queryFn: () => backendFetch(`/groups/${id}`) }),
  groupBalances: (id: string) => ({
    queryKey: ["group-balances", id],
    queryFn: () => backendFetch(`/groups/${id}/balances`),
  }),
  categories: () => ({ queryKey: ["categories"], queryFn: () => backendFetch("/categories") }),
  expenses: (params: ListExpensesParams) => ({
    queryKey: ["expenses", params],
    queryFn: () => backendFetch(`/expenses${qs(params)}`),
  }),
  settlements: (params: ListSettlementsParams) => ({
    queryKey: ["settlements", params],
    queryFn: () => backendFetch(`/settlements${qs(params)}`),
  }),
  spendingSummary: (month?: string) => ({
    queryKey: ["spending-summary", month ?? "current"],
    queryFn: () => backendFetch(`/spending/summary${qs({ month })}`),
  }),
  budgets: () => ({ queryKey: ["budgets"], queryFn: () => backendFetch("/budgets") }),
  recurring: () => ({ queryKey: ["recurring"], queryFn: () => backendFetch("/recurring") }),
  incomes: (params: ListIncomesParams) => ({
    queryKey: ["incomes", params],
    queryFn: () => backendFetch(`/incomes${qs(params)}`),
  }),
};

type ServerQuery = ReturnType<(typeof serverQueries)[keyof typeof serverQueries]>;

/**
 * Starts `queries` on the server and hands them to the client cache.
 *
 * The prefetches are deliberately not awaited: the page's HTML streams out
 * straight away, and each query's result follows on the same response when
 * it resolves (pending queries are dehydrated as promises). A query that
 * fails on the server just leaves the client hook to fetch it as before.
 */
export async function Prefetch({ queries, children }: { queries: ServerQuery[]; children: React.ReactNode }) {
  // Per-user data: render on every request, never at build time.
  await connection();
  const queryClient = new QueryClient({
    defaultOptions: {
      // Match the browser client, so hydrated data isn't refetched on arrival.
      queries: { staleTime: 5 * 60 * 1000 },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
        // Errors can carry backend detail; the client refetches instead.
        shouldRedactErrors: () => true,
      },
    },
  });
  for (const query of queries) {
    void queryClient.prefetchQuery(query);
  }
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
