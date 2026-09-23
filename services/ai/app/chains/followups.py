from __future__ import annotations

import logging

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from app.llm.client import get_extraction_model
from app.prompts.followups import FOLLOWUPS_SYSTEM

logger = logging.getLogger(__name__)


class _Followups(BaseModel):
    questions: list[str] = Field(description="Exactly 3 short follow-up questions")


def _build_chain():
    # Low reasoning effort: this runs after the answer has already streamed,
    # so every second here is a second the suggestions lag behind it.
    model = get_extraction_model(temperature=0.5).bind(reasoning_effort="low")
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", FOLLOWUPS_SYSTEM),
            ("human", "User asked: {question}\n\nAssistant answered: {answer}"),
        ]
    )
    return prompt | model.with_structured_output(_Followups)


_chain = None


def _get_chain():
    global _chain
    if _chain is None:
        _chain = _build_chain()
    return _chain


async def suggest_followups(*, question: str, answer: str) -> list[str]:
    """Best-effort: suggestions are a nicety, so any failure returns []
    rather than breaking the chat stream they're appended to."""
    try:
        result = await _get_chain().ainvoke({"question": question, "answer": answer[:4000]})
    except Exception:
        logger.warning("follow-up suggestion generation failed", exc_info=True)
        return []
    return [q.strip() for q in result.questions if q.strip()][:3]
