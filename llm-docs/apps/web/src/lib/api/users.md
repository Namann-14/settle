# apps/web/src/lib/api/users.ts

**Purpose:** Client for the current user and Telegram linking.

**Key contents:** `getCurrentUser`, `updateCurrentUser` (PATCH `/api/users/me`), `createTelegramLinkCode`, `unlinkTelegram`.

**Depends on / used by:** `types/user.ts`; `hooks/useCurrentUser.ts`; settings UI.

**Decisions & caveats:** Has its own copy of `handleResponse`. The Telegram link flow uses a short-lived code returned with a deep link to the bot.
