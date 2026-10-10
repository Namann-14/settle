# apps/fumadocs/content/docs/telegram.mdx

**Purpose:** User and operator documentation for the Telegram expense bot.

**Key contents:** Explains the flow: webhook at `POST /webhooks/telegram` on `services/api`, secret-token check, dedupe by stored `update_id`, private chats only, commands (`/help`, `/undo`, `/today`, `/month`), text and voice extraction via `services/ai`, and confidence-based save vs. Save/Cancel confirmation. Also covers creating the bot via BotFather.

**Depends on / used by:** Describes `services/api` webhook code and `services/ai` `/internal/extract/*` routes, which are guarded by `INTERNAL_API_KEY`. Env vars include `TELEGRAM_WEBHOOK_SECRET`.

**Decisions & caveats:** Confidence threshold is 0.75: above it the expense is saved, below it an `AIExpenseDraft` is created for confirmation. `/undo` only reaches 24 hours back. Telegram replaced an earlier WhatsApp bot because Meta's Cloud API requires a verified business (see `decisions.md`).
