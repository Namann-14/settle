export interface Settlement {
  id: string;
  amount: number | string;
  currency: string;
  note?: string | null;
  date: string;
  group_id?: string | null;
  paid_by_id: string;
  received_by_id: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSettlementPayload {
  amount: number | string;
  currency?: string;
  note?: string | null;
  date: string;
  group_id?: string | null;
  paid_by_id: string;
  received_by_id: string;
}

export interface UpdateSettlementPayload {
  amount?: number | string | null;
  currency?: string | null;
  note?: string | null;
  date?: string | null;
}

export interface ListSettlementsParams {
  group_id?: string;
  skip?: number;
  limit?: number;
}
