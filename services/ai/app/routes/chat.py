from __future__ import annotations

import json
import uuid

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, HumanMessage

from app.agents.chat_agent.graph import CHECKPOINTER, graph
from app.routes.deps import BearerToken
from app.schemas.chat import ChatRequest, ChatResponse, ToolCallTrace
from app.services.context import build_request_context

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/ping")
def ping():
    """Liveness check. Deliberately does NOT call Groq — this used to burn an
    LLM call on every health probe."""
    return {"status": "ok"}


@router.post("", response_model=ChatResponse)
async def chat(body: ChatRequest, token: BearerToken):
    """Send a message to the AI chat agent.

    Omit `conversation_id` to start a new conversation. Reuse the returned
    `conversation_id` on the next call to continue the same thread — memory
    is keyed by it via the graph's checkpointer.
    """
    ctx = await build_request_context(token)
    conversation_id = body.conversation_id or str(uuid.uuid4())
    cfg = {"configurable": {"thread_id": conversation_id}, "metadata": {"user_id": ctx.user_id}}

    result = await graph.ainvoke(
        {
            "messages": [HumanMessage(content=body.message)],
            "conversation_id": conversation_id,
            "user_id": ctx.user_id,
        },
        context=ctx,
        config=cfg,
    )

    reply = ""
    tool_calls: list[ToolCallTrace] = []
    for m in result["messages"]:
        if isinstance(m, AIMessage) and m.content:
            reply = m.content
        if isinstance(m, AIMessage) and m.tool_calls:
            for tc in m.tool_calls:
                tool_calls.append(ToolCallTrace(name=tc["name"], args=tc["args"], result_preview=""))

    return ChatResponse(conversation_id=conversation_id, reply=reply, tool_calls=tool_calls)


@router.post("/stream")
async def chat_stream(body: ChatRequest, token: BearerToken):
    """Same as POST /chat, but streams the reply as Server-Sent Events.

    Filters stream_mode="messages" chunks to the call_model node only, so
    tool-internal chatter (the model's tool_call JSON, tool outputs) doesn't
    leak into what the user sees typed out.
    """
    ctx = await build_request_context(token)
    conversation_id = body.conversation_id or str(uuid.uuid4())
    cfg = {"configurable": {"thread_id": conversation_id}, "metadata": {"user_id": ctx.user_id}}

    async def event_stream():
        yield f"data: {json.dumps({'conversation_id': conversation_id})}\n\n"
        async for chunk, meta in graph.astream(
            {
                "messages": [HumanMessage(content=body.message)],
                "conversation_id": conversation_id,
                "user_id": ctx.user_id,
            },
            context=ctx,
            config=cfg,
            stream_mode="messages",
        ):
            if meta.get("langgraph_node") == "call_model" and getattr(chunk, "content", None):
                yield f"data: {json.dumps({'delta': chunk.content})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, token: BearerToken):
    """Replay a conversation's message history from the checkpointer."""
    await build_request_context(token)  # validates the token
    checkpoint = CHECKPOINTER.get({"configurable": {"thread_id": conversation_id}})
    if checkpoint is None:
        return {"conversation_id": conversation_id, "messages": []}
    messages = checkpoint.get("channel_values", {}).get("messages", [])
    return {
        "conversation_id": conversation_id,
        "messages": [
            {"role": m.__class__.__name__, "content": m.content}
            for m in messages
            if getattr(m, "content", None)
        ],
    }
