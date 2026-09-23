from __future__ import annotations

import json
import uuid
from typing import Any

import anyio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, ToolMessage

from app.agents.chat_agent.graph import get_chat_graph
from app.chains.followups import suggest_followups
from app.db import chat_store
from app.db.persistence import get_checkpointer
from app.routes.deps import BearerToken
from app.schemas.chat import ChatRequest, ChatResponse, ToolCallTrace
from app.services.context import build_request_context

router = APIRouter(prefix="/chat", tags=["chat"])

# Tool outputs can be large (full expense lists); the stream only carries a
# preview for the UI — the model still sees the full result.
TOOL_OUTPUT_PREVIEW_CHARS = 2000
THREAD_TITLE_CHARS = 80
STOPPED_TOOL_OUTPUT = "Stopped before this finished."


def _run_config(conversation_id: str, checkpoint_id: str | None, user_id: str) -> dict:
    configurable = {"thread_id": conversation_id}
    if checkpoint_id:
        # LangGraph resumes from this checkpoint and forks the thread; later
        # turns without a checkpoint_id continue from the fork's head.
        configurable["checkpoint_id"] = checkpoint_id
    return {"configurable": configurable, "metadata": {"user_id": user_id}}


async def _authorize_thread(thread_id: str, user_id: str) -> dict | None:
    """The thread row, or None if it doesn't exist yet. Someone else's thread
    is reported as not found rather than forbidden, so ids can't be probed."""
    thread = await chat_store.get_thread(thread_id)
    if thread is not None and thread["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return thread


async def _prepare_turn(body: ChatRequest, user_id: str) -> tuple[str, dict, list[BaseMessage]]:
    """Shared setup for /chat and /chat/stream: resolve the thread, check
    ownership, apply a checkpoint restore, and build the graph input."""
    conversation_id = body.conversation_id or str(uuid.uuid4())
    thread = await _authorize_thread(conversation_id, user_id)
    if thread is None:
        await chat_store.ensure_thread(conversation_id, user_id, body.message[:THREAD_TITLE_CHARS])
    elif body.checkpoint_id:
        await chat_store.truncate_after_checkpoint(conversation_id, body.checkpoint_id)

    cfg = _run_config(conversation_id, body.checkpoint_id, user_id)
    messages = [*await _close_dangling_tool_calls(cfg), HumanMessage(content=body.message)]
    return conversation_id, cfg, messages


async def _close_dangling_tool_calls(cfg: dict) -> list[ToolMessage]:
    """ToolMessages answering tool calls that never ran.

    If a stream is cancelled after the model asked for tools but before they
    ran, the checkpoint ends on an AIMessage whose tool_calls have no
    ToolMessage replies. Sending the next HumanMessage on top of that is an
    invalid transcript and the model API rejects it — so close those calls
    out first, as errors the model can see and explain.
    """
    state = await get_chat_graph().aget_state(cfg)
    history = (state.values or {}).get("messages", [])
    last_ai = next((m for m in reversed(history) if isinstance(m, AIMessage)), None)
    if last_ai is None or not last_ai.tool_calls:
        return []
    after = history[history.index(last_ai) + 1 :]
    answered = {m.tool_call_id for m in after if isinstance(m, ToolMessage)}
    return [
        ToolMessage(
            content="Cancelled: the user stopped the response before this tool ran.",
            tool_call_id=tc["id"],
            name=tc["name"],
            status="error",
        )
        for tc in last_ai.tool_calls
        if tc["id"] not in answered
    ]


async def _head_checkpoint_id(conversation_id: str) -> str:
    # Head of the thread (no checkpoint_id), i.e. the state the turn just
    # produced — the client sends it back later to restore to this point.
    state = await get_chat_graph().aget_state({"configurable": {"thread_id": conversation_id}})
    return state.config["configurable"]["checkpoint_id"]


def _tool_output_text(m: ToolMessage) -> str:
    output = m.content if isinstance(m.content, str) else json.dumps(m.content, default=str)
    return output[:TOOL_OUTPUT_PREVIEW_CHARS]


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
    conversation_id, cfg, messages = await _prepare_turn(body, ctx.user_id)
    before = len((await get_chat_graph().aget_state(cfg)).values.get("messages", []))

    result = await get_chat_graph().ainvoke(
        {"messages": messages, "conversation_id": conversation_id, "user_id": ctx.user_id},
        context=ctx,
        config=cfg,
    )

    reply = ""
    tool_calls: list[ToolCallTrace] = []
    parts: list[dict[str, Any]] = []
    for m in result["messages"][before + len(messages) :]:
        if isinstance(m, AIMessage):
            if m.content:
                reply = m.content
                parts.append({"type": "text", "text": m.content})
            for tc in m.tool_calls:
                tool_calls.append(ToolCallTrace(name=tc["name"], args=tc["args"], result_preview=""))
                parts.append({"type": "tool", "id": tc["id"], "name": tc["name"], "args": tc["args"],
                              "output": None, "error": False})
        elif isinstance(m, ToolMessage):
            for p in parts:
                if p["type"] == "tool" and p["id"] == m.tool_call_id:
                    p.update(output=_tool_output_text(m), error=m.status == "error")

    await chat_store.append_turn(
        conversation_id,
        user_text=body.message,
        assistant_parts=parts,
        checkpoint_id=await _head_checkpoint_id(conversation_id),
    )
    return ChatResponse(conversation_id=conversation_id, reply=reply, tool_calls=tool_calls)


@router.post("/stream")
async def chat_stream(body: ChatRequest, token: BearerToken):
    """Same as POST /chat, but streams the reply as Server-Sent Events.

    Event payloads, one JSON object per `data:` line:
      {"conversation_id": ...}                      — first event
      {"reasoning": "..."}                          — model reasoning token(s)
      {"delta": "..."}                              — model text token(s)
      {"tool_call": {"id", "name", "args"}}         — model decided to call a tool
      {"tool_result": {"id", "name", "output", "error"}} — tool finished
      {"checkpoint_id": ...}                        — thread state after this turn
      {"suggestions": ["...", ...]}                 — follow-up questions
      [DONE]                                        — last event

    Text deltas come from stream_mode="messages", filtered to the call_model
    node so tool-internal chatter (the model's tool_call JSON, tool outputs)
    doesn't leak into what the user sees typed out. Tool events come from
    stream_mode="updates", where tool_calls arrive with complete args rather
    than as partial JSON chunks.

    The turn is saved to chat history when the stream ends — including when
    the client disconnects (Stop), in which case it's saved as far as it got.
    """
    ctx = await build_request_context(token)
    conversation_id, cfg, messages = await _prepare_turn(body, ctx.user_id)
    graph = get_chat_graph()

    def sse(payload) -> str:
        return f"data: {json.dumps(payload, default=str)}\n\n"

    async def event_stream():
        # What the user is shown, accumulated for chat history.
        parts: list[dict[str, Any]] = []
        checkpoint_id: str | None = None
        saved = False

        async def save() -> None:
            nonlocal saved
            if saved:
                return
            saved = True
            for p in parts:
                if p["type"] == "tool" and p["output"] is None:
                    p.update(output=STOPPED_TOOL_OUTPUT, error=True)
            await chat_store.append_turn(
                conversation_id,
                user_text=body.message,
                assistant_parts=parts,
                checkpoint_id=checkpoint_id,
            )

        def append_text(kind: str, delta: str) -> None:
            if parts and parts[-1]["type"] == kind:
                parts[-1]["text"] += delta
            else:
                parts.append({"type": kind, "text": delta})

        try:
            yield sse({"conversation_id": conversation_id})
            # Text of the final model turn only (reset on each tool call), used
            # to ground the follow-up suggestions in the actual answer.
            answer = ""
            async for mode, payload in graph.astream(
                {"messages": messages, "conversation_id": conversation_id, "user_id": ctx.user_id},
                context=ctx,
                config=cfg,
                stream_mode=["messages", "updates"],
            ):
                if mode == "messages":
                    chunk, meta = payload
                    if meta.get("langgraph_node") != "call_model":
                        continue
                    # Groq returns gpt-oss reasoning in a separate field, which
                    # langchain-groq surfaces as additional_kwargs.reasoning_content.
                    reasoning = getattr(chunk, "additional_kwargs", {}).get("reasoning_content")
                    if reasoning:
                        append_text("reasoning", reasoning)
                        yield sse({"reasoning": reasoning})
                    if getattr(chunk, "content", None):
                        answer += chunk.content
                        append_text("text", chunk.content)
                        yield sse({"delta": chunk.content})
                    continue

                for node, update in payload.items():
                    if not isinstance(update, dict):
                        continue
                    for m in update.get("messages", []):
                        if node == "call_model" and isinstance(m, AIMessage):
                            if m.tool_calls:
                                answer = ""
                            for tc in m.tool_calls:
                                parts.append({"type": "tool", "id": tc["id"], "name": tc["name"],
                                              "args": tc["args"], "output": None, "error": False})
                                yield sse({"tool_call": {"id": tc["id"], "name": tc["name"], "args": tc["args"]}})
                        elif node == "tools" and isinstance(m, ToolMessage):
                            output = _tool_output_text(m)
                            error = m.status == "error"
                            for p in parts:
                                if p["type"] == "tool" and p["id"] == m.tool_call_id:
                                    p.update(output=output, error=error)
                            yield sse({"tool_result": {"id": m.tool_call_id, "name": m.name,
                                                       "output": output, "error": error}})

            checkpoint_id = await _head_checkpoint_id(conversation_id)
            yield sse({"checkpoint_id": checkpoint_id})

            if answer.strip():
                suggestions = await suggest_followups(question=body.message, answer=answer)
                if suggestions:
                    parts.append({"type": "suggestions", "items": suggestions})
                    yield sse({"suggestions": suggestions})
            # Save before [DONE]: the client refreshes its chat list as soon
            # as the stream ends, and should see this turn in it.
            await save()
            yield "data: [DONE]\n\n"
        finally:
            # Client disconnected (Stop) or the run failed: save what was
            # shown so far. Shielded so the save isn't itself cancelled by the
            # disconnect. checkpoint_id stays None — a stopped turn isn't a
            # point you can restore to.
            with anyio.CancelScope(shield=True):
                await save()

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/threads")
async def list_threads(token: BearerToken):
    """The current user's chats, most recently active first."""
    ctx = await build_request_context(token)
    return {"threads": await chat_store.list_threads(ctx.user_id)}


@router.get("/threads/{thread_id}")
async def get_thread(thread_id: str, token: BearerToken):
    """One chat with its full display history (parts per message, see
    app/db/chat_store.py)."""
    ctx = await build_request_context(token)
    thread = await _authorize_thread(thread_id, ctx.user_id)
    if thread is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {
        "id": thread["id"],
        "title": thread["title"],
        "updated_at": thread["updated_at"],
        "messages": await chat_store.get_messages(thread_id),
    }


@router.delete("/threads/{thread_id}", status_code=204)
async def delete_thread(thread_id: str, token: BearerToken):
    ctx = await build_request_context(token)
    if await _authorize_thread(thread_id, ctx.user_id) is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await chat_store.delete_thread(thread_id)
    await get_checkpointer().adelete_thread(thread_id)


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, token: BearerToken):
    """Replay a conversation's raw message history from the checkpointer."""
    ctx = await build_request_context(token)
    await _authorize_thread(conversation_id, ctx.user_id)
    state = await get_chat_graph().aget_state({"configurable": {"thread_id": conversation_id}})
    messages = (state.values or {}).get("messages", [])
    return {
        "conversation_id": conversation_id,
        "messages": [
            {"role": m.__class__.__name__, "content": m.content}
            for m in messages
            if getattr(m, "content", None)
        ],
    }
