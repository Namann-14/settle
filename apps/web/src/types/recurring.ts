export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface RecurringExpense {
  id: string;
  description: string;
  amount: string;
  currency: string;
  category_id: string | null;
  frequency: Frequency;
  interval: number;
  /** ISO dates. */
  start_date: string;
  end_date: string | null;
  next_run_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringPayload {
  description: string;
  amount: string;
  currency?: string;
  category_id?: string | null;
  frequency: Frequency;
  interval?: number;
  start_date: string;
  end_date?: string | null;
}

export interface UpdateRecurringPayload {
  description?: string;
  amount?: string;
  currency?: string;
  category_id?: string | null;
  frequency?: Frequency;
  interval?: number;
  end_date?: string | null;
  is_active?: boolean;
}

export interface RecurringSyncResult {
  created: number;
}
