# packages/ui/src/styles/globals.css

**Purpose:** Tailwind v4 entry stylesheet and design tokens for the whole monorepo.

**Key contents:** Imports tailwindcss, tw-animate-css and shadcn/tailwind.css; `@source` globs cover apps/** and the UI package; defines `:root` and `.dark` oklch colour tokens (green-tinted palette, chart colours, sidebar colours), fonts (Inter/Lora/JetBrains Mono), radius, shadows, and an `@theme inline` block mapping tokens to Tailwind utilities.

**Depends on / used by:** Consumed by apps/web's root layout; tokens used by all components in packages/ui.

**Decisions & caveats:** Dark mode is class-based (`@custom-variant dark (&:is(.dark *))`), matching next-themes. The `@source` paths are relative to this file, so moving it breaks class detection. Decisions.md notes Inter's optical-size axis was dropped for font weight; font loading itself happens in the app.
