# decisions.md

**Purpose:** Running log of product and architecture decisions for Settle with reasoning.

**Key contents:** Entries: personal expense tracker (spending is the user's share, default currency only, standing budgets, idempotent recurring sync with no cron, 12 seeded system categories, minimal incomes); dashboard performance without Redis (move Vercel region to sin1, fewer queries, pool tuning, request timing logs); faster first load (server prefetch, lighter landing page, deferred hero video); split-coin logo and where its icon files live; evals on LangSmith with free judge models.

**Depends on / used by:** Referenced by most docs here; code in `services/api`, `services/ai` and `apps/web`.

**Decisions & caveats:** Append new decisions with a date heading. Includes an irreversible migration (`5b1e0c7d9a21`, category merge) and a note to check the production `DATABASE_URL` points at the Singapore Neon DB.

## 2026-10-11 Landing page micro-interactions

- Added a small `motion`-based kit (`landing/motion.tsx`) inspired by Aceternity UI: scroll reveals, cursor spotlight cards, hero tilt, count-up, typewriter prompt, marquee, button sheen, scroll-progress bar.
- Kept it light: `LazyMotion` + `domAnimation` with `strict`, pointer effects via CSS variables, everything respects `prefers-reduced-motion`.
- Restraint: one signature moment (hero types an expense, stats count up); ambient motion limited to the marquee and the final CTA glow. Dashboard untouched.
- Feature cards got live demos (`feature-demos.tsx`), and a few React Bits ideas (magnet CTA, click spark, shiny text) were added alongside the Aceternity-style effects.
- Count-up is used once (hero "You're owed"); other numbers use different effects (pop, sheen, strike-through) so nothing repeats.
- Page-wide additions: fixed frosted nav that hides on scroll down, back-to-top with progress ring, hero activity toast, typing dots in the AI demo, animated before/after debt collapse, and light hover lifts in the dashboard.
- Footer redesigned: brand + CTA, three link columns, and a giant cropped `settle` wordmark that lights up under the cursor.
- Navbar is now resizable (Aceternity-style): full width at the top, floating frosted pill after scroll. The scroll-progress bar moved from the top of the page to the top edge of the navbar, and the old hide-on-scroll-down behaviour was dropped. `@aceternity` was added to `apps/web/components.json` registries.
- Scroll-linked effects (`scroll-effects.tsx`) are limited to the step trace line and the final headline word fill. Parallax/scale/tilt of whole blocks (feature cards, Pro plan, hero preview, AI panel) was tried and removed because things moving while scrolling felt jittery.
- Footer is a sticky reveal (page slides away to uncover it). Needs `overflow-x-clip` on the page root, since `overflow-x-hidden` breaks sticky. Footer animations key off scroll distance to the bottom, not in-view.
- Took one idea from the Lilac Meadow reference ("What is ...?" three-card section) and rebuilt it with Settle's own art and copy. A layered hero parallax (coins, chip, pollen, video drift) was tried and removed at the owner's request.
- Landing page leans on one card language (the "What is Settle?" bento): `BentoCard` + small interactive demos. How it works steps and a new "Split it your way" section use it, with demos that autoplay on scroll-in and yield to clicks.
- Mobile pass: checked 375px and 768px for overflow; tighter section spacing, hero CTA wraps, split-coin card re-seated, step cards stack until `lg`, touch-safe hover effects, and a sturdier mobile menu (opaque, scrim, scroll lock, Escape).

## 2026-10-11 Landing page performance pass

- Measured a production build of `/`: statically prerendered and cached; ~100KB of app JS plus Clerk's scripts (~210KB from Clerk's CDN, already preloaded); fonts and CSS small. The real cost was the 18MB hero video, loaded on every device and decoded continuously.
- Video: not loaded under 768px, with data saver or on 2g/3g; paused when off screen or the tab is hidden. Phones get the plain hero background and save ~18MB.
- Reveal no longer animates a blur filter (compositor-only now); the footer reveal stops reading layout after it fires.
- Left alone on purpose: Clerk on the landing page (needed for the signed-in state and sign-up modal), latin-ext font files (the rupee sign pulls in Inter and Instrument Serif latin-ext), and `content-visibility` on sections (risks anchor jumps and scroll-height shifts).


