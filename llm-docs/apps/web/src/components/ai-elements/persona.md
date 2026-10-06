# apps/web/src/components/ai-elements/persona.tsx

**Purpose:** Animated Rive-based AI persona/avatar that reflects states (idle, listening, thinking, speaking, asleep).

**Key contents:** `Persona` with `PersonaState`, loads Rive files with variants, state inputs, and a dark-mode switch.

**Depends on / used by:** Part of the `ai-elements` set installed from the AI SDK Elements registry (`@ai-elements` in `apps/web/components.json`). Not currently imported anywhere in the app outside this folder. Uses `@rive-app/react-webgl2`.

**Decisions & caveats:** Vendored generated code: re-run the registry installer to update rather than hand-editing; local edits will be lost. Fetches `.riv` assets from a remote host and needs WebGL2; heavy dependency.
