import type {
  Expense,
  CreateExpensePayload,
  UpdateExpensePayload,
  ListExpensesParams,
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

export async function listExpenses(params?: ListExpensesParams): Promise<Expense[]> {
  const searchParams = new URLSearchParams();
  if (params?.group_id) searchParams.set("group_id", params.group_id);
  if (params?.skip !== undefined) searchParams.set("skip", params.skip.toString());
  if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());

  const queryString = searchParams.toString();
  const url = `/api/expenses${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<Expense[]>(response);
}

export async function getExpense(id: string): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<Expense>(response);
}

export async function createExpense(data: CreateExpensePayload): Promise<Expense> {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Expense>(response);
}

export async function updateExpense(id: string, data: UpdateExpensePayload): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Expense>(response);
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
  });
  return handleResponse<void>(response);
}
