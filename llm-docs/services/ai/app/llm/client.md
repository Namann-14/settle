# services/ai/app/llm/client.py

**Purpose:** Factory functions for chat models.

**Key contents:** `get_chat_model` (temperature 0.3) and `get_extraction_model` (temperature 0.0) returning ChatGroq with configured model names.

**Depends on / used by:** Used by agents and chains.

**Decisions & caveats:** Extraction defaults to temperature 0 for determinism. Both roles currently default to the same model but are configured separately.
