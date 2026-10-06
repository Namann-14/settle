# packages/ui/src/components/attachment.tsx

**Purpose:** Chat/file attachment chip with states.

**Key contents:** `Attachment` (sizes default/sm/xs, horizontal/vertical orientation, states idle/uploading/processing/error/done), `AttachmentGroup`, `AttachmentMedia` (icon or image), `AttachmentContent`, `AttachmentTitle`, `AttachmentDescription`, `AttachmentActions`, `AttachmentAction`, `AttachmentTrigger`.

**Depends on / used by:** `button.tsx`, Base UI `useRender`; probably used in the AI chat input.

**Decisions & caveats:** Styling is driven by `data-state`/`data-slot` attributes and group selectors, so child components rely on being nested in `Attachment`.
