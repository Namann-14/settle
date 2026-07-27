import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
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

export async function listCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse<Category[]>(response);
}

export async function createCategory(data: CreateCategoryPayload): Promise<Category> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Category>(response);
}

export async function updateCategory(id: string, data: UpdateCategoryPayload): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Category>(response);
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });
  return handleResponse<void>(response);
}
