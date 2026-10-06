# packages/ui/src/components/button.tsx

**Purpose:** Core button component and variants.

**Key contents:** `Button` and `buttonVariants`: variants default, outline, secondary, ghost, destructive, link; sizes xs, sm, default, lg, icon, icon-xs, icon-sm, icon-lg. Built on Base UI Button.

**Depends on / used by:** Imported by many components (attachment, carousel, dialog) and app pages.

**Decisions & caveats:** Fully rounded pill style by default (`rounded-full`) and small text (`text-xs`); this is the `base-lyra` look, so use `size` rather than overriding classes. Destructive is a tinted style, not solid red.
