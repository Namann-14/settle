# apps/web/src/hooks/mutations/useUpdateCategory.ts

**Purpose:** Mutation to update a category.

**Key contents:** `useUpdateCategory` invalidates categories and spending.

**Depends on / used by:** Uses `lib/api/categories`.

**Decisions & caveats:** Spending invalidated because category names, icons and colours are baked into the summary.
