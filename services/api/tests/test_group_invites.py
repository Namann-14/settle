import os
import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest

# Settings() requires these at import time; tests never touch the DB or Clerk.
os.environ.setdefault("CLERK_SECRET_KEY", "test")
os.environ.setdefault("CLERK_PUBLISHABLE_KEY", "test")
os.environ.setdefault("DATABASE_URL", "postgresql://u:p@localhost/test")

from app.controllers import group as gc  # noqa: E402
from app.controllers.exceptions import (  # noqa: E402
    ConflictError,
    GroupNotFoundError,
    PermissionDeniedError,
    ValidationError,
)
from app.db.enums import GroupRole, InvitationStatus  # noqa: E402

NOW = datetime.now(timezone.utc)


def _user(name, email, chat=None):
    return SimpleNamespace(id=uuid.uuid4(), name=name, email=email, telegram_chat_id=chat)


class FakeStore:
    """In-memory stand-in for the group, invitation and user repos."""

    def __init__(self, monkeypatch):
        self.users = []
        self.groups = {}
        self.invites = []
        self.sent = []

        repo = gc.group_repo
        monkeypatch.setattr(repo, "get_group_by_id", lambda db, gid: self.groups.get(gid))
        monkeypatch.setattr(repo, "add_group_member", self._add_member)
        monkeypatch.setattr(repo, "set_join_code", self._set_code)
        monkeypatch.setattr(
            repo,
            "get_group_by_join_code",
            lambda db, code: next((g for g in self.groups.values() if g.join_code == code), None),
        )
        monkeypatch.setattr(
            gc.user_repo,
            "get_user_by_email",
            lambda db, email: next((u for u in self.users if u.email.lower() == email.lower()), None),
        )
        inv = gc.invitation_repo
        monkeypatch.setattr(inv, "get_pending_invitation", self._pending)
        monkeypatch.setattr(inv, "create_invitation", self._create_invite)
        monkeypatch.setattr(
            inv, "get_invitation_by_id", lambda db, iid: next((i for i in self.invites if i.id == iid), None)
        )
        monkeypatch.setattr(inv, "list_pending_for_user", self._for_user)
        monkeypatch.setattr(inv, "set_status", self._set_status)
        monkeypatch.setattr(gc.tg, "is_configured", lambda: True)
        monkeypatch.setattr(gc.tg, "send_buttons", lambda chat, text, buttons: self.sent.append((chat, text, buttons)))
        monkeypatch.setattr(gc.tg, "send_text", lambda chat, text: self.sent.append((chat, text, None)))

    def user(self, name, email, chat=None):
        u = _user(name, email, chat)
        self.users.append(u)
        return u

    def group(self, admin, *members):
        g = SimpleNamespace(id=uuid.uuid4(), name="Hong Kong Trip", description=None, join_code=None, members=[])
        self.groups[g.id] = g
        self._add_member(None, SimpleNamespace(group_id=g.id, user_id=admin.id, role=GroupRole.ADMIN))
        for m in members:
            self._add_member(None, SimpleNamespace(group_id=g.id, user_id=m.id, role=GroupRole.MEMBER))
        return g

    def active_ids(self, g):
        return {m.user_id for m in g.members if m.removed_at is None}

    def _add_member(self, db, schema):
        g = self.groups[schema.group_id]
        m = SimpleNamespace(id=uuid.uuid4(), user_id=schema.user_id, role=schema.role, removed_at=None)
        g.members.append(m)
        return m

    def _set_code(self, db, group):
        group.join_code = uuid.uuid4().hex[:16]
        return group

    def _pending(self, db, group_id, email):
        return next(
            (
                i
                for i in self.invites
                if i.group_id == group_id and i.email == email.lower() and i.status == InvitationStatus.PENDING
            ),
            None,
        )

    def _create_invite(self, db, group_id, email, invited_by_id, invited_user_id=None):
        inviter = next(u for u in self.users if u.id == invited_by_id)
        i = SimpleNamespace(
            id=uuid.uuid4(),
            group_id=group_id,
            email=email.lower(),
            status=InvitationStatus.PENDING,
            expires_at=NOW + timedelta(days=30),
            invited_by_id=invited_by_id,
            invited_by=inviter,
            invited_user_id=invited_user_id,
            group_name=self.groups[group_id].name,
        )
        self.invites.append(i)
        return i

    def _for_user(self, db, user_id, email):
        return [
            i
            for i in self.invites
            if i.status == InvitationStatus.PENDING
            and i.expires_at > datetime.now(timezone.utc)
            and (i.invited_user_id == user_id or (email and i.email == email.lower()))
        ]

    def _set_status(self, db, invitation, status, invited_user_id=None, commit=True):
        invitation.status = status
        if invited_user_id is not None:
            invitation.invited_user_id = invited_user_id
        return invitation


