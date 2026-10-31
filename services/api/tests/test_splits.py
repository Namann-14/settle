import os
import uuid
from decimal import Decimal
from types import SimpleNamespace

import pytest

# Settings() requires these at import time; tests never touch the DB or Clerk.
os.environ.setdefault("CLERK_SECRET_KEY", "test")
os.environ.setdefault("CLERK_PUBLISHABLE_KEY", "test")
os.environ.setdefault("DATABASE_URL", "postgresql://u:p@localhost/test")

from app.controllers import expense as ec  # noqa: E402
from app.controllers.exceptions import PermissionDeniedError, ValidationError  # noqa: E402
from app.db.enums import SplitType  # noqa: E402
from app.schemas.expense import ExpenseCreate, ExpenseUpdate  # noqa: E402
from app.schemas.expense_split import ExpenseSplitCreate  # noqa: E402

A, B, C, D = (uuid.uuid4() for _ in range(4))
D_ = Decimal


def _splits(*rows):
    """rows: (user_id, amount_owed) or (user_id, amount_owed, percentage)"""
    return [
        ExpenseSplitCreate(user_id=r[0], amount_owed=D_(r[1]), percentage=D_(r[2]) if len(r) > 2 else None)
        for r in rows
    ]


def _owed(splits):
    return [s.amount_owed for s in splits]


# ------------------------------------------------------------------ allocate


@pytest.mark.parametrize(
    "amount,weights",
    [
        ("100.00", [1, 1, 1]),
        ("0.01", [1, 1, 1]),
        ("0.02", [1, 1, 1]),
        ("1000.00", [1, 1, 1, 1, 1, 1, 1]),
        ("99.99", [1, 1]),
        ("150000.00", [1, 1]),
        ("100.00", ["33.33", "33.33", "33.34"]),
        ("10.00", ["12.5", "37.5", "50"]),
    ],
)
def test_allocate_always_sums_to_amount(amount, weights):
    parts = ec._allocate(D_(amount), [D_(w) for w in weights])
    assert sum(parts) == D_(amount)
    assert all(p >= 0 and p == p.quantize(D_("0.01")) for p in parts)
    assert max(parts) - min(parts) <= D_(amount)  # sanity


def test_allocate_equal_spreads_cents_to_earliest():
    assert ec._allocate(D_("100.00"), [D_(1)] * 3) == [D_("33.34"), D_("33.33"), D_("33.33")]
    assert ec._allocate(D_("0.05"), [D_(1)] * 3) == [D_("0.02"), D_("0.02"), D_("0.01")]


# ------------------------------------------------------------------ EQUAL


def test_equal_ignores_client_amounts():
    # Used to be accepted as "EQUAL" because the total matched within 0.05.
    splits = _splits((A, "90"), (B, "10"))
    ec._validate_splits(D_("100.00"), SplitType.EQUAL, splits)
    assert _owed(splits) == [D_("50.00"), D_("50.00")]


def test_equal_subset_of_members():
    splits = _splits((A, 0), (C, 0))
    ec._validate_splits(D_("75.00"), SplitType.EQUAL, splits)
    assert _owed(splits) == [D_("37.50"), D_("37.50")]


def test_equal_single_person():
    splits = _splits((B, 0))
    ec._validate_splits(D_("150000.00"), SplitType.EQUAL, splits)
    assert _owed(splits) == [D_("150000.00")]


def test_equal_clears_percentages():
    splits = _splits((A, 0, 60), (B, 0, 40))
    ec._validate_splits(D_("10.00"), SplitType.EQUAL, splits)
    assert all(s.percentage is None for s in splits)


# ------------------------------------------------------------------ PERCENTAGE


def test_percentage_thirds_do_not_lose_a_cent():
    splits = _splits((A, 0, "33.33"), (B, 0, "33.33"), (C, 0, "33.34"))
    ec._validate_splits(D_("100.00"), SplitType.PERCENTAGE, splits)
    assert sum(_owed(splits)) == D_("100.00")
    assert _owed(splits) == [D_("33.33"), D_("33.33"), D_("33.34")]


def test_percentage_rounding_remainder_reconciled():
    # 3 x 33.33% passes the 0.01 tolerance; amounts must still add up.
    splits = _splits((A, 0, "33.33"), (B, 0, "33.33"), (C, 0, "33.33"))
    ec._validate_splits(D_("100.00"), SplitType.PERCENTAGE, splits)
    assert sum(_owed(splits)) == D_("100.00")


def test_percentage_overrides_wrong_client_amounts():
    splits = _splits((A, "1", 70), (B, "1", 30))
    ec._validate_splits(D_("200.00"), SplitType.PERCENTAGE, splits)
    assert _owed(splits) == [D_("140.00"), D_("60.00")]


