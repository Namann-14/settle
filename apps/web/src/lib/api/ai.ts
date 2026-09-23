import type { ExpenseDraft, GroupInsight, SettlePlan } from "@/types";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === "object" && "message" in errorData) {
        errorMessage = String(errorData.message);
      }
    } catch {}
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function draftExpenseFromText(text: string, groupId?: string | null): Promise<ExpenseDraft> {
  const response = await fetch("/api/ai/expenses/from-text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, group_id: groupId || null }),
  });
  return handleResponse<ExpenseDraft>(response);
}

export async function draftExpenseFromVoice(audio: Blob, groupId?: string | null): Promise<ExpenseDraft> {
  const form = new FormData();
  form.append("file", audio, "recording.webm");
  if (groupId) form.append("group_id", groupId);
  const response = await fetch("/api/ai/expenses/from-voice", {
    method: "POST",
    body: form,
  });
  return handleResponse<ExpenseDraft>(response);
}

export async function getGroupInsight(groupId: string, days = 30): Promise<GroupInsight> {
  const response = await fetch(`/api/ai/insights/group/${groupId}?days=${days}`);
  return handleResponse<GroupInsight>(response);
}

export async function getSettlePlan(groupId?: string): Promise<SettlePlan> {
  const response = await fetch("/api/ai/settlements/plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(groupId ? { group_id: groupId } : {}),
  });
  return handleResponse<SettlePlan>(response);
}
