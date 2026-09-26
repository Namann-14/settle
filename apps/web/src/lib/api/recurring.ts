import type {
  CreateRecurringPayload,
  RecurringExpense,
  RecurringSyncResult,
  UpdateRecurringPayload,
} from "@/types";
import { request } from "./http";

export const listRecurring = () => request<RecurringExpense[]>("/api/recurring");

export const createRecurring = (data: CreateRecurringPayload) =>
  request<RecurringExpense>("/api/recurring", "POST", data);

export const updateRecurring = (id: string, data: UpdateRecurringPayload) =>
  request<RecurringExpense>(`/api/recurring/${id}`, "PATCH", data);

export const deleteRecurring = (id: string) => request<void>(`/api/recurring/${id}`, "DELETE");

/** Creates every occurrence due on or before `today` (the user's local date). */
export const syncRecurring = (today: string) =>
  request<RecurringSyncResult>("/api/recurring/sync", "POST", { today });
