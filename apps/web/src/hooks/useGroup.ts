import { useQuery } from "@tanstack/react-query";
import { getGroup, getGroupBalances, getJoinLink, listInvitations, previewJoin } from "@/lib/api/groups";

export function useGroup(id: string | undefined, options: { refetchOnMount?: boolean | "always" } = {}) {
  return useQuery({
    queryKey: ["groups", id],
    queryFn: () => getGroup(id!),
    enabled: !!id,
    ...options,
  });
}

export function useGroupBalances(id: string | undefined) {
  return useQuery({
    queryKey: ["group-balances", id],
    queryFn: () => getGroupBalances(id!),
    enabled: !!id,
  });
}

export function useGroupInvitations(id: string) {
  return useQuery({
    queryKey: ["group-invitations", id],
    queryFn: () => listInvitations(id),
  });
}

export function useJoinLink(groupId: string) {
  return useQuery({
    queryKey: ["group-join-link", groupId],
    queryFn: () => getJoinLink(groupId),
  });
}

export function useJoinPreview(code: string) {
  return useQuery({
    queryKey: ["group-join", code],
    queryFn: () => previewJoin(code),
    retry: false,
  });
}
