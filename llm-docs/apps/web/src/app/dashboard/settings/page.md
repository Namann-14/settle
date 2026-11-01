# apps/web/src/app/dashboard/settings/page.tsx

**Purpose:** Settings route.

**Key contents:** `PageContainer narrow` > `PageHeader` "Settings" > `AccountPanel`, `AppearancePanel`, then a "Connections" section holding `TelegramCard`.

**Depends on / used by:** Uses `components/dashboard/panel` (PageContainer, PageHeader) and `components/settings/*`. Backed by the `api/users/me` and `api/users/me/telegram` routes.

**Decisions & caveats:** Server component; every panel is a client component that owns its loading state. The Telegram bot replaced the earlier expense bot (see git history, feat/telegram-bot).
