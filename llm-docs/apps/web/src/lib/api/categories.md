# apps/web/src/lib/api/categories.ts

**Purpose:** Client for `/api/categories`.

**Key contents:** `listCategories`, `createCategory`, `updateCategory` (PATCH), `deleteCategory`. Carries its own copy of `handleResponse`.

**Depends on / used by:** `types/category.ts`; category pickers and Spending > Categories tab.

**Decisions & caveats:** Duplicates `handleResponse` from `http.ts` instead of importing it; older style. System categories (12 seeded) are not user-editable server-side.
