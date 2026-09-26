export interface Budget {
  id: string;
  /** null => the overall monthly budget. */
  category_id: string | null;
  amount: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertBudgetPayload {
  category_id: string | null;
  amount: string;
  currency?: string;
}
