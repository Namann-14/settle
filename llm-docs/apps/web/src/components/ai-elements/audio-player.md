# apps/web/src/components/ai-elements/audio-player.tsx

**Purpose:** Audio player for speech results built on media-chrome.

**Key contents:** `AudioPlayer` plus element, control bar, play, seek, time, range, duration and mute parts.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses media-chrome components and `Experimental_SpeechResult` from `ai`.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. Depends on the experimental AI SDK speech type, which may change.
