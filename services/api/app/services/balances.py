from __future__ import annotations

from collections import defaultdict
from decimal import Decimal
from uuid import UUID

from app.models.expense import Expense
from app.models.settlement import Settlement

CENT = Decimal("0.01")


def compute_group_nets(
    expenses: list[Expense],
    settlements: list[Settlement],
) -> dict[UUID, Decimal]:
    """
    Net position of every user in a group. Positive means the group owes
    them money, negative means they owe the group.
    """
    nets: dict[UUID, Decimal] = defaultdict(lambda: Decimal("0.00"))

    for expense in expenses:
        if expense.deleted_at is not None:
            continue
        nets[expense.paid_by_id] += expense.amount
        for split in expense.splits:
            nets[split.user_id] -= split.amount_owed

    for settlement in settlements:
        # Paying clears debt (net goes up); receiving clears credit (net goes down).
        nets[settlement.paid_by_id] += settlement.amount
        nets[settlement.received_by_id] -= settlement.amount

    return {user_id: net.quantize(CENT) for user_id, net in nets.items()}


def simplify_debts(nets: dict[UUID, Decimal]) -> list[tuple[UUID, UUID, Decimal]]:
    """
    Greedy minimum-cash-flow: repeatedly match the largest debtor with the
    largest creditor. Returns (from_user_id, to_user_id, amount) transfers,
    at most n-1 of them.
    """
    creditors = sorted(
        ([uid, amt] for uid, amt in nets.items() if amt >= CENT),
        key=lambda x: x[1],
        reverse=True,
    )
    debtors = sorted(
        ([uid, -amt] for uid, amt in nets.items() if amt <= -CENT),
        key=lambda x: x[1],
        reverse=True,
    )

    transfers: list[tuple[UUID, UUID, Decimal]] = []
    i = j = 0
    while i < len(debtors) and j < len(creditors):
        debtor, creditor = debtors[i], creditors[j]
        amount = min(debtor[1], creditor[1])
        if amount >= CENT:
            transfers.append((debtor[0], creditor[0], amount.quantize(CENT)))
        debtor[1] -= amount
        creditor[1] -= amount
        if debtor[1] < CENT:
            i += 1
        if creditor[1] < CENT:
            j += 1

    return transfers
