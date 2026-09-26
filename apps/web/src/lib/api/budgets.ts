import type { Budget, UpsertBudgetPayload } from "@/types";
import { request } from "./http";

export const listBudgets = () => request<Budget[]>("/api/budgets");

export const upsertBudget = (data: UpsertBudgetPayload) => request<Budget>("/api/budgets", "PUT", data);

export const deleteBudget = (id: string) => request<void>(`/api/budgets/${id}`, "DELETE");
