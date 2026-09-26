# Decisions

A running log of product and architecture decisions for Settle, with the reasoning behind each.

---

## 2026-09-27 — Personal expense tracker

Settle was built for splitting bills. We extended it so it also works as a personal expense tracker: monthly analytics, budgets, recurring expenses, categories and simple income.

### What "my spending" means

**Decision:** spending is the user's own share. That is the full amount of personal expenses plus the user's split of group expenses:
`SUM(expense_splits.amount_owed WHERE user_id = me)` over live expenses.

**Why:** a personal expense already gets a single 100% split for its owner, and a group expense carries the user's slice. So one query covers both, and it reflects what the user actually spent. If you pay ₹2,400 for a dinner split four ways, it counts as ₹600, not ₹2,400.

### Currency

**Decision:** totals only count expenses in the user's `default_currency`. Expenses in other currencies are reported separately as `other_currencies` ("not counted") and are never converted.

**Why:** there is no exchange-rate source yet, and the `exchange_rates` table is still unused. Showing the amounts separately is honest. Adding up mixed currencies would give a wrong total.

### Budgets

**Decision:** budgets are standing monthly limits. Each user can have one overall budget and at most one per category. They apply to every month, so there are no per-month rows. The table has two partial unique indexes: one on `(user_id, category_id)` where `category_id` is set, and one on `(user_id)` where it is null.

**UI:** a budget bar turns amber at 80% and red when over. A tick marks where spending "should" be at this point in the month.

### Recurring expenses

**Decision:** recurring expenses are personal only in v1. They are logged by an idempotent `POST /recurring/sync` that the dashboard calls once per session, sending the user's local date. There is no cron job.

**Details:**
- Monthly and yearly rules keep the start date's day of the month and clamp at month end. A rule starting Jan 31 runs Feb 28/29, then Mar 31.
- Due rules are locked with `FOR UPDATE SKIP LOCKED`, so two open tabs cannot log the same occurrence twice.
- One sync catches up at most 24 occurrences per rule.
- Resuming a paused rule skips the occurrences that were missed while it was paused. It does not back-fill them.
- The server rejects a client date more than one day away from its own.
- Deleting a rule keeps the expenses it already created.

**Why no cron:** Vercel functions are stateless, and a scheduler is extra infrastructure. Logging on read is enough, because nobody looks at their spending without opening the app.

### Categories

**Decision:**
- Seed 12 system categories, each with an icon and a color: Food & Dining, Groceries, Transport, Rent, Utilities, Shopping, Entertainment, Travel, Health, Subscriptions, Education, Other.
- Users can add, rename and delete their own categories, and pick an icon and color from a preset list.
- Custom categories that had the same name as a system category were merged into it. Their expenses, recurring expenses and budgets now point to the system category, and the duplicate rows were deleted (migration `5b1e0c7d9a21`). **This migration cannot be undone.**

**Why:** new users had no categories at all, so the AI categorizer had nothing to match against. The duplicates split spending and budgets across two rows with the same name.

### Income

**Decision:** there is a minimal `incomes` table (amount, currency, date, source, notes). The Spending page shows Income, Spent and Saved for the month.

**Why:** a savings figure makes the tracker useful. Income was kept separate from expenses so that balances and splits stay untouched.

### Where it lives

- **API (`services/api`):** new routers `/spending/summary`, `/budgets`, `/incomes` and `/recurring` (including `/recurring/sync`). `GET /expenses` also accepts `?scope=personal|group`.
- **Web (`apps/web`):** a new Spending section with four tabs: Overview, Budgets, Recurring and Categories.
  - The expense form has a "Repeats" option for personal expenses.
  - The Expenses page has "Personal only" and "Groups only" filters.
  - The dashboard Overview has a "This month" card, and its category card now shows the user's share.
- **AI (`services/ai`):** the chat tool `get_spending_summary` now reads the API summary, so it uses the same "user's share" rule. A new tool, `get_budget_status`, answers budget questions.

---

## 2026-09-27 — Dashboard performance: no Redis (for now)

