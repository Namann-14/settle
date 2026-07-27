export type SplitType = "EQUAL" | "UNEQUAL" | "PERCENTAGE";

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount_owed: number | string;
  percentage?: number | string | null;
  share?: number | string | null;
}

export interface CreateExpenseSplitPayload {
  user_id: string;
  amount_owed: number | string;
  percentage?: number | string | null;
  share?: number | string | null;
}

export interface Expense {
  id: string;
  description: string;
  merchant?: string | null;
  amount: number | string;
  currency: string;
  date: string;
  notes?: string | null;
  split_type: SplitType;
  deleted_at?: string | null;
  group_id?: string | null;
  category_id?: string | null;
  paid_by_id: string;
  created_by_id: string;
  recurring_expense_id?: string | null;
  created_at: string;
  updated_at: string;
  splits: ExpenseSplit[];
}

export interface CreateExpensePayload {
  description: string;
  merchant?: string | null;
  amount: number | string;
  currency?: string;
  date: string;
  notes?: string | null;
  split_type: SplitType;
  group_id?: string | null;
  category_id?: string | null;
  paid_by_id?: string | null;
  splits?: CreateExpenseSplitPayload[];
}

export interface UpdateExpensePayload {
  description?: string | null;
  merchant?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  date?: string | null;
  notes?: string | null;
  split_type?: SplitType | null;
  group_id?: string | null;
  category_id?: string | null;
  paid_by_id?: string | null;
  splits?: CreateExpenseSplitPayload[] | null;
}

export interface ListExpensesParams {
  group_id?: string;
  skip?: number;
  limit?: number;
}
