# services/ai/app/chains/followups.py

**Purpose:** Generates three suggested follow-up questions after a chat answer.

**Key contents:** `suggest_followups(question, answer)` runs a low-reasoning-effort structured chain and returns up to 3 stripped questions.

**Depends on / used by:** Uses prompts/followups, llm/client. Called by routes/chat.py after the answer streams.

**Decisions & caveats:** Best-effort: any failure returns [] so the chat stream is never broken. Reasoning effort is low because it runs after the answer, and answers are truncated to 4000 chars.
