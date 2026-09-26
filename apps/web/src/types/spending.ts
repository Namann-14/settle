/** Money fields are decimal strings, like everywhere else in the API. */
export interface CategorySpend {
  category_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  amount: string;
  count: number;
  budget: string | null;
}

/**
 * One month of the user's own spending: the full amount of personal expenses
 * plus their share of group expenses, in their default currency only.
 */
export interface SpendingSummary {
  /** YYYY-MM */
  month: string;
  currency: string;
  total: string;
  previous_total: string;
  expense_count: number;
  personal_total: string;
  group_share_total: string;
  overall_budget: string | null;
  by_category: CategorySpend[];
  daily: { date: string; amount: string }[];
  trend: { month: string; amount: string }[];
  top_merchants: { name: string; amount: string; count: number }[];
  other_currencies: { currency: string; amount: string }[];
  income_total: string;
  net: string;
}
