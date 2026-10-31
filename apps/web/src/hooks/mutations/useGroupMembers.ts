import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelInvitation,
  inviteMember,
  joinGroup,
  removeMember,
  resetJoinLink,
  respondToInvitation,
} from "@/lib/api/groups";
import type { InviteMemberPayload } from "@/types";

export function useInviteMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteMemberPayload) => inviteMember(groupId, data),
    onSuccess: () => {
      // Only a pending invite is created; membership changes when they accept.
      queryClient.invalidateQueries({ queryKey: ["group-invitations", groupId] });
    },
  });
}

export function useRemoveMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => removeMember(groupId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group-balances", groupId] });
    },
  });
}

export function useCancelInvitation(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => cancelInvitation(groupId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-invitations", groupId] });
    },
  });
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "decline" }) =>
      respondToInvitation(id, action),
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      if (action === "accept") queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => joinGroup(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group-join"] });
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
    },
  });
}

export function useResetJoinLink(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetJoinLink(groupId),
    onSuccess: (link) => {
      queryClient.setQueryData(["group-join-link", groupId], link);
    },
  });
}
