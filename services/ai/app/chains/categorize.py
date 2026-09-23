from __future__ import annotations

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from app.llm.client import get_extraction_model
from app.prompts.categorize import CATEGORIZE_SYSTEM


class _CategoryGuess(BaseModel):
    """Raw model output before we map category_name back to a real UUID."""

    category_name: str | None = Field(
        description="Exactly one of the provided category names, or null if none fit"
    )
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str


def _build_chain():
    model = get_extraction_model()
    prompt = ChatPromptTemplate.from_messages(
        [("system", CATEGORIZE_SYSTEM), ("human", "{description}")]
    )
    return prompt | model.with_structured_output(_CategoryGuess)


_chain = None


def _get_chain():
    global _chain
    if _chain is None:
        _chain = _build_chain()
    return _chain


def _format_description(description: str, amount: float | None, merchant: str | None) -> str:
    parts = [description]
    if amount is not None:
        parts.append(f"(amount: {amount})")
    if merchant:
        parts.append(f"(merchant: {merchant})")
    return " ".join(parts)


async def categorize_expense(
    *,
    description: str,
    amount: float | None,
    merchant: str | None,
    categories: list[dict],
) -> _CategoryGuess:
    """Ground the LLM's guess against the user's real categories.

    `categories` is the raw list from GET /categories (each a dict with at
    least "name"). The route is responsible for mapping the returned
    category_name back to a real category_id — an off-list name means the
    model didn't find a match, which the route treats as category_id=None.

    Retries once on failure: llama-3.3-70b occasionally emits a numeric field
    (e.g. confidence) as a JSON string, which Groq's own server-side schema
    validation rejects before the call even returns — a real, observed
    failure mode, not a hypothetical. A repeat attempt usually succeeds; if
    it doesn't, fall back to a low-confidence "couldn't parse" result rather
    than 500ing the caller.
    """
    names = ", ".join(c["name"] for c in categories) or "(no categories exist yet)"
    chain = _get_chain()
    payload = {
        "description": _format_description(description, amount, merchant),
        "categories": names,
    }
    try:
        return await chain.ainvoke(payload)
    except Exception:
        try:
            return await chain.ainvoke(payload)
        except Exception:
            return _CategoryGuess(
                category_name=None,
                confidence=0.0,
                reasoning="Could not parse a category suggestion for this description.",
            )
