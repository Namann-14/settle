export interface User {
  id: string;
  clerk_user_id: string;
  email: string | null;
  name: string | null;
  is_active: boolean;
  default_currency: string;
  telegram_linked: boolean;
  telegram_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserPayload {
  email?: string | null;
  name?: string | null;
  is_active?: boolean;
  default_currency?: string;
}

export interface TelegramLinkCode {
  code: string;
  expires_at: string;
  bot_username: string | null;
  deep_link: string | null;
}
