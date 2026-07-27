export interface User {
  id: string;
  clerk_user_id: string;
  email: string | null;
  name: string | null;
  is_active: boolean;
  default_currency: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserPayload {
  email?: string | null;
  name?: string | null;
  is_active?: boolean;
  default_currency?: string;
}
