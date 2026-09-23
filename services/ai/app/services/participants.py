from __future__ import annotations

from app.chains.extraction import ParticipantMention
from app.schemas.draft import ResolvedParticipant

_SELF_MARKERS = {"i", "me", "myself"}


def resolve_participants(
    mentions: list[ParticipantMention],
    members: list[dict],
    *,
    me_user_id: str,
    me_name: str | None = None,
) -> list[ResolvedParticipant]:
    """Match extracted names against real group members.

    `members` is the raw GroupMemberResponse list from GET /groups/{id} — each
    a dict with user_id, user_name, user_email (user_name/user_email require
    the services/api change adding them to GroupMemberResponse; on an
    unpatched api they'll be None and everyone but the speaker resolves to
    "unresolved", which is still a safe, shippable UX — the frontend shows a
    member picker for the user to confirm).

    `me_name` is the caller's own name (passed into the extraction prompt as
    their identity). The model sometimes echoes it back as a distinct
    participant alongside "me"/"I" — e.g. extracting both "me" and "Naman"
    for the same person. Matching it here, then de-duping by resolved user_id
    below, collapses that into one "self" entry instead of two.
    """
    resolved: list[ResolvedParticipant] = []
    me_lowered = me_name.strip().lower() if me_name else None

    for mention in mentions:
        raw = mention.raw_name.strip()
        lowered = raw.lower()

        if lowered in _SELF_MARKERS or (me_lowered and _name_matches(lowered, me_lowered)):
            resolved.append(
                ResolvedParticipant(raw_name=raw, user_id=me_user_id, resolution="self")
            )
            continue

        matches = [
            m
            for m in members
            if m.get("user_name") and _name_matches(lowered, m["user_name"].lower())
        ]

        if len(matches) == 1:
            resolved.append(
                ResolvedParticipant(
                    raw_name=raw, user_id=str(matches[0]["user_id"]), resolution="matched"
                )
            )
        elif len(matches) > 1:
            resolved.append(
                ResolvedParticipant(
                    raw_name=raw,
                    user_id=None,
                    resolution="ambiguous",
                    candidates=[m["user_name"] for m in matches],
                )
            )
        else:
            resolved.append(ResolvedParticipant(raw_name=raw, user_id=None, resolution="unresolved"))

    return _dedupe_by_user_id(resolved)


def _dedupe_by_user_id(resolved: list[ResolvedParticipant]) -> list[ResolvedParticipant]:
    """Collapse duplicate mentions of the same real person into one entry.

    Only de-dupes entries with a resolved user_id — "unresolved"/"ambiguous"
    entries (user_id=None) are kept as-is, since collapsing those could hide
    a genuinely different unmatched person.
    """
    seen: set[str] = set()
    deduped: list[ResolvedParticipant] = []
    for p in resolved:
        if p.user_id is not None:
            if p.user_id in seen:
                continue
            seen.add(p.user_id)
        deduped.append(p)
    return deduped


def _name_matches(mentioned: str, real_name: str) -> bool:
    """First-name-or-exact match: "Aman" matches "Aman Sharma" and "aman"."""
    if mentioned == real_name:
        return True
    first_name = real_name.split(" ", 1)[0]
    return mentioned == first_name
