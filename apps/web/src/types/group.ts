export type GroupRole = "ADMIN" | "MEMBER";

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  user_name?: string | null;
  user_email?: string | null;
  role: GroupRole;
  removed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  default_currency: string;
  created_by_id: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
  members: GroupMember[];
}

export interface CreateGroupPayload {
  name: string;
  description?: string | null;
  default_currency?: string;
}

export interface UpdateGroupPayload {
  name?: string | null;
  description?: string | null;
  default_currency?: string | null;
}

export interface AddMemberPayload {
  user_id: string;
  role?: GroupRole;
}

export interface MemberBalance {
  user_id: string;
  user_name?: string | null;
  user_email?: string | null;
  /** Positive: the group owes them. Negative: they owe the group. */
  net: number | string;
}

export interface Transfer {
  from_user_id: string;
  to_user_id: string;
  amount: number | string;
}

export interface GroupBalances {
  group_id: string;
  currency: string;
  members: MemberBalance[];
  transfers: Transfer[];
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export interface Invitation {
  id: string;
  group_id: string;
  email: string;
  status: InvitationStatus;
  expires_at: string;
  invited_by_id: string;
  created_at: string;
}

export interface InviteMemberPayload {
  email: string;
  role?: GroupRole;
}

export interface InviteMemberResponse {
  status: "added" | "invited";
  member?: GroupMember | null;
  invitation?: Invitation | null;
}
