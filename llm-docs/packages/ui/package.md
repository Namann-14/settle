# packages/ui/package.json

**Purpose:** Manifest for `@settle/ui`, the shared component library.

**Key contents:** Exports `globals.css`, `lib/*`, `components/*`, `hooks/*` and the postcss config by path (no build step). Deps: Base UI, cva, clsx, tailwind-merge, cmdk, embla, recharts, lucide, sonner, next-themes; Tailwind 4 and its PostCSS plugin as dev deps.

**Depends on / used by:** Consumed by `apps/web` via the `@settle/ui/*` alias.

**Decisions & caveats:** Source is consumed directly as TypeScript, so the consuming app must transpile it. Only `check-types` is scripted.
