"""Live monitor: grade recent production traces, write LangSmith feedback, alert.

    uv run --group eval python -m evals.online --hours 7 --sample-rate 0.2

- every `expense_extraction` trace: did it error, plus code checks (no LLM)
- every `chat_turn` trace: did it error, a code check for numbers stated
  without any tool call, and an LLM judge (groundedness, relevance) on a sample

Then compares this batch's rates with evals/thresholds.json ("online"). On a
breach it sends a Telegram message (when TELEGRAM_BOT_TOKEN and
ALERT_TELEGRAM_CHAT_ID are set) and exits 1, so the scheduled GitHub Action
fails and GitHub emails you too.

Idempotent: a run that already has a key's feedback is skipped, and feedback
ids are derived from (run id, key), so overlapping schedules don't double-count
and each run is counted in exactly one batch's rates.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import html
import json
import os
import re
import uuid
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv()

from langsmith import Client  # noqa: E402  (after load_dotenv so it sees the key)
from langsmith.utils import LangSmithConflictError  # noqa: E402

from evals.judge import JudgeError, judge_chat_turn, judge_config  # noqa: E402
from evals.scorers import sanity_checks  # noqa: E402

FEEDBACK_NAMESPACE = uuid.UUID("6f1f0c2e-6a52-4d8e-9a43-3f0b1c7d2e51")
SELECTS = ["ID", "NAME", "STATUS", "INPUTS", "OUTPUTS", "ERROR_PREVIEW", "FEEDBACK_STATS", "START_TIME", "PROJECT_ID"]
DIGIT_RE = re.compile(r"\d")
THRESHOLDS = json.loads((Path(__file__).parent / "thresholds.json").read_text(encoding="utf-8"))["online"]
# keys where a 0 means the run errored, so the threshold is a max error rate
ERROR_KEYS = {"extraction_succeeded", "turn_succeeded"}
JUDGE_KEYS = {"grounded", "answers_question"}


class FeedbackWriter:
    def __init__(self, client: Client, dry_run: bool):
        self.client = client
        self.dry_run = dry_run
        self.counts: Counter[str] = Counter()
        self.passes: Counter[str] = Counter()
        self.failures: dict[str, list[str]] = {}

    def write(self, run, key: str, ok: bool, comment: str = "") -> None:
        self.counts[key] += 1
        self.passes[key] += int(ok)
        if not ok:
            self.failures.setdefault(key, []).append(f"{run.id} {comment}".strip())
        if self.dry_run:
            print(f"  [dry-run] {run.name} {run.id} {key}={int(ok)} {comment}")
            return
        try:
            self.client.create_feedback(
                run_id=run.id,
                key=key,
                score=int(ok),
                comment=comment or None,
                feedback_id=uuid.uuid5(FEEDBACK_NAMESPACE, f"{run.id}:{key}"),
                session_id=run.project_id,
                start_time=run.start_time,
                feedback_source_type="model",
                # Feedback upgrades a trace to paid extended retention by default.
                extend_trace_retention=False,
            )
        except LangSmithConflictError:
            pass  # already written by an earlier, overlapping run


def _scored(run, key: str) -> bool:
    return key in (run.feedback_stats or {})


def _sampled(run_id, rate: float) -> bool:
    # Stable per run, so reruns over the same window pick the same sample.
    h = int(hashlib.sha256(str(run_id).encode()).hexdigest()[:8], 16)
    return h / 0xFFFFFFFF < rate


async def _fetch(client: Client, project_id: str, name: str, since: datetime) -> list:
    page = client.runs.query_v2(
        project_ids=[project_id],
        is_root=True,
        min_start_time=since,
        filter=f'eq(name, "{name}")',
        selects=SELECTS,
        page_size=100,
    )
    return [r async for r in page]


def score_extractions(runs: list, out: FeedbackWriter) -> None:
    for run in runs:
        if run.status not in ("success", "error") or _scored(run, "extraction_succeeded"):
            continue
        if run.status == "error":
            # both attempts failed: the user got a blank manual-entry draft
            out.write(run, "extraction_succeeded", False, (run.error_preview or "")[:300])
            continue
        output = (run.outputs or {}).get("output") or {}
        categories = (run.inputs or {}).get("categories", "")
        for key, (ok, comment) in sanity_checks(output, categories).items():
            out.write(run, key, ok, "" if ok else comment)
        out.write(run, "extraction_succeeded", True)


def _text(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join(p.get("text", "") for p in content if isinstance(p, dict))
    return ""


def _turn(run) -> tuple[str, str, str, bool] | None:
    """(question, tool outputs in the thread, answer, called a tool this turn)."""
    messages = (run.outputs or {}).get("messages") or []
    human_idx = [i for i, m in enumerate(messages) if m.get("type") == "human"]
    if not human_idx:
        return None
    question = _text(messages[human_idx[-1]].get("content"))
    turn = messages[human_idx[-1] + 1 :]
    answers = [_text(m.get("content")) for m in turn if m.get("type") == "ai" and _text(m.get("content")).strip()]
    if not answers:
        return None
    tool_outputs = "\n\n".join(
        f"[{m.get('name')}]\n{_text(m.get('content'))}" for m in messages if m.get("type") == "tool"
    )
    called_tool = any(m.get("type") == "tool" for m in turn)
    return question, tool_outputs, answers[-1], called_tool


def score_chats(runs: list, out: FeedbackWriter, sample_rate: float, max_judge: int) -> int:
    """Scores chat turns. Returns the failed judge calls when none succeeded
    (a judge outage, which the alert reports), else 0."""
    cfg = judge_config()
    if cfg is None:
        print("JUDGE_API_KEY not set: skipping LLM judge, running code checks only")
    judged = judge_errors = 0
    for run in runs:
        if run.status not in ("success", "error"):
            continue  # still running; the next, overlapping window picks it up
        if not _scored(run, "turn_succeeded"):
            out.write(run, "turn_succeeded", run.status == "success", (run.error_preview or "")[:300])
        if run.status == "error":
            continue
        parsed = _turn(run)
        if parsed is None:
            continue
        question, tool_outputs, answer, called_tool = parsed

        # Free check on every turn: a number with no tool output anywhere in
        # the thread can't have come from a tool (the chat prompt's hard rule).
        if DIGIT_RE.search(answer) and not _scored(run, "numbers_have_tool_source"):
            ok = called_tool or bool(tool_outputs)
            out.write(run, "numbers_have_tool_source", ok, "" if ok else "answer has numbers, no tool was called")

        if cfg is None or judged >= max_judge or not _sampled(run.id, sample_rate) or _scored(run, "grounded"):
            continue
        try:
            verdict = judge_chat_turn(cfg, question=question, tool_outputs=tool_outputs, answer=answer)
        except (JudgeError, httpx.HTTPError) as err:  # one bad judge call shouldn't stop the batch
            judge_errors += 1
            print(f"  judge failed on {run.id}: {type(err).__name__}")
            continue
        judged += 1
        reason = str(verdict.get("reason", ""))[:300]
        out.write(run, "grounded", verdict["grounded"], reason)
        out.write(run, "answers_question", verdict["answers_question"], reason)
    print(f"judged {judged} chat turns, {judge_errors} judge calls failed")
    return judge_errors if judged == 0 else 0


def find_breaches(out: FeedbackWriter, judge_errors: int) -> list[str]:
    """Rates in this batch that cross a threshold. Keys with fewer than
    min_samples new runs are ignored, so one bad trace isn't an incident."""
    breaches = []
    for key, n in sorted(out.counts.items()):
        if n < THRESHOLDS["min_samples"]:
            continue
        rate = out.passes[key] / n
        if key in ERROR_KEYS:
            failed, limit = 1 - rate, THRESHOLDS["max_error_rate"]
            if failed > limit:
                breaches.append(f"{key}: {failed:.0%} of {n} runs errored (max {limit:.0%})")
            continue
        limit = THRESHOLDS["min_judge_pass_rate"] if key in JUDGE_KEYS else THRESHOLDS["min_check_pass_rate"]
        if rate < limit:
            breaches.append(f"{key}: {rate:.0%} of {n} passed (min {limit:.0%})")
    if judge_errors:
        breaches.append(f"judge: all {judge_errors} calls failed, so chat quality went unchecked")
    return breaches


