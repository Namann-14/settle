# packages/ui/src/components/input-group.tsx

**Purpose:** Composite input with addons (icons, buttons, text) inside one bordered field.

**Key contents:** Exports InputGroup, InputGroupAddon (align variants via cva), InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea.

**Depends on / used by:** Depends on button, input, textarea, `cn`. Used by form and chat-composer UIs.

**Decisions & caveats:** Inner input/textarea have their own borders stripped so the group draws a single border; focus state is handled at the group level. Client component.
