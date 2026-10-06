# apps/web/src/components/spending/categories-page.tsx

**Purpose:** Categories tab: view system categories and manage custom ones.

**Key contents:** Lists categories, with `CustomCategoryRow` for edit/delete and `CategoryEditor` to create or edit with a name, icon and colour.

**Depends on / used by:** Uses category hooks and mutations, `category-icon.tsx` presets.

**Decisions & caveats:** System categories are read-only; only custom ones are editable. Deleting a category uncategorizes its expenses and drops its budget (see useDeleteCategory).
