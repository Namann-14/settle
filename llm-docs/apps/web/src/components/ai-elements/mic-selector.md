# apps/web/src/components/ai-elements/mic-selector.tsx

**Purpose:** Microphone device picker with `useAudioDevices` hook.

**Key contents:** `useAudioDevices` (enumerates devices, handles permission) and `MicSelector` popover/command parts.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@radix-ui/react-use-controllable-state`, `@settle/ui` Popover/Command.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. Needs mic permission before device labels appear.
