from __future__ import annotations

from collections import defaultdict
from decimal import Decimal

from app.schemas.insights import Balance, BalancesResponse

# NOTE: this assumes all expenses/settlements share one currency (the user's
# default_currency). services/api has no cross-currency conversion wired up
# for balances yet, so mixed-currency ledgers will under/overstate net
# amounts. Flagged as a known limitation, not silently handled.


def compute_balances(
    expenses: list[dict],
    settlements: list[dict],
    *,
    me_id: str,
) -> dict[str, Decimal]:
    """Net balance per counterparty.

    net[X] > 0  => X owes me
    net[X] < 0  => I owe X

    Uses Decimal throughout — float arithmetic here would produce cent-level
    discrepancies that destroy user trust in the numbers.
    """
    net: dict[str, Decimal] = defaultdict(Decimal)

    for expense in expenses:
        if expense.get("deleted_at"):
            continue
        paid_by_id = str(expense["paid_by_id"])
        for split in expense.get("splits", []):
            split_user_id = str(split["user_id"])
            amount_owed = Decimal(str(split["amount_owed"]))
            if split_user_id == me_id:
                continue
            if paid_by_id == me_id:
                # they owe me their share
                net[split_user_id] += amount_owed
            elif split_user_id == paid_by_id:
                # not possible (payer doesn't owe themselves) — skip
                continue

        # my own share, when someone else paid
        if paid_by_id != me_id:
            my_split = next(
                (s for s in expense.get("splits", []) if str(s["user_id"]) == me_id), None
            )
            if my_split is not None:
                net[paid_by_id] -= Decimal(str(my_split["amount_owed"]))

    for settlement in settlements:
        amount = Decimal(str(settlement["amount"]))
        paid_by_id = str(settlement["paid_by_id"])
        received_by_id = str(settlement["received_by_id"])
        if paid_by_id == me_id:
            net[received_by_id] += amount
        elif received_by_id == me_id:
            net[paid_by_id] -= amount

    return {k: v for k, v in net.items() if v != 0}


def build_balances_response(
    net: dict[str, Decimal],
    *,
    currency: str,
    names_by_id: dict[str, str | None] | None = None,
) -> BalancesResponse:
    names_by_id = names_by_id or {}
    balances = [
        Balance(
            counterparty_id=counterparty_id,
            counterparty_name=names_by_id.get(counterparty_id),
            net_amount=abs(float(amount)),
            direction="owes_you" if amount > 0 else "you_owe",
        )
        for counterparty_id, amount in sorted(net.items(), key=lambda kv: -abs(kv[1]))
    ]
    return BalancesResponse(
        currency=currency,
        balances=balances,
        net_total=float(sum(net.values())),
    )
