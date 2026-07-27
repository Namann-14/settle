import type {
  Group,
  GroupMember,
  CreateGroupPayload,
  UpdateGroupPayload,
  AddMemberPayload,
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
