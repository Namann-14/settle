# packages/ui/components.json

**Purpose:** shadcn CLI configuration for the shared UI package.

**Key contents:** Style `base-lyra`, RSC and TSX on, neutral base color with CSS variables, lucide icons, no Tailwind config (Tailwind v4), CSS at `src/styles/globals.css`, aliases mapping to `@settle/ui/components|lib|hooks`.

**Depends on / used by:** Used by `npx shadcn add`; generated components land in `src/components/`.

**Decisions & caveats:** The `base-lyra` style builds on Base UI primitives (`@base-ui/react`) rather than Radix, which is why components use `useRender`/`mergeProps`. Aliases point at the package name, so generated imports are `@settle/ui/...`.
