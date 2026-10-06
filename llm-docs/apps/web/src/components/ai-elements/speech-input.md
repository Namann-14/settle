# apps/web/src/components/ai-elements/speech-input.tsx

**Purpose:** Mic button for voice dictation using the Web Speech API or a MediaRecorder fallback.

**Key contents:** `SpeechInput` button with listening/processing states and transcription callbacks.

**Depends on / used by:** Uses `@settle/ui` button/spinner.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library. Voice capture for expenses is implemented separately in `expenses/ai-quick-add.tsx`.
