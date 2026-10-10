# apps/web/src/hooks/mutations/useDeleteCategory.ts

**Purpose:** Mutation to delete a category.

**Key contents:** `useDeleteCategory` invalidates categories, budgets, expenses and spending.

**Depends on / used by:** Uses `lib/api/categories`.

**Decisions & caveats:** Deleting uncategorizes the category's expenses and drops its budget, hence the wider invalidation.
