# services/ai/app/llm/audio.py

**Purpose:** Speech-to-text via Groq Whisper.

**Key contents:** `transcribe_audio(filename, audio_bytes, language, prompt)` using a lazy AsyncGroq client and the configured whisper model.

**Depends on / used by:** Uses core/config; used by the extraction pipeline and voice routes.

**Decisions & caveats:** The `prompt` argument can carry category/member names to bias Whisper toward those proper nouns.
