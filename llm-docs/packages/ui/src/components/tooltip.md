# packages/ui/src/components/tooltip.tsx

**Purpose:** Hover tooltip.

**Key contents:** Exports Tooltip, TooltipTrigger, TooltipContent, TooltipProvider around Base UI Tooltip.

**Depends on / used by:** Used by sidebar for collapsed-icon labels; TooltipProvider lives in DashboardProviders.

**Decisions & caveats:** Needs a TooltipProvider ancestor (mounted in DashboardProviders, not the root layout).
