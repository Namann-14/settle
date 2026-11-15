"""LLM-as-judge over any OpenAI-compatible endpoint (Groq, NVIDIA, Ollama Cloud).

Plain httpx, not a LangChain model: judge calls must not be traced, or they
would land in the app's LangSmith project and eat the trace quota.
"""

from __future__ import annotations

import json
import os
import re
import time
from dataclasses import dataclass

import httpx
from dotenv import load_dotenv

load_dotenv()

# A different model family from the agents (gpt-oss), so the judge doesn't
# grade its own style favourably.
DEFAULT_BASE_URL = "https://api.groq.com/openai/v1"
DEFAULT_MODEL = "qwen/qwen3.8-27b"
MAX_CONTEXT_CHARS = 8000
RETRIES = 5

GROUNDEDNESS_PROMPT = """You are grading one turn of a personal-finance chat assistant.

Rule the assistant must follow: every number it states (amounts, balances,
counts, dates, percentages) must come from the tool outputs below, directly or
by simple arithmetic on them.

<question>
{question}
</question>

<tool_outputs>
{tool_outputs}
</tool_outputs>

<answer>
{answer}
</answer>

Answer two yes/no questions:
1. grounded: is every number in the answer supported by the tool outputs?
   True if the answer contains no numbers.
2. answers_question: does the answer address what the user asked, or clearly
   say why it can't?

Reply with only JSON, no other text:
{{"grounded": true, "answers_question": true, "reason": "<one short sentence>"}}"""


class JudgeError(Exception):
    pass


@dataclass(frozen=True)
class JudgeConfig:
    base_url: str
    api_key: str
    model: str


def judge_config() -> JudgeConfig | None:
    """None when JUDGE_API_KEY is unset; callers then skip LLM scoring.

    No fallback to GROQ_API_KEY on purpose: Groq limits are per organization,
    so a judge sharing the app's key would eat the production quota.
    """
    api_key = os.environ.get("JUDGE_API_KEY", "")
    if not api_key:
        return None
    # `or`, not a get() default: CI passes unset repo variables as empty strings
    return JudgeConfig(
        base_url=(os.environ.get("JUDGE_BASE_URL") or DEFAULT_BASE_URL).rstrip("/"),
        api_key=api_key,
        model=os.environ.get("JUDGE_MODEL") or DEFAULT_MODEL,
    )


def _complete(cfg: JudgeConfig, prompt: str) -> str:
    body = {
        "model": cfg.model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0,
        "max_tokens": 2048,
    }
    headers = {"Authorization": f"Bearer {cfg.api_key}"}
    for attempt in range(RETRIES):
        resp = httpx.post(f"{cfg.base_url}/chat/completions", json=body, headers=headers, timeout=60)
        if resp.status_code == 429 or resp.status_code >= 500:
            # free tiers rate-limit hard; honour Retry-After when given
            wait = float(resp.headers.get("retry-after") or 2 ** (attempt + 1))
            time.sleep(min(wait, 60))
            continue
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"].get("content") or ""
    raise JudgeError(f"judge still rate-limited after {RETRIES} attempts")


def _parse_verdict(text: str) -> dict:
    # Reasoning models may prepend <think>...</think>, which can contain braces.
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    for candidate in reversed(re.findall(r"\{[^{}]*\}", text)):
        try:
            verdict = json.loads(candidate)
        except json.JSONDecodeError:
            continue
        if isinstance(verdict.get("grounded"), bool) and isinstance(verdict.get("answers_question"), bool):
            return verdict
    raise JudgeError(f"no verdict JSON in judge reply: {text[:200]!r}")


def judge_chat_turn(cfg: JudgeConfig, *, question: str, tool_outputs: str, answer: str) -> dict:
    """{"grounded": bool, "answers_question": bool, "reason": str}"""
    prompt = GROUNDEDNESS_PROMPT.format(
        question=question,
        # keep the newest tool output when trimming; it's what the answer used
        tool_outputs=tool_outputs[-MAX_CONTEXT_CHARS:] or "(no tools were called)",
        answer=answer,
    )
    return _parse_verdict(_complete(cfg, prompt))
