# apps/web/src/components/settings/telegram-card.tsx

**Purpose:** Settings panel for linking or unlinking the user's Telegram account (expense bot).

**Key contents:** Client card: requests a link code, shows a deep link with a countdown, polls the current-user query until `telegram_linked` flips, and offers unlink.

**Depends on / used by:** Uses `useCreateTelegramLinkCode`/`useUnlinkTelegram` (mutations/useTelegramLink.ts), `useCurrentUser`, and `Panel` from dashboard components; relates to the Telegram bot feature.

**Decisions & caveats:** Uses a `tg://resolve` deep link so linking works where t.me is blocked. While a code is live the profile is invalidated every few seconds to detect linking; polling stops on expiry.
