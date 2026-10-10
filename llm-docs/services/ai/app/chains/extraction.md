# services/ai/app/chains/extraction.py

**Purpose:** Turns typed/transcribed text or OCR receipt text into a structured expense draft.

**Key contents:** Pydantic `ExtractedExpense` and `ParticipantMention` models; `extract_from_text` and `extract_from_receipt_text` build payloads (categories, speaker, default currency, today) and run text or receipt chains.

**Depends on / used by:** Uses prompts/extraction, llm/client, schemas.common.SplitType. Participant name resolution to user_ids happens later in services.participants.

**Decisions & caveats:** Retries once, then falls back to a zero-confidence manual-entry draft. `_ensure_speaker_present` guarantees the speaker is in the participant list when the model drops them from a split (the most common observed failure), regardless of the prompt.