@pytest.fixture
def store(monkeypatch):
    return FakeStore(monkeypatch)


def test_inviting_existing_user_does_not_add_them(store):
    naman = store.user("Naman", "naman@x.com")
    riya = store.user("Riya", "riya@x.com", chat=555)
    g = store.group(naman)

    invite = gc.invite_by_email(None, g.id, naman, "Riya@X.com")

    assert riya.id not in store.active_ids(g)
    assert invite.status == InvitationStatus.PENDING
    assert invite.invited_user_id == riya.id
    # Riya gets a Telegram message with Join / Decline buttons that fit in 64 bytes.
    chat, text, buttons = store.sent[0]
    assert chat == 555 and "Hong Kong Trip" in text
    assert [b[0][: len(gc.INVITE_ACCEPT_PREFIX)] for b in buttons] == [gc.INVITE_ACCEPT_PREFIX, gc.INVITE_DECLINE_PREFIX]
    assert all(len(b[0].encode()) <= 64 for b in buttons)


def test_invite_shows_in_inbox_and_accept_joins(store):
    naman = store.user("Naman", "naman@x.com", chat=111)
    riya = store.user("Riya", "riya@x.com")
    g = store.group(naman)
    invite = gc.invite_by_email(None, g.id, naman, "riya@x.com")

    assert [i.id for i in gc.list_my_invitations(None, riya)] == [invite.id]
    assert gc.list_my_invitations(None, naman) == []

    gc.respond_to_invitation(None, invite.id, riya, accept=True)
    assert riya.id in store.active_ids(g)
    assert invite.status == InvitationStatus.ACCEPTED
    assert [m.role for m in g.members if m.user_id == riya.id] == [GroupRole.MEMBER]
    assert gc.list_my_invitations(None, riya) == []
    assert any(chat == 111 and "joined" in text for chat, text, _ in store.sent)


def test_decline_does_not_join(store):
    naman = store.user("Naman", "naman@x.com")
    riya = store.user("Riya", "riya@x.com")
    g = store.group(naman)
    invite = gc.invite_by_email(None, g.id, naman, "riya@x.com")

    gc.respond_to_invitation(None, invite.id, riya, accept=False)
    assert riya.id not in store.active_ids(g)
    assert invite.status == InvitationStatus.DECLINED
    with pytest.raises(ConflictError):
        gc.respond_to_invitation(None, invite.id, riya, accept=True)
    # A declined invite can be re-sent.
    gc.invite_by_email(None, g.id, naman, "riya@x.com")


def test_invite_for_someone_without_an_account_matches_by_email(store):
    naman = store.user("Naman", "naman@x.com")
    g = store.group(naman)
    invite = gc.invite_by_email(None, g.id, naman, "new@x.com")
    assert invite.invited_user_id is None

    newbie = store.user("New", "NEW@x.com")  # signs up later
    assert [i.id for i in gc.list_my_invitations(None, newbie)] == [invite.id]
    gc.respond_to_invitation(None, invite.id, newbie, accept=True)
    assert newbie.id in store.active_ids(g)


def test_only_the_invitee_can_answer(store):
    naman = store.user("Naman", "naman@x.com")
    riya = store.user("Riya", "riya@x.com")
    eve = store.user("Eve", "eve@x.com")
    g = store.group(naman)
    invite = gc.invite_by_email(None, g.id, naman, "riya@x.com")
    with pytest.raises(GroupNotFoundError):
        gc.respond_to_invitation(None, invite.id, eve, accept=True)
    assert eve.id not in store.active_ids(g)
    assert riya.id not in store.active_ids(g)


