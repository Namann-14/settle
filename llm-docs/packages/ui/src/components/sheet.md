# packages/ui/src/components/sheet.tsx

**Purpose:** Slide-in side panel (drawer) built on a dialog.

**Key contents:** Exports Sheet, SheetTrigger, SheetClose, SheetContent (side variants, optional close button), SheetHeader, SheetFooter, SheetTitle, SheetDescription.

**Depends on / used by:** Base UI Dialog aliased as SheetPrimitive, button, lucide XIcon. Used by sidebar for the mobile drawer.

**Decisions & caveats:** Implemented on Base UI Dialog rather than a dedicated primitive.
