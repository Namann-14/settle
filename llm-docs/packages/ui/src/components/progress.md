# packages/ui/src/components/progress.tsx

**Purpose:** Progress bar.

**Key contents:** Exports Progress and its track/indicator/label/value parts around Base UI Progress.

**Depends on / used by:** Uses `cn`; the budget bars in the spending UI are a natural consumer.

**Decisions & caveats:** Per decisions.md budget bars change colour at 80% and when over; that colouring is expected to be applied by callers via className, not built in here.
