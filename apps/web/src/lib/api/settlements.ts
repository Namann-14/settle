import type {
  Settlement,
  CreateSettlementPayload,
  UpdateSettlementPayload,
  ListSettlementsParams,
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

export async function listSettlements(params?: ListSettlementsParams): Promise<Settlement[]> {
  const searchParams = new URLSearchParams();
  if (params?.group_id) searchParams.set("group_id", params.group_id);
  if (params?.skip !== undefined) searchParams.set("skip", params.skip.toString());
  if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = `/api/settlements${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<Settlement[]>(response);
}

export async function createSettlement(data: CreateSettlementPayload): Promise<Settlement> {
  const response = await fetch("/api/settlements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Settlement>(response);
}

export async function updateSettlement(id: string, data: UpdateSettlementPayload): Promise<Settlement> {
  const response = await fetch(`/api/settlements/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Settlement>(response);
}

export async function deleteSettlement(id: string): Promise<void> {
  const response = await fetch(`/api/settlements/${id}`, {
    method: "DELETE",
  });
  return handleResponse<void>(response);
}
