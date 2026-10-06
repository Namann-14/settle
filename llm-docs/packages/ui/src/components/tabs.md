# packages/ui/src/components/tabs.tsx

**Purpose:** Tabbed navigation.

**Key contents:** Exports Tabs, TabsList (with `tabsListVariants` via cva), TabsTrigger, TabsContent around Base UI Tabs.

**Depends on / used by:** Used by the Spending page (Overview, Budgets, Recurring, Categories) per decisions.md.

**Decisions & caveats:** Built on @base-ui/react primitives (not Radix). Client-side wrappers keep `data-slot` attributes for styling hooks.
