export interface Income {
  id: string;
  amount: string;
  currency: string;
  /** ISO date. */
  date: string;
  source: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateIncomePayload {
  amount: string;
  currency?: string;
  date: string;
  source: string;
  notes?: string | null;
}

export type UpdateIncomePayload = Partial<CreateIncomePayload>;

export interface ListIncomesParams {
  date_from?: string;
  date_to?: string;
  limit?: number;
}
