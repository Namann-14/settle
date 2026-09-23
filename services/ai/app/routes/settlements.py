from __future__ import annotations

import asyncio

from fastapi import APIRouter

from app.chains.settle import write_plan_copy
from app.routes.deps import BearerToken
from app.schemas.settle import PlannedTransfer, SettlePlan, SettlePlanRequest
from app.services.context import build_request_context

router = APIRouter(prefix="/settlements", tags=["settlements"])

_SYMBOLS = {"INR": "₹", "USD": "$", "EUR": "€", "GBP": "£", "JPY": "¥"}


def _money(amount: float, currency: str) -> str:
    symbol = _SYMBOLS.get(currency.upper())
    value = f"{amount:,.2f}".removesuffix(".00")
    return f"{symbol}{value}" if symbol else f"{value} {currency}"


def _first(name: str | None) -> str | None:
    return name.split()[0] if name else None


@router.post("/plan", response_model=SettlePlan)
async def settle_plan(body: SettlePlanRequest, token: BearerToken):
    """The fewest payments that settle the user's groups, plus a headline and
    ready-to-send reminder messages.

    Transfers come straight from services/api's /groups/{id}/balances (debt
    simplification is done there, in Decimal). The LLM only writes the copy
    around those numbers; if it fails the plan still returns with plain text.
    """
    ctx = await build_request_context(token)
    client = ctx.client()

    if body.group_id:
        groups = [await client.get_group(body.group_id)]
    else:
        groups = await client.list_groups()

    balances = await asyncio.gather(*(client.get_group_balances(str(g["id"])) for g in groups))

    transfers: list[PlannedTransfer] = []
    for group, bal in zip(groups, balances):
        names = {str(m["user_id"]): m.get("user_name") or m.get("user_email") for m in bal["members"]}
        for t in bal["transfers"]:
            src, dst = str(t["from_user_id"]), str(t["to_user_id"])
            if dst == ctx.user_id:
                direction = "incoming"
            elif src == ctx.user_id:
                direction = "outgoing"
            elif body.group_id:
                direction = "others"
            else:
                continue  # across all groups, only the user's own payments matter
            transfers.append(
                PlannedTransfer(
                    index=0,
                    group_id=str(group["id"]),
                    group_name=group.get("name"),
                    currency=bal["currency"],
                    from_user_id=src,
                    from_name=names.get(src),
                    to_user_id=dst,
                    to_name=names.get(dst),
                    amount=float(t["amount"]),
                    direction=direction,
                )
            )

    if not transfers:
        return SettlePlan(headline="You're all settled up. Nobody owes anything.", transfers=[])

    # Biggest amounts first, so the headline's "do this first" matches the list.
    transfers.sort(key=lambda t: (t.direction == "others", -t.amount))
    for i, t in enumerate(transfers):
        t.index = i

    payload = {
        "user_first_name": _first(ctx.user_name),
        "payments": [
            {
                "index": t.index,
                "group": t.group_name,
                "from": "you" if t.direction == "outgoing" else _first(t.from_name),
                "to": "you" if t.direction == "incoming" else _first(t.to_name),
                "amount_display": _money(t.amount, t.currency),
                "direction": t.direction,
            }
            for t in transfers
        ],
    }
    headline, reminders = await write_plan_copy(payload)

    for t in transfers:
        if t.direction != "incoming":
            continue
        t.reminder = reminders.get(t.index) or (
            f"Hey {_first(t.from_name) or 'there'}! Squaring up {t.group_name or 'our expenses'} "
            f"on Settle: you owe me {_money(t.amount, t.currency)}. Pay whenever you get a chance."
        )

    count = len(transfers)
    return SettlePlan(
        headline=headline or f"{count} payment{'s' if count != 1 else ''} will settle everything.",
        transfers=transfers,
    )