@pytest.mark.parametrize("pcts", [(50, 40), (60, 60), (100, 1)])
def test_percentage_must_total_100(pcts):
    splits = _splits(*((uid, 0, p) for uid, p in zip((A, B), pcts)))
    with pytest.raises(ValidationError, match="100%"):
        ec._validate_splits(D_("100.00"), SplitType.PERCENTAGE, splits)


def test_percentage_requires_every_row():
    splits = _splits((A, 0, 100), (B, 0))
    with pytest.raises(ValidationError, match="needs a percentage"):
        ec._validate_splits(D_("100.00"), SplitType.PERCENTAGE, splits)


# ------------------------------------------------------------------ UNEQUAL


def test_unequal_exact_amounts_kept():
    splits = _splits((A, "12.50"), (B, "87.50"))
    ec._validate_splits(D_("100.00"), SplitType.UNEQUAL, splits)
    assert _owed(splits) == [D_("12.50"), D_("87.50")]


def test_unequal_zero_for_someone_is_fine():
    splits = _splits((A, "0"), (B, "100"))
    ec._validate_splits(D_("100.00"), SplitType.UNEQUAL, splits)
    assert sum(_owed(splits)) == D_("100.00")


@pytest.mark.parametrize("rows", [(("A", "50"), ("B", "49.99")), (("A", "50"), ("B", "50.01"))])
def test_unequal_off_by_a_cent_is_rejected(rows):
    ids = {"A": A, "B": B}
    splits = _splits(*((ids[u], amt) for u, amt in rows))
    with pytest.raises(ValidationError, match="must equal"):
        ec._validate_splits(D_("100.00"), SplitType.UNEQUAL, splits)


# ------------------------------------------------------------------ shared rules


@pytest.mark.parametrize("split_type", list(SplitType))
def test_duplicate_people_rejected(split_type):
    splits = _splits((A, "50", 50), (A, "50", 50))
    with pytest.raises(ValidationError, match="only once"):
        ec._validate_splits(D_("100.00"), split_type, splits)


@pytest.mark.parametrize("split_type", list(SplitType))
def test_empty_splits_rejected(split_type):
    with pytest.raises(ValidationError):
        ec._validate_splits(D_("100.00"), split_type, [])


# ------------------------------------------------------------------ create / update wiring


class _FakeRepos:
    """Patches the group and expense repos used by the expense controller."""

    def __init__(self, monkeypatch, members, expense=None):
        self.created = None
        self.updated = None
        group = SimpleNamespace(id=uuid.uuid4())
        self.group_id = group.id
        monkeypatch.setattr(ec.group_repo, "get_group_by_id", lambda db, gid: group if gid == group.id else None)
        monkeypatch.setattr(
            ec.group_repo, "get_group_members", lambda db, gid: [SimpleNamespace(user_id=u) for u in members]
        )
        monkeypatch.setattr(ec.expense_repo, "create_expense", self._create)
        monkeypatch.setattr(ec.expense_repo, "get_expense_by_id", lambda db, eid: expense)
        monkeypatch.setattr(ec.expense_repo, "update_expense", self._update)

    def _create(self, db, schema):
        self.created = schema
        return schema

    def _update(self, db, expense, schema):
        self.updated = schema
        return schema


def _create(group_id, amount, split_type, splits, paid_by=A):
    return ExpenseCreate(
        description="Dinner",
        amount=D_(amount),
        date="2026-10-31",
        split_type=split_type,
        group_id=group_id,
        paid_by_id=paid_by,
        splits=splits,
    )


def test_group_expense_all_members_equal(monkeypatch):
    repos = _FakeRepos(monkeypatch, [A, B, C, D])
    schema = _create(repos.group_id, "1000", SplitType.EQUAL, _splits((A, 0), (B, 0), (C, 0), (D, 0)))
    ec.create_expense(None, SimpleNamespace(id=A), schema)
    assert _owed(repos.created.splits) == [D_("250.00")] * 4


def test_group_expense_payer_not_in_split(monkeypatch):
    repos = _FakeRepos(monkeypatch, [A, B, C])
    schema = _create(repos.group_id, "90", SplitType.EQUAL, _splits((B, 0), (C, 0)), paid_by=A)
    ec.create_expense(None, SimpleNamespace(id=A), schema)
    assert [s.user_id for s in repos.created.splits] == [B, C]


def test_group_expense_rejects_non_member_in_split(monkeypatch):
    repos = _FakeRepos(monkeypatch, [A, B])
    schema = _create(repos.group_id, "90", SplitType.EQUAL, _splits((A, 0), (C, 0)))
    with pytest.raises(ValidationError, match="not a member"):
        ec.create_expense(None, SimpleNamespace(id=A), schema)


