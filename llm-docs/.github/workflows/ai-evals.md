# .github/workflows/ai-evals.yml

**Purpose:** The merge gate and the live monitor for the AI service, on free GitHub Actions.

**Key contents:**

- `Eval gate` job runs on PRs to `main` (including label changes) and on manual dispatch.
  - It passes straight away when the PR has the `skip-evals` label or doesn't touch `services/ai/`.
  - It fails if the eval secrets are missing.
  - Otherwise it runs `pytest --junitxml` (exit code ignored), then `python -m evals.gate`.
- `Live monitor` job runs every 6 hours and on manual dispatch: `python -m evals.online --hours 7`.

**Depends on / used by:**

- Secrets:
  - Gate: `EVAL_GROQ_API_KEY` and `LANGSMITH_API_KEY`.
  - Monitor: `LANGSMITH_API_KEY`, `JUDGE_API_KEY`, `TELEGRAM_BOT_TOKEN`, `ALERT_TELEGRAM_CHAT_ID`.
- Optional repo variables: `JUDGE_BASE_URL`, `JUDGE_MODEL`.
- Code in `services/ai/evals/`.
- Branch protection on `main` must require the `Eval gate` check, or the gate doesn't block anything.

**Decisions & caveats:**

- **No `paths` filter on the trigger.** A required check that never starts leaves the PR waiting forever. The job runs on every PR and checks the diff itself.
- **Force merge.**
  - `skip-evals` label: recorded on the PR; the gate passes with a warning.
  - Ruleset admin bypass: GitHub's own "merge without waiting for requirements".
- **Missing secrets fail the gate.** A gate that silently passes is worse than none; use the label until secrets exist.
- **The monitor alerts by failing.** A failed scheduled run makes GitHub email whoever last edited the cron, plus Telegram when configured.
- **Separate Groq org.** `EVAL_GROQ_API_KEY` is meant to be a different Groq org from production, since Groq rate limits are per org.
- **Experiment naming.** Offline experiments are named under `settle-ai-evals`.
- **Concurrency.** A new push cancels the PR's previous eval run to save quota.
