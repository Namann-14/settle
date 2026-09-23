import type { ChatThreadSummary } from "@/lib/chat-types";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === "object" && "message" in errorData) {
        errorMessage = String(errorData.message);
      }
    } catch {
      // keep the status-line message
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

export async function listChatThreads(): Promise<ChatThreadSummary[]> {
  const response = await fetch("/api/chat/threads");
  return handleResponse<ChatThreadSummary[]>(response);
}

export async function deleteChatThread(id: string): Promise<void> {
  const response = await fetch(`/api/chat/threads/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return handleResponse<void>(response);
}
