import type {
  Group,
  GroupMember,
  CreateGroupPayload,
  UpdateGroupPayload,
  AddMemberPayload,
  GroupBalances,
  Invitation,
  InviteMemberPayload,
  InviteMemberResponse,
  JoinLink,
  JoinPreview,
} from "@/types";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === "object" && "detail" in errorData) {
        errorMessage = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
      } else if (errorData && typeof errorData === "object" && "message" in errorData) {
        errorMessage = String(errorData.message);
      }
    } catch {
      const text = await response.text().catch(() => "");
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

export async function listGroups(): Promise<Group[]> {
  const response = await fetch("/api/groups", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<Group[]>(response);
}

export async function getGroup(id: string): Promise<Group> {
  const response = await fetch(`/api/groups/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<Group>(response);
}

export async function createGroup(data: CreateGroupPayload): Promise<Group> {
  const response = await fetch("/api/groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Group>(response);
}

export async function updateGroup(id: string, data: UpdateGroupPayload): Promise<Group> {
  const response = await fetch(`/api/groups/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Group>(response);
}

export async function deleteGroup(id: string): Promise<void> {
  const response = await fetch(`/api/groups/${id}`, {
    method: "DELETE",
  });
  return handleResponse<void>(response);
}

export async function addMember(groupId: string, data: AddMemberPayload): Promise<GroupMember> {
  const response = await fetch(`/api/groups/${groupId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<GroupMember>(response);
}

export async function getGroupBalances(groupId: string): Promise<GroupBalances> {
  const response = await fetch(`/api/groups/${groupId}/balances`);
  return handleResponse<GroupBalances>(response);
}

export async function inviteMember(
  groupId: string,
  data: InviteMemberPayload,
): Promise<InviteMemberResponse> {
  const response = await fetch(`/api/groups/${groupId}/invitations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<InviteMemberResponse>(response);
}

export async function listInvitations(groupId: string): Promise<Invitation[]> {
  const response = await fetch(`/api/groups/${groupId}/invitations`);
  return handleResponse<Invitation[]>(response);
}

export async function cancelInvitation(groupId: string, invitationId: string): Promise<void> {
  const response = await fetch(`/api/groups/${groupId}/invitations/${invitationId}`, {
    method: "DELETE",
  });
  return handleResponse<void>(response);
}

export async function removeMember(groupId: string, memberId: string): Promise<void> {
  const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
    method: "DELETE",
  });
  return handleResponse<void>(response);
}

export async function getJoinLink(groupId: string): Promise<JoinLink> {
  const response = await fetch(`/api/groups/${groupId}/join-link`);
  return handleResponse<JoinLink>(response);
}

export async function resetJoinLink(groupId: string): Promise<JoinLink> {
  const response = await fetch(`/api/groups/${groupId}/join-link`, { method: "POST" });
  return handleResponse<JoinLink>(response);
}

export async function previewJoin(code: string): Promise<JoinPreview> {
  const response = await fetch(`/api/groups/join/${encodeURIComponent(code)}`);
  return handleResponse<JoinPreview>(response);
}

export async function joinGroup(code: string): Promise<Group> {
  const response = await fetch(`/api/groups/join/${encodeURIComponent(code)}`, { method: "POST" });
  return handleResponse<Group>(response);
}

export async function listMyInvitations(): Promise<Invitation[]> {
  const response = await fetch("/api/invitations");
  return handleResponse<Invitation[]>(response);
}

export async function respondToInvitation(
  invitationId: string,
  action: "accept" | "decline",
): Promise<Group | undefined> {
  const response = await fetch(`/api/invitations/${invitationId}/${action}`, { method: "POST" });
  return handleResponse<Group | undefined>(response);
}