**Problem:** the dashboard loaded slowly.

**What we measured:**
- Each database round trip to Neon (Singapore) takes about 83 ms from a local machine.
- Opening a new connection takes about 1.6 s, because of the TLS handshake.
- The spending summary took about 820 ms, because it ran around 10 queries one after another.
- Every request also paid one extra round trip for `pool_pre_ping`.
- Vercel functions were running in `iad1` (US East), so in production every query crossed from the US to Singapore and back, roughly 200 ms or more per query.

**Decision:** we did not add Redis. Almost all of the latency is network distance and the number of round trips. A hosted Redis would add another network hop. It would also bring a hard invalidation problem: one group expense changes the balances and spending totals of every member, so a stale cache would show people wrong balances.

**What we changed instead:**
1. **Function region:** moved the Vercel project's default function region from `iad1` to `sin1` (Singapore), next to the database. This takes effect on the next deploy. Make sure the production `DATABASE_URL` points to the Singapore Neon database.
2. **Fewer round trips:** the spending summary now fetches the user's split rows for its whole time window in a single query and aggregates them in Python. It went from about 10 queries to 3, and from about 820 ms to about 250 ms, with identical results.
3. **Connection pool:**
   - Removed `pool_pre_ping`.
   - Set `pool_recycle=240`, which is shorter than Neon's 5-minute idle suspend, so the app never reuses a connection to a suspended database.
   - Raised the pool to 10 connections, with 10 more allowed as overflow.
   - The API now opens all its pooled connections when it starts, so the dashboard's roughly 8 parallel requests don't each pay for a TLS handshake.
   - Result: the slowest dashboard request on a fresh API start went from about 2.4 s to about 0.95 s.
4. **Observability:** every API request now logs one line with total time, database time and query count, for example `GET /spending/summary 200 530ms (db 514ms, 4 queries)`. The same numbers go into a `Server-Timing` response header. The Next.js proxy does not forward that header yet, so it is not visible in the browser. The code is in `services/api/app/core/timing.py`.

**Revisit Redis when:** the timing logs show a specific endpoint that is still slow after the region move, and whose data is either per-user or easy to invalidate.

**Next steps if needed:** prefetch dashboard data in Server Components (hydrating the React Query cache), or add a single aggregated dashboard endpoint to replace the roughly 7 parallel requests.

---

## 2026-09-27 — Faster first load: landing page and dashboard

**Problem:** the landing page shipped more JavaScript than a static marketing page needs. Dashboard data only started loading after the page's JS and Clerk had booted in the browser, followed by about 8 browser → Next proxy → API round trips.

**Decisions:**
1. **Prefetch dashboard data on the server** (`apps/web/src/lib/server-prefetch.tsx`). Each dashboard page starts its API calls while it renders on the server. The results are streamed into the React Query cache under the same keys the client hooks use. The prefetches are not awaited, so the HTML streams out immediately and each result follows on the same response.
   - Queries that fail on the server are refetched by the client as before.
   - Dashboard pages are now rendered on each request (`connection()`) instead of served as a static shell.
   - On the Overview, the browser now makes 1 API call on load instead of about 8, and first paint was about 390 ms in a local production build.
2. **Keep the landing page server-rendered.** Only the navbar's auth buttons, the play button and the hero video are client components.
3. **Move dashboard-only providers out of the root layout.** React Query, tooltips and toasts now live in `DashboardProviders`, so public pages don't download them. Clerk and the theme provider stay site-wide.
4. **Defer the 18 MB hero video** until the page has loaded and the browser is idle. It is skipped entirely for visitors with data saver or reduced motion turned on.
5. **Drop Inter's unused optical-size axis**, which made the font file larger.

**Result (local production build, compressed transfer):** landing JS went from 342 KB to 261 KB, and fonts from 101 KB to 77 KB. The live site is measured with Brotli and the local build with gzip, so the real saving is a little larger.

**Not changed:** the landing page's time to first byte was already about 110 ms, served from Vercel's edge cache.
