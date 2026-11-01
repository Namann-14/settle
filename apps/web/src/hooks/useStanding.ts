import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGroups } from "@/hooks/useGroups";
import { getGroupBalances } from "@/lib/api/groups";
import { computeStanding } from "@/lib/balances";
import type { GroupBalances } from "@/types";

/**
 * Where the current user stands across all their groups, built from each
 * group's server-side balances. Shares the ["group-balances", id] key with
 * useGroupBalances, so group pages and this hook reuse each other's cache.
 */
export function useStanding() {
  const me = useCurrentUser();
  const groups = useGroups();
  const ids = useMemo(() => (groups.data ?? []).map((g) => g.id), [groups.data]);

  const balances = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["group-balances", id],
      queryFn: () => getGroupBalances(id),
    })),
    combine: (results) => ({
      data: results.map((r) => r.data),
      isLoading: results.some((r) => r.isLoading),
      isError: results.some((r) => r.isError),
      refetch: () => results.filter((r) => r.isError).forEach((r) => r.refetch()),
    }),
  });

  const standing = useMemo(() => {
    if (!me.data || !groups.data || balances.isLoading) return null;
    const byGroup = new Map<string, GroupBalances>();
    balances.data.forEach((b, i) => b && byGroup.set(ids[i], b));
    return computeStanding(groups.data, byGroup, me.data.id);
  }, [me.data, groups.data, balances.data, balances.isLoading, ids]);

  return {
    standing,
    groups: groups.data,
    currency: me.data?.default_currency ?? "INR",
    isLoading: me.isLoading || groups.isLoading || balances.isLoading,
    isError: me.isError || groups.isError || balances.isError,
    retry: () => {
      if (me.isError) me.refetch();
      if (groups.isError) groups.refetch();
      balances.refetch();
    },
  };
}
