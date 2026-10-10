# apps/web/src/types/user.ts

**Purpose:** Types for the current user and Telegram linking.

**Key contents:** `User` (default_currency, telegram_linked, telegram_username), `UpdateUserPayload`, `TelegramLinkCode`.

**Depends on / used by:** `lib/api/users.ts`.

**Decisions & caveats:** `clerk_user_id` ties the record to Clerk auth.
