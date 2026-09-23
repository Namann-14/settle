import type { SplitType } from "./expense";

export interface CategorySuggestion {
  category_id?: string | null;
  category_name: string;
  confidence: number;
  reasoning?: string | null;
}

export interface ResolvedParticipant {
  raw_name: string;
  user_id?: string | null;
  resolution: "self" | "matched" | "unresolved" | "ambiguous";
  candidates: string[];
}

/** Draft produced by services/ai from text or voice. Never saved by the AI itself. */
export interface ExpenseDraft {
  source_type: "NL_TEXT" | "RECEIPT_IMAGE" | "VOICE";
  amount?: number | null;
  currency: string;
  description: string;
  merchant?: string | null;
  date?: string | null;
  category?: CategorySuggestion | null;
  split_type: SplitType;
  group_id?: string | null;
  paid_by_id?: string | null;
  participants: ResolvedParticipant[];
  confidence: number;
  warnings: string[];
  transcript?: string | null;
  raw_text?: string | null;
}

export interface PlannedTransfer {
  index: number;
  group_id: string;
  group_name?: string | null;
  currency: string;
  from_user_id: string;
  from_name?: string | null;
  to_user_id: string;
  to_name?: string | null;
  amount: number;
  direction: "incoming" | "outgoing" | "others";
  reminder?: string | null;
}

export interface SettlePlan {
  headline: string;
  transfers: PlannedTransfer[];
}

export interface GroupInsight {
  group_id: string;
  group_name?: string | null;
  period_days: number;
  currency: string;
  total_spent: number;
  expense_count: number;
  top_category?: string | null;
  top_category_share_pct?: number | null;
  top_payer?: { user_id: string; name?: string | null; total: number; is_me: boolean } | null;
  delta_pct?: number | null;
  narrative: string;
}
