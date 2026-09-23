from __future__ import annotations

import json

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.llm.client import get_extraction_model
from app.prompts.insights import ANOMALY_NARRATIVE_SYSTEM, INSIGHTS_NARRATIVE_SYSTEM

_summary_chain = None
_anomaly_chain = None


def _build_chain(system_prompt: str):
    model = get_extraction_model(temperature=0.2)
    prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("human", "{data}")])
    return prompt | model | StrOutputParser()


def _get_summary_chain():
    global _summary_chain
    if _summary_chain is None:
        _summary_chain = _build_chain(INSIGHTS_NARRATIVE_SYSTEM)
    return _summary_chain


def _get_anomaly_chain():
    global _anomaly_chain
    if _anomaly_chain is None:
        _anomaly_chain = _build_chain(ANOMALY_NARRATIVE_SYSTEM)
    return _anomaly_chain


async def narrate_summary(summary_dict: dict) -> str:
    chain = _get_summary_chain()
    return await chain.ainvoke({"data": json.dumps(summary_dict)})


async def narrate_anomalies(anomalies: list[dict]) -> str:
    if not anomalies:
        return "Nothing stood out — your spending looked normal for this period."
    chain = _get_anomaly_chain()
    return await chain.ainvoke({"data": json.dumps(anomalies)})
