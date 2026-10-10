# apps/web/src/components/ai-elements/shimmer.tsx

**Purpose:** Animated shimmering text used as a 'thinking/loading' indicator.

**Key contents:** `Shimmer` (memoized) renders text via `motion` with a moving gradient; props: `as`, `duration`, `spread`.

**Depends on / used by:** Uses `motion/react`. Used by reasoning.tsx, chat/assistant-message.tsx and chat/chat-panel.tsx.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Used actively. Sweeps via a CSS background-position animation, so `children` must be a plain string (assistant-message passes template strings for that reason).
