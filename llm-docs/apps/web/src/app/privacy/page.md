# apps/web/src/app/privacy/page.tsx

**Purpose:** Static privacy policy page.

**Key contents:** Metadata plus a list of sections (what we collect, how we use it, who processes it, retention/deletion, contact), with contact email and last-updated date constants.

**Depends on / used by:** Route `/privacy`; mentions Clerk and the Telegram bot.

**Decisions & caveats:** `UPDATED` and `CONTACT_EMAIL` are hard-coded; update them when data handling changes (e.g. new processors or integrations).