## 2026-10-30 AI evals

- Evals run on LangSmith (free Developer plan: 1 seat, 5k base traces/month, 14-day retention), since tracing already goes there and it covers datasets, experiments and feedback. Considered and rejected: lm-evaluation-harness (academic benchmarks for base models, not app evals), Harbor (containerized agent tasks), Braintrust and Opik (a second platform, splitting traces), Langfuse (same reason; it's the plan B if 5k traces/month gets tight, by switching fully).
- Offline (`services/ai/evals`, pytest + the langsmith plugin): labelled extraction cases scored field by field, and a chat tool-routing check that runs only the first model step, so it needs no services/api or test data. Both are code-scored, no LLM judge.
- Live (`evals/online.py`, every 6 hours from GitHub Actions): code checks on every extraction trace and every chat turn, plus an LLM judge (groundedness, relevance) on a 20% sample of chat turns, written back as LangSmith feedback.
- Judge models must be free: Groq free tier (separate org from production, since limits are per org), NVIDIA build.nvidia.com or Ollama Cloud, all through one OpenAI-compatible client. The judge is a different model family (Qwen) from the agents (gpt-oss) to avoid self-preference. Gemini's free tier was ruled out because free-tier prompts may be used to improve Google products, and these prompts hold users' expense data.
- Feedback is written with `extend_trace_retention=False`; by default feedback upgrades a trace to paid extended retention.
- Root traces are named `chat_turn` and `expense_extraction` so the scorer can find them.
- Not done yet: user feedback (thumbs, "edited the extracted draft") as LangSmith feedback, which needs run ids surfaced to the web app and the bot.

## 2026-10-31 Eval gate and live alerts

- Merging into `main` is gated by offline evals: the `Eval gate` GitHub check turns per-case pytest results into per-suite pass rates (`evals/gate.py`) and fails below `evals/thresholds.json`. Branch protection on `main`, set up by hand in GitHub, requires that check.
- Thresholds start at 50% because there are no real users yet. Raise them before launch.
- Force merge during development: the `skip-evals` PR label passes the gate with a warning (recorded on the PR), and the admin bypass on the `main` ruleset covers emergencies.
- The workflow has no `paths` filter, because a required check that never starts blocks the merge. PRs that don't touch `services/ai` pass the job immediately.
- Live monitoring stays on free GitHub Actions (every 6 hours) rather than LangSmith's built-in online evaluators, for the free judge model and control over trace retention. It now records errored runs too, and alerts when a batch crosses a threshold: a Telegram message from the Settle bot, and a failed scheduled run, which makes GitHub send an email.

## 2026-10-31 Group invites, join links and split hardening

- Nobody is added to a group without consent. Inviting by email always creates a pending invite, even for people who already have an account; they accept or decline from the topbar bell (in-app inbox) or from Telegram Join/Decline buttons if their chat is linked. Invites for emails without an account wait until that person signs up; they are matched by email, not claimed automatically on first sign-in.
- Invitees always join as MEMBER. The invite request no longer takes a role, which closed a hole where any member could invite someone as ADMIN. Only the inviter or an admin can cancel an invite.
- Each group has a shareable join link (`/dashboard/join/<code>`). Any member can copy it; opening it shows the group and joining needs a click (that click is the consent). Admins can reset the code, which kills the old link. The code is made lazily on first request (`groups.join_code`, nullable).
- There is still no email delivery: invitees learn about invites in the app, on Telegram, or from the join link someone sends them.
- The server owns split amounts. EQUAL and PERCENTAGE splits are recomputed with a largest-remainder cent allocation so they always add up to the expense exactly; UNEQUAL amounts must add up to the cent. This replaces the old "correct small drifts silently" tolerance, which let a forged 90/10 pass as EQUAL and leaked cents into balances (leftover cents also blocked removing members, which needs a zero net).
- Personal expenses (no group) can only involve the current user. Editing an expense re-checks group membership and re-splits the existing people when the amount, split type, group or payer change.
- Root cause of "members missing in Add expense": the form read members from the cached groups list (5-minute stale time, no refetch on focus), so someone who had joined since was missing and the split silently went to fewer people. The form now reads the group itself and refetches it every time it opens.

## 2026-11-01 Overview redesign: "where do I stand?"

- The Overview page had nine equal-weight cards (four stat tiles with a glowing highlight, spend chart, category breakdown, groups, transactions, an Ask-AI card, recent settlements) and read as generic. Its job is now one question: where do I stand with everyone.
- New layout (picked from three sketched structures): a serif net sentence, then a two-column ledger, "Owed to you" facing "You owe", with a balance line underneath; groups and recent activity below; a slim month-spend strip last. On phones the columns stack with "You owe" first.
- Rows are payments to make, not raw debts: the api's simplified transfers (fewest payments per group) that involve the user, summed per person across groups. Settle up therefore always records a payment the api would ask for; a person in several groups gets a per-group menu, since settlements belong to a group.
- Numbers now come from `/groups/{id}/balances` per group instead of the browser summing the latest 100 expenses, which undercounted heavy users.
- Removed from Overview: the Ask-AI card and "Ask Settle AI" button (chat has its own home), the spend and category charts (Spending owns them), stat tiles, uppercase eyebrows, staggered entrance animation and hover lift.
- Remind uses the Web Share API and falls back to copying the message, since Settle sends no email.
- Design system and product context were captured the same day in `DESIGN.md`, `PRODUCT.md` and `.impeccable/surfaces/src-app-dashboard-overview.md`.

## 2026-11-01 Spending pages re-composed

- Overview, Budgets, Recurring and Categories now share the dashboard anatomy: one `PageContainer` in the Spending layout, the `SegmentedNav` pill track above each page's own `PageHeader`, then a `FigureStrip` where there are real figures, then panels of rows.
- Removed: serif titles with an italic word, uppercase eyebrows, stat tiles, the amber budget-alert box and amber warning bars, the chart bar grow-in animation, and serif dialog titles.
- Budget warnings (80% and up) now use an Oxblood wash instead of amber so all colour stays in the token palette; over budget stays solid Oxblood. Product rules (own share only, default currency only, standing monthly budgets) are unchanged.

## 2026-11-01 Dashboard rework: one page anatomy

- Every signed-in page had drifted into the same template: uppercase eyebrow, serif title with an italic word, a row of stat tiles with one glowing green tile, card grids, and dark "AI" cards with sparkle icons and hardcoded colours. It read as generated rather than designed.
- All pages now share one anatomy from `components/dashboard/panel.tsx` (DESIGN.md "App page anatomy"): `PageHeader` (Inter 24px title, one line of context, actions), an optional `FigureStrip` (2-4 figures in one ruled strip, serif only for money, colour only by meaning), a filter row (`SearchField`, `Segmented`), then `Panel`s of hairline rows or tables. Buttons are `buttonClass` pills; tap targets grow to 40-44px on phones.
- AI features (chat, quick add, settle plan, group insight) sit on ordinary panels and are named in words ("Settle AI"); no sparkles, glows or special dark cards.
- Motion is one quiet route entrance (`app/dashboard/template.tsx`, fade and 6px rise, 280ms) plus a short fade when data replaces a skeleton. Hover changes colour only; no lifts, icon scaling, staggered entrances or count-ups. All of it is off under reduced motion.
- Groups, Settlements and Overview now read balances from the api's per-group balances (`useStanding`) instead of summing the latest 100 expenses in the browser.
- Settings gained Account (default currency, saved on change) and Appearance sections. The theme switch is shown disabled because the site is pinned to light mode (`forcedTheme="light"` in `providers.tsx`); removing that pin enables it.
- Form controls (`controlClass`) are 36px (40px on phones) at 14px, up from 32px at 12px, for readability and touch.

## 2026-11-01 Dark mode in the app

- The site had been pinned to light (`forcedTheme="light"`). The signed-in app now follows the user's choice from Settings > Appearance (Light / Dark / System, default System); public pages (landing, privacy) stay light because the landing art and hero video are made for it.
- Dark `--destructive` was lifted to a lighter brick so "you owe" amounts and destructive actions stay readable on night-forest surfaces.

## 2026-11-01 App type roles

- The dashboard had drifted to ad hoc sizes (13px in 35 places, 11px, 9px, 10px, 15px, 28px, 32px). It now uses one role ramp: page title 24px, figure 28px serif, dialog title 18px, panel title and body 14px, meta 13px, caption 12px, micro 11px (initials and badges only), plus Overview's serif net sentence. `text-micro`, `text-meta` and `text-figure` are theme tokens in `apps/web/src/index.css`; no bracketed pixel sizes remain in the app.
- Inter below 14px no longer inherits the body's -0.01em tracking, and descriptions wrap with `text-pretty`.
- `cn` registers the custom size names with tailwind-merge; before that, `text-meta` was silently stripped whenever a text colour followed it.

## 2026-11-15 SEO foundations for the public site

- Added `robots.ts`, `sitemap.ts`, `metadataBase`, per-page canonicals (`/` in page.tsx, `/privacy` in the privacy page; never in the root layout, children would inherit it), Open Graph/Twitter metadata and a generated OG image. `/dashboard` is `noindex` via its layout and disallowed in robots; `/api/` is disallowed.
- Site origin comes from `NEXT_PUBLIC_SITE_URL`, then `VERCEL_PROJECT_PRODUCTION_URL`, then localhost (`lib/site.ts`). Set it on Vercel so canonicals do not point at preview hosts.
- Still open from the audit: JSON-LD (SoftwareApplication + FAQPage), icon files, `/terms` page, title template.

## 2026-11-15 Chat UI moved to shadcn AI Elements

- AI Elements moved from the Vercel registry (`ai-sdk.dev/elements`) to shadcn (`ui.shadcn.com/docs/ai-elements`). The new version is a set of patterns built from ordinary shadcn primitives, not a component library. The 48 vendored files in `apps/web/src/components/ai-elements` (only 9 were used) are gone, along with the deps that only they needed.
- The chat now uses `@settle/ui` primitives: MessageScroller (instead of use-stick-to-bottom), Message + Bubble, InputGroup for the composer, Button for suggestions, and the new Trace for reasoning and tool steps. Loading text uses the `shimmer` utility from `shadcn/tailwind.css`. Markdown still goes through Streamdown (`chat/markdown.tsx`).
- Dropped: the "Thought for N seconds" duration, since the AI SDK doesn't time reasoning. If it is wanted back, measure it in the ai service and send it as message metadata.

## 2026-11-15 Chat can add expenses, with approval and checkpoint rollback

- The chat agent got its first write tool, `add_expense` (equal split, group or personal). It never writes on its own: the tool pauses the LangGraph run with `interrupt()` and the web shows a Confirmation card (shadcn AI Elements pattern). Approve resumes the run and creates the expense, Deny resumes it with a "declined" result. The resumed stream continues the same assistant message and history row.
- Restoring a checkpoint now undoes data, not just conversation. Every expense the agent creates is recorded in `ai_chat_expenses` against the turn that added it. Restore (a server call, made the moment the user clicks) soft-deletes the expenses of every later turn through the api, then truncates the history. Retrying a reply forks from the previous checkpoint, so it rolls back the retried turn's expenses too.
- Not covered: edits or settlements made outside the chat after the expense was added are left alone (the expense is just soft-deleted), and in-memory mode (no `DATABASE_URL`) records nothing, so nothing is rolled back.
- The chat UI also lined up with the Chain of Thought, Checkpoint and Message patterns: "Done in N steps", a separator Marker with a Restore button, and Copy / Retry / Edit message actions. Good/Bad feedback was skipped because there is nowhere to store it.
