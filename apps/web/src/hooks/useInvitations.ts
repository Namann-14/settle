import { useQuery } from "@tanstack/react-query";
import { listMyInvitations } from "@/lib/api/groups";

/** Pending group invites addressed to the signed-in user. */
export function useMyInvitations() {
  return useQuery({
    queryKey: ["my-invitations"],
    queryFn: listMyInvitations,
    // Invites arrive from other people, so check in now and then.
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
