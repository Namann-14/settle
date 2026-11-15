"""Offline eval: does the chat agent pick the right first tool?

Only the first model step runs, so no services/api, token or test data is
needed: the check is the tool call the model asks for, not what it returns.
"""

import pytest
from langchain_core.messages import HumanMessage, SystemMessage
from langsmith import testing as t

from app.llm.client import get_chat_model
from app.prompts.chat import CHAT_SYSTEM
from app.tools import CHAT_TOOLS
from evals.cases import load_cases

DATA = load_cases("tool_routing_cases.json")
CTX = DATA["context"]


@pytest.mark.langsmith(test_suite_name="settle-tool-routing")
@pytest.mark.parametrize("case", DATA["cases"], ids=lambda c: c["id"])
def test_first_tool(case, arun):
    t.log_inputs({"question": case["question"], **CTX})
    t.log_reference_outputs({"tools": case["tools"], "args": case.get("args")})

    model = get_chat_model().bind_tools(CHAT_TOOLS)
    system = SystemMessage(
        content=CHAT_SYSTEM.format(
            today=CTX["today"], user_name=CTX["user_name"], default_currency=CTX["default_currency"]
        )
    )
    reply = arun(model.ainvoke([system, HumanMessage(content=case["question"])]))
    calls = [{"name": tc["name"], "args": tc["args"]} for tc in reply.tool_calls]
    t.log_outputs({"tool_calls": calls, "content": reply.content})

    first = calls[0] if calls else None
    expected = case["tools"]
    tool_ok = first is None if not expected else first is not None and first["name"] in expected
    t.log_feedback(key="correct_first_tool", score=int(tool_ok))
    assert tool_ok, f"expected one of {expected or 'no tool'}, got {calls}"

    if case.get("args"):
        args_ok = all(first["args"].get(k) == v for k, v in case["args"].items())
        t.log_feedback(key="correct_tool_args", score=int(args_ok))
        assert args_ok, f"expected args {case['args']}, got {first['args']}"
