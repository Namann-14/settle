# apps/web/src/components/ai-elements/voice-selector.tsx

**Purpose:** Command-palette dialog for picking a TTS voice, with gender/accent/age metadata.

**Key contents:** `VoiceSelector` context plus Trigger, Content, Dialog, Input, List, Group, Item, Gender, Accent, Age, Name, Description, Attributes, Preview parts.

**Depends on / used by:** Uses `@settle/ui` dialog/command/button/spinner.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library.