def test_group_expense_rejects_non_member_payer(monkeypatch):
    repos = _FakeRepos(monkeypatch, [A, B])
    schema = _create(repos.group_id, "90", SplitType.EQUAL, _splits((A, 0), (B, 0)), paid_by=C)
    with pytest.raises(ValidationError, match="Payer"):
        ec.create_expense(None, SimpleNamespace(id=A), schema)


def test_group_expense_rejects_outsider_caller(monkeypatch):
    repos = _FakeRepos(monkeypatch, [A, B])
    schema = _create(repos.group_id, "90", SplitType.EQUAL, _splits((A, 0), (B, 0)))
    with pytest.raises(PermissionDeniedError):
        ec.create_expense(None, SimpleNamespace(id=C), schema)


def test_amount_rounded_to_cents(monkeypatch):
    repos = _FakeRepos(monkeypatch, [A, B])
    schema = _create(repos.group_id, "100.005", SplitType.EQUAL, _splits((A, 0), (B, 0)))
    ec.create_expense(None, SimpleNamespace(id=A), schema)
    assert repos.created.amount == D_("100.01")
    assert sum(_owed(repos.created.splits)) == D_("100.01")


def test_personal_expense_cannot_include_others(monkeypatch):
    _FakeRepos(monkeypatch, [])
    schema = _create(None, "50", SplitType.UNEQUAL, _splits((A, "25"), (B, "25")))
    with pytest.raises(ValidationError, match="group"):
        ec.create_expense(None, SimpleNamespace(id=A), schema)


def test_personal_expense_default_split(monkeypatch):
    repos = _FakeRepos(monkeypatch, [])
    schema = _create(None, "50", SplitType.EQUAL, [])
    ec.create_expense(None, SimpleNamespace(id=A), schema)
    assert [(s.user_id, s.amount_owed) for s in repos.created.splits] == [(A, D_("50.00"))]


def _existing_expense(group_id, amount, split_type, splits, paid_by=A):
    return SimpleNamespace(
        id=uuid.uuid4(),
        created_by_id=A,
        group_id=group_id,
        paid_by_id=paid_by,
        amount=D_(amount),
        split_type=split_type,
        splits=[SimpleNamespace(user_id=s.user_id, amount_owed=s.amount_owed, percentage=s.percentage) for s in splits],
    )


def test_update_amount_resplits_existing_people(monkeypatch):
    repos = _FakeRepos(monkeypatch, [A, B, C])
    expense = _existing_expense(repos.group_id, "90", SplitType.EQUAL, _splits((A, 30), (B, 30), (C, 30)))
    monkeypatch.setattr(ec.expense_repo, "get_expense_by_id", lambda db, eid: expense)
    ec.update_expense(None, expense.id, SimpleNamespace(id=A), ExpenseUpdate(amount=D_("100")))
    assert _owed(repos.updated.splits) == [D_("33.34"), D_("33.33"), D_("33.33")]


def test_update_unequal_amount_without_new_splits_is_rejected(monkeypatch):
    repos = _FakeRepos(monkeypatch, [A, B])
    expense = _existing_expense(repos.group_id, "100", SplitType.UNEQUAL, _splits((A, 40), (B, 60)))
    monkeypatch.setattr(ec.expense_repo, "get_expense_by_id", lambda db, eid: expense)
    with pytest.raises(ValidationError, match="must equal"):
        ec.update_expense(None, expense.id, SimpleNamespace(id=A), ExpenseUpdate(amount=D_("120")))


def test_update_rejects_non_member_split(monkeypatch):
    repos = _FakeRepos(monkeypatch, [A, B])
    expense = _existing_expense(repos.group_id, "100", SplitType.EQUAL, _splits((A, 50), (B, 50)))
    monkeypatch.setattr(ec.expense_repo, "get_expense_by_id", lambda db, eid: expense)
    with pytest.raises(ValidationError, match="not a member"):
        ec.update_expense(
            None, expense.id, SimpleNamespace(id=A), ExpenseUpdate(splits=_splits((A, 50), (D, 50)))
        )


def test_update_into_foreign_group_rejected(monkeypatch):
    repos = _FakeRepos(monkeypatch, [B, C])  # caller A isn't in this group
    expense = _existing_expense(None, "100", SplitType.EQUAL, _splits((A, 100)))
    monkeypatch.setattr(ec.expense_repo, "get_expense_by_id", lambda db, eid: expense)
    with pytest.raises((PermissionDeniedError, ValidationError)):
        ec.update_expense(None, expense.id, SimpleNamespace(id=A), ExpenseUpdate(group_id=repos.group_id))