def test_duplicate_and_member_invites_conflict(store):
    naman = store.user("Naman", "naman@x.com")
    riya = store.user("Riya", "riya@x.com")
    g = store.group(naman, riya)
    with pytest.raises(ConflictError, match="already in this group"):
        gc.invite_by_email(None, g.id, naman, "riya@x.com")
    gc.invite_by_email(None, g.id, naman, "aman@x.com")
    with pytest.raises(ConflictError, match="already pending"):
        gc.invite_by_email(None, g.id, riya, "AMAN@x.com")


def test_expired_pending_invite_is_replaced(store):
    naman = store.user("Naman", "naman@x.com")
    g = store.group(naman)
    old = gc.invite_by_email(None, g.id, naman, "aman@x.com")
    old.expires_at = NOW - timedelta(days=1)
    new = gc.invite_by_email(None, g.id, naman, "aman@x.com")
    assert old.status == InvitationStatus.EXPIRED and new.status == InvitationStatus.PENDING


def test_expired_invite_cannot_be_accepted(store):
    naman = store.user("Naman", "naman@x.com")
    riya = store.user("Riya", "riya@x.com")
    g = store.group(naman)
    invite = gc.invite_by_email(None, g.id, naman, "riya@x.com")
    invite.expires_at = NOW - timedelta(minutes=1)
    with pytest.raises(ValidationError, match="expired"):
        gc.respond_to_invitation(None, invite.id, riya, accept=True)
    assert riya.id not in store.active_ids(g)


def test_non_member_cannot_invite(store):
    naman = store.user("Naman", "naman@x.com")
    eve = store.user("Eve", "eve@x.com")
    g = store.group(naman)
    with pytest.raises(PermissionDeniedError):
        gc.invite_by_email(None, g.id, eve, "x@x.com")


def test_cancel_only_by_inviter_or_admin(store):
    admin = store.user("Admin", "admin@x.com")
    riya = store.user("Riya", "riya@x.com")
    aman = store.user("Aman", "aman@x.com")
    g = store.group(admin, riya, aman)
    invite = gc.invite_by_email(None, g.id, riya, "z@x.com")
    with pytest.raises(PermissionDeniedError):
        gc.cancel_invitation(None, g.id, invite.id, aman)
    gc.cancel_invitation(None, g.id, invite.id, admin)
    assert invite.status == InvitationStatus.CANCELLED


# ------------------------------------------------------------------ join link


def test_join_link_flow(store):
    naman = store.user("Naman", "naman@x.com")
    riya = store.user("Riya", "riya@x.com")
    g = store.group(naman)

    code = gc.get_join_code(None, g.id, naman)
    assert code and gc.get_join_code(None, g.id, naman) == code  # stable

    group, count, already = gc.preview_join(None, code, riya)
    assert (group.id, count, already) == (g.id, 1, False)

    gc.join_by_code(None, code, riya)
    assert riya.id in store.active_ids(g)
    assert gc.preview_join(None, code, riya)[2] is True

    # Joining twice is a no-op, not a duplicate member.
    gc.join_by_code(None, code, riya)
    assert len([m for m in g.members if m.user_id == riya.id]) == 1


def test_join_link_answers_pending_invite(store):
    naman = store.user("Naman", "naman@x.com")
    riya = store.user("Riya", "riya@x.com")
    g = store.group(naman)
    invite = gc.invite_by_email(None, g.id, naman, "riya@x.com")
    gc.join_by_code(None, gc.get_join_code(None, g.id, naman), riya)
    assert invite.status == InvitationStatus.ACCEPTED


def test_reset_join_link_admin_only_and_kills_old_code(store):
    naman = store.user("Naman", "naman@x.com")
    riya = store.user("Riya", "riya@x.com")
    eve = store.user("Eve", "eve@x.com")
    g = store.group(naman, riya)
    old = gc.get_join_code(None, g.id, riya)  # any member can share
    with pytest.raises(PermissionDeniedError):
        gc.reset_join_code(None, g.id, riya)
    new = gc.reset_join_code(None, g.id, naman)
    assert new != old
    with pytest.raises(GroupNotFoundError):
        gc.join_by_code(None, old, eve)


def test_outsider_cannot_get_join_link(store):
    naman = store.user("Naman", "naman@x.com")
    eve = store.user("Eve", "eve@x.com")
    g = store.group(naman)
    with pytest.raises(PermissionDeniedError):
        gc.get_join_code(None, g.id, eve)
