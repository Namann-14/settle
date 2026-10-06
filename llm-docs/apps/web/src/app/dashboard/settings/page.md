# apps/web/src/app/dashboard/settings/page.tsx

**Purpose:** Settings route; currently only holds Telegram linking.

**Key contents:** Heading plus `TelegramCard`.

**Depends on / used by:** Uses `components/settings/telegram-card` and `components/dashboard/panel` (Eyebrow). Backed by the `api/users/me/telegram` routes.

**Decisions & caveats:** The Telegram bot replaced the earlier expense bot (see git history, feat/telegram-bot). Page is intentionally minimal.