def send_telegram(text: str) -> None:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("ALERT_TELEGRAM_CHAT_ID", "")
    if not token or not chat_id:
        print("TELEGRAM_BOT_TOKEN / ALERT_TELEGRAM_CHAT_ID not set: no Telegram alert")
        return
    try:
        resp = httpx.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True},
            timeout=20,
        )
        resp.raise_for_status()
    except httpx.HTTPError as err:
        # never print the error itself: its URL contains the bot token
        print(f"Telegram alert failed ({type(err).__name__})")


def report(project, out: FeedbackWriter, breaches: list[str], dry_run: bool) -> None:
    lines = [f"{key}: {out.passes[key]}/{n} pass" for key, n in sorted(out.counts.items())]
    lines = lines or ["no new traces scored"]
    print("\n".join(f"  {line}" for line in lines))
    if summary := os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(summary, "a", encoding="utf-8") as f:
            f.write("## Live monitor\n\n" + "\n".join(f"- {line}" for line in lines))
            alerts = "\n".join(f"- {b}" for b in breaches) if breaches else "none"
            f.write(f"\n\n**Alerts:**\n{alerts}\n")
    if not breaches:
        return
    print("ALERT:\n" + "\n".join(f"  {b}" for b in breaches))
    if dry_run:
        return
    examples = [f"{key}: {html.escape(fails[0][:200])}" for key, fails in out.failures.items()][:3]
    message = f"<b>Settle AI eval alert</b> ({html.escape(project.name)})\n\n"
    message += "\n".join(f"• {html.escape(b)}" for b in breaches)
    if examples:
        message += "\n\nExamples (run id, reason):\n" + "\n".join(examples)
    if project.url:
        message += f"\n\n{html.escape(project.url)}"
    send_telegram(message)


async def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--hours", type=float, default=7, help="look-back window (default 7, overlaps a 6h schedule)")
    parser.add_argument("--sample-rate", type=float, default=0.2, help="share of chat turns sent to the LLM judge")
    parser.add_argument("--max-judge", type=int, default=50, help="cap on judge calls per run (free-tier quota)")
    parser.add_argument("--dry-run", action="store_true", help="print scores and alerts instead of writing/sending")
    args = parser.parse_args()

    client = Client()
    project = client.read_project(project_name=os.environ.get("LANGSMITH_PROJECT", "settle-ai"))
    since = datetime.now(timezone.utc) - timedelta(hours=args.hours)
    out = FeedbackWriter(client, args.dry_run)

    extractions = await _fetch(client, str(project.id), "expense_extraction", since)
    chats = await _fetch(client, str(project.id), "chat_turn", since)
    print(f"{project.name}: {len(extractions)} extraction and {len(chats)} chat traces since {since:%Y-%m-%d %H:%M} UTC")

    score_extractions(extractions, out)
    judge_errors = score_chats(chats, out, args.sample_rate, args.max_judge)
    breaches = find_breaches(out, judge_errors)
    report(project, out, breaches, args.dry_run)
    # non-zero exit fails the scheduled Action, which makes GitHub email you
    return 1 if breaches and not args.dry_run else 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
