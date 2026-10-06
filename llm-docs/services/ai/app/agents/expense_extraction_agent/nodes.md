# services/ai/app/agents/expense_extraction_agent/nodes.py

**Purpose:** Nodes for the extraction demo graph: normalise input to text, then extract fields.

**Key contents:** `parse_source` handles NL_TEXT, VOICE (download + Whisper transcription) and RECEIPT_IMAGE (download + OCR provider); `extract_fields` runs the extraction chain.

**Depends on / used by:** Uses chains/extraction, llm/audio, llm/vision, httpx.

**Decisions & caveats:** A Studio-visible demo only: the real, authenticated path is routes/expenses.py calling chains/extraction directly with the user's categories and members. This graph has no RequestContext, so it runs ungrounded (no categories or participant resolution).
