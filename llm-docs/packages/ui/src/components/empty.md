# packages/ui/src/components/empty.tsx

**Purpose:** Empty-state layout component for lists/pages with no data.

**Key contents:** Exports Empty, EmptyHeader, EmptyMedia (default/icon variant via cva), EmptyTitle, EmptyDescription, EmptyContent. Dashed-border centered flex container.

**Depends on / used by:** Uses `cn` from lib/utils and class-variance-authority. Used by app pages for empty lists.

**Decisions & caveats:** Server-component safe (no "use client"). Slots are tagged with `data-slot` attributes for styling.
