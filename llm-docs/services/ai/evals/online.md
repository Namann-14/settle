# services/ai/evals/online.py

**Purpose:** Live monitor: grades recent production traces in LangSmith, writes feedback, and alerts when quality drops or runs error.

**Key contents:** CLI: `python -m evals.online --hours --sample-rate --max-judge --dry-run`. It fetches root runs named `expense_extraction` and `chat_turn`.

- Extractions: `extraction_succeeded`, plus every `sanity_checks` key.
- Chat turns:
  - `turn_succeeded` on every turn.
  - `numbers_have_tool_source` on every turn: a code check that flags numbers in the answer when no tool output exists anywhere in the thread.
  - `grounded` and `answers_question` from the judge, on a sample.

`find_breaches` compares this batch's rates with `thresholds.json["online"]`. On a breach, `report` sends a Telegram message (`TELEGRAM_BOT_TOKEN` + `ALERT_TELEGRAM_CHAT_ID`) and the script exits 1. Rates and alerts are also written to the GitHub job summary.

**Depends on / used by:** langsmith `Client.runs.query_v2` (an async paginator) and `create_feedback`; `evals.judge`, `evals.scorers`, `evals/thresholds.json`. Run every 6 hours by the `Live monitor` job in `.github/workflows/ai-evals.yml`.

**Decisions & caveats:**

- **Idempotent.** It skips runs that already have a key in `feedback_stats`, and derives feedback ids from (run id, key). Each run is counted in exactly one batch's rates even though windows overlap.
- **Thresholds.** Rates over fewer than `min_samples` new runs are ignored. If every judge call fails, that's a breach too, since quality went unchecked.
- **Alerts.** The exit code 1 is what makes GitHub email you about the failed scheduled run. Telegram errors print only the exception type, because the request URL contains the bot token.
- **Retention.** `extend_trace_retention=False` matters: feedback otherwise upgrades a trace to paid extended retention.
- **API choice.** It uses `runs.query_v2` because `list_runs` is deprecated (removal after 2027-01-31).
- **Run names.** It depends on the root run names set in `routes/chat.py` and `chains/extraction.py`; renaming them silently stops monitoring.
- **Chat parsing.** Turns are rebuilt from the root run's output `messages` (dicts with `type` human/ai/tool).
