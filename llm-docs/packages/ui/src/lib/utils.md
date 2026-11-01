# packages/ui/src/lib/utils.ts

**Purpose:** Class-name helper used by every UI component.

**Key contents:** `cn(...inputs)` = `twMerge(clsx(inputs))`.

**Depends on / used by:** Imported by essentially all of packages/ui/src/components. Depends on clsx and tailwind-merge.

**Decisions & caveats:** Nothing notable. `cn` uses `extendTailwindMerge` to register the app's custom font-size names (`micro`, `meta`, `figure`); without it tailwind-merge treated `text-meta` as a colour and silently dropped it next to `text-muted-foreground`. Add any new `--text-*` role here too.
