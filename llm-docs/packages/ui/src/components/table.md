# packages/ui/src/components/table.tsx

**Purpose:** Styled HTML table primitives.

**Key contents:** Exports Table (wrapped in overflow container), TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption.

**Depends on / used by:** Uses `cn`; used by expense/list views.

**Decisions & caveats:** Built on @base-ui/react primitives (not Radix). Client-side wrappers keep `data-slot` attributes for styling hooks.
