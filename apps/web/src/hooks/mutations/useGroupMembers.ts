import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelInvitation, inviteMember, removeMember } from "@/lib/api/groups";
import type { InviteMemberPayload } from "@/types";

export function useInviteMember(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteMemberPayload) => inviteMember(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group-invitations", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-balances", groupId] });
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
