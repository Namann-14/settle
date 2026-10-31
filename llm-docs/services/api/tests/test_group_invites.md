# services/api/tests/test_group_invites.py

**Purpose:** Unit tests for consent-based group invites and join links.

**Key contents:** Inviting an existing user doesn't add them; accept joins, decline doesn't; email-only invitees match by email; only the invitee can answer; duplicate/member invites conflict; expired pending invites are replaced and can't be accepted; non-members can't invite; cancel is inviter-or-admin only; join link flow, joining answers a pending invite, admin-only reset kills the old code, outsiders can't fetch the link.

**Depends on / used by:** Tests `app/controllers/group.py` through `FakeStore`, an in-memory stand-in monkeypatched over the group, invitation and user repos.

**Decisions & caveats:** No DB or Clerk: dummy env vars are set before import only for `Settings()`. Fake users have no `telegram_chat_id` by default, so Telegram notifications are skipped.
