# apps/web/src/components/ai-elements/transcription.tsx

**Purpose:** Synced transcript display that highlights the segment at the current playback time.

**Key contents:** `Transcription` (takes an AI SDK transcription result, controllable current time) and `TranscriptionSegment` (clickable word/segment).

**Depends on / used by:** Uses `ai` `Experimental_TranscriptionResult` type.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library. Depends on an experimental AI SDK type.
