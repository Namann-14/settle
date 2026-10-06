# apps/web/src/types/category.ts

**Purpose:** Types for expense categories.

**Key contents:** `Category` (icon is a lucide name, color a chart token like `chart-3`, `is_system`), create/update payloads.

**Depends on / used by:** `lib/api/categories.ts`.

**Decisions & caveats:** System categories have no `user_id`; 12 are seeded.
