# apps/web/src/components/spending/category-icon.tsx

**Purpose:** Maps stored category icon and colour names to rendered icons and CSS colours.

**Key contents:** Exports `CATEGORY_ICONS` (whitelisted lucide icons), `CATEGORY_COLORS` (chart-1..5), `categoryColor` and `CategoryIcon`.

**Depends on / used by:** Used by categories, budgets, recurring and overview pages.

**Decisions & caveats:** Categories store a lucide icon name; unknown names fall back to a tag icon. Adding an icon requires adding it to this whitelist.
