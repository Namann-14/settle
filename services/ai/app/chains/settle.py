from __future__ import annotations

import json
import logging

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from app.llm.client import get_extraction_model
from app.prompts.settle import GROUP_INSIGHT_SYSTEM, SETTLE_PLAN_SYSTEM

logger = logging.getLogger(__name__)


class _Reminder(BaseModel):
    index: int = Field(description="Index of the payment this reminder is for")
    message: str


class _PlanCopy(BaseModel):
    headline: str
    reminders: list[_Reminder] = Field(default_factory=list)


_plan_chain = None
_insight_chain = None


def _get_plan_chain():
    global _plan_chain
    if _plan_chain is None:
        model = get_extraction_model(temperature=0.4).bind(reasoning_effort="low")
        prompt = ChatPromptTemplate.from_messages([("system", SETTLE_PLAN_SYSTEM), ("human", "{data}")])
        _plan_chain = prompt | model.with_structured_output(_PlanCopy)
    return _plan_chain


def _get_insight_chain():
    global _insight_chain
    if _insight_chain is None:
        model = get_extraction_model(temperature=0.2)
        prompt = ChatPromptTemplate.from_messages([("system", GROUP_INSIGHT_SYSTEM), ("human", "{data}")])
        _insight_chain = prompt | model | StrOutputParser()
    return _insight_chain


async def write_plan_copy(payload: dict) -> tuple[str | None, dict[int, str]]:
    """Best-effort: the plan's numbers stand on their own, so an LLM failure
    returns (None, {}) and the caller falls back to templated copy."""
    try:
        result = await _get_plan_chain().ainvoke({"data": json.dumps(payload)})
    except Exception:
        logger.warning("settle plan copy generation failed", exc_info=True)
        return None, {}
    return result.headline.strip(), {r.index: r.message.strip() for r in result.reminders}


async def narrate_group_insight(stats: dict) -> str:
    return (await _get_insight_chain().ainvoke({"data": json.dumps(stats)})).strip()
