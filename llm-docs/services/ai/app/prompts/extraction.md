# services/ai/app/prompts/extraction.py

**Purpose:** System prompts for text and receipt expense extraction.

**Key contents:** `EXTRACTION_SYSTEM` (typed or transcribed text) and `RECEIPT_EXTRACTION_SYSTEM` (OCR text; use grand total, merchant name), with placeholders for speaker, currency and categories.

**Depends on / used by:** Used by chains/extraction.

**Decisions & caveats:** The prompt says the speaker is always a participant, but chains/extraction also enforces that in code. Ambiguities go in notes_for_user rather than guesses.
