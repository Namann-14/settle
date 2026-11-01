# apps/web/src/components/settings/telegram-card.tsx

**Purpose:** Settings panel for linking or unlinking the user's Telegram account (expense bot).

**Key contents:** Client `Panel`: requests a link code, shows app/browser deep links with a countdown and a `/start <code>` fallback, polls the current-user query until `telegram_linked` flips, and offers unlink. Its three states (not linked / waiting / linked) render as plain content inside the panel, no nested bordered boxes; buttons are `buttonClass` pills (Unlink uses the danger wash).

**Depends on / used by:** Uses `useCreateTelegramLinkCode`/`useUnlinkTelegram` (mutations/useTelegramLink.ts), `useCurrentUser`, and `Panel`/`PanelHeader`/`buttonClass` from dashboard components; rendered by the settings page.

**Decisions & caveats:** Uses a `tg://resolve` deep link so linking works where t.me is blocked. While a code is live the profile is invalidated every few seconds to detect linking; polling stops on expiry. The countdown is deliberately not an aria-live region (it would announce every second).
