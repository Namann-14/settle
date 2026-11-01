# apps/web/src/components/spending/categories-page.tsx

**Purpose:** Categories tab: view system categories and manage custom ones.

**Key contents:** `PageHeader` ("Categories", count and that Settle AI picks from them), then two panels side by side on `lg`: "Your own" (`CategoryEditor` create form plus `CustomCategoryRow` rows with edit/delete) and "Built in" (read-only pill chips). `CategoryEditor` creates or edits with a name, icon and colour.

**Depends on / used by:** Uses category hooks and mutations, `category-icon.tsx` presets, `components/dashboard/panel` and `./states`.

**Decisions & caveats:** System categories are read-only; only custom ones are editable. Deleting a category uncategorizes its expenses and drops its budget (see useDeleteCategory). Icon and colour pickers are 40px targets on phones, 32px from `sm`.
