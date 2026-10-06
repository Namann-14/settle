# services/ai/app/services/participants.py

**Purpose:** Resolves names mentioned in free text to real group members.

**Key contents:** `resolve_participants` (self, matched, ambiguous, unresolved), `_dedupe_by_user_id`, `_name_matches` (exact or first-name match, case-insensitive).

**Depends on / used by:** `chains/extraction.ParticipantMention`, `schemas/draft`. Used by `services/draft_builder.py`.

**Decisions & caveats:** The model sometimes returns both "me" and the user's own name; matching the caller's name and de-duping by user_id collapses these into one "self". Unresolved/ambiguous entries are never de-duped. Requires api to expose `user_name` in group members; otherwise everyone but the speaker is unresolved, which is a safe fallback with a member picker in the UI.
