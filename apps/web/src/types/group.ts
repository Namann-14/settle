export type GroupRole = "ADMIN" | "MEMBER";

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
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
