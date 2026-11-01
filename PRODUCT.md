# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Young people in Indian cities who share costs with the same few circles: flatmates splitting rent and Wi-Fi, friends on a Goa trip, couples on date nights, a group out for dinner. They use Settle mostly on their phones, often right after paying, to log what was spent and see who owes whom. The same people also use it to keep an eye on their own monthly spending.

## Product Purpose

Settle is an expense tracker with groups and settlements. It lets a group log shared expenses, keeps one ledger everyone sees, works out balances, and records settlements when people pay each other back. Alongside groups it tracks the user's personal spending with categories and monthly budgets.

Success means logging an expense takes seconds, every member trusts the numbers, and a group can clear its balances with as few payments as possible.

## Positioning

- **Log in a sentence.** An expense can be entered by chatting a sentence to the AI assistant, scanning a receipt, or messaging (text or voice note) the Settle Telegram bot. Forms remain available but are not the main path.
- **Your share, not the bill.** Personal spending and budgets count only the user's share of each expense, so group splits and personal tracking live in one place without double counting.
- **Fewest payments.** Settle computes the minimum set of transfers that clears every balance in a group, then records them. It never moves money; people pay each other however they already do.

## Operating Context

- Groups are formed around a flat, a trip or a relationship. People join only by accepting an invite (in-app bell or Telegram buttons) or by clicking a shareable join link. There is no email delivery.
- Splits: equal, by shares, by percentage, or exact amounts. The server owns split math and allocates to the cent.
- Expenses can be in the currency paid; balances stay in one currency per group. Personal spending tracking uses the user's default currency only.
- Recurring expenses (rent, subscriptions) sync idempotently when the app is used; there is no background job.
- 12 seeded system categories; users can set a monthly limit per category.
- Telegram bot logs personal expenses into the Spending tracker after a one-time account link.
- Signed-in app lives under `/dashboard` (overview, expenses, groups, settlements, spending, chat, settings). Public surfaces: landing page, privacy page, docs site.

## Capabilities and Constraints

- Web app: Next.js 16 / React 19, Tailwind 4, shadcn primitives in `packages/ui`, Clerk auth. Light and dark themes.
- Backend services: `services/api` (data and permissions), `services/ai` (chat and expense-extraction agents on Groq models).
- Deployed on Vercel, region `sin1`, next to a Singapore Neon database.
- Pricing: Free tier at ₹0 forever. A Pro tier is shown as "Soon"; its price, launch date and exact feature list are undecided.
- Status: personal project, solo-built, live with a small real user base.
- Terminology: "settle up", "settlement", "group", "split", "your share", "you're owed" / "you owe".

## Brand Commitments

- Name: Settle. Tagline in use: "Split bills, not friendships."
- Split-coin logo; files in `apps/web/public/brand/` (`settle-mark.svg`, `settle-mark-light.svg`, `settle-square.svg`, `settle-telegram-512.png`).
- Voice in current copy: plain, short, friendly, India-local examples (₹, Goa trip, flat, Toit). No hype.

## Evidence on Hand

- Real product capabilities and the copy describing them (landing page in `apps/web/src/components/landing/`, FAQ, feature demos).
- Telegram bot docs in `apps/fumadocs/content/docs/telegram.mdx`.
- No testimonials, user counts, press, case studies or benchmarks exist. Do not fabricate them, and do not invent Pro pricing.

## Product Principles

1. Capture beats bookkeeping: the fastest path to a logged expense wins, in whatever form the user has at hand (sentence, receipt, voice note).
2. One set of numbers: every member of a group sees the same expenses and balances, and the numbers must add up exactly.
3. Consent first: nobody is added to a group or charged a share without agreeing to it.
4. Settle records, it does not pay: it tells people who to pay and records it; money moves outside the app.
5. Personal and shared in one place: the user's share flows into their own spending and budgets without extra work.
