import type { CreateIncomePayload, Income, ListIncomesParams, UpdateIncomePayload } from "@/types";
import { request, withQuery } from "./http";

export const listIncomes = (params?: ListIncomesParams) =>
  request<Income[]>(withQuery("/api/incomes", params));

export const createIncome = (data: CreateIncomePayload) => request<Income>("/api/incomes", "POST", data);

export const updateIncome = (id: string, data: UpdateIncomePayload) =>
  request<Income>(`/api/incomes/${id}`, "PATCH", data);

export const deleteIncome = (id: string) => request<void>(`/api/incomes/${id}`, "DELETE");
