from __future__ import annotations

from fastapi import APIRouter, Query

from app.chains.insights import narrate_anomalies, narrate_summary
from app.chains.settle import narrate_group_insight
from app.routes.deps import BearerToken
from app.schemas.insights import AnomaliesResponse, BalancesResponse, InsightsSummary
from app.schemas.settle import GroupInsight, TopPayer
from app.services.balances import build_balances_response, compute_balances
from app.services.context import build_request_context
from app.services.insights import compute_summary, detect_anomalies, top_payer

router = APIRouter(tags=["insights"])


@router.get("/insights/summary", response_model=InsightsSummary)
async def insights_summary(token: BearerToken, days: int = Query(default=30, ge=1, le=365)):
    """Spending summary for the last N days. Numbers are computed in Python;
    the LLM only narrates them — it never does the arithmetic."""
    ctx = await build_request_context(token)
    client = ctx.client()
    expenses = await client.list_all_expenses()
    categories = await client.list_categories()
    groups = await client.list_groups()

    categories_by_id = {str(c["id"]): c["name"] for c in categories}
    groups_by_id = {str(g["id"]): g["name"] for g in groups}

    summary = compute_summary(
        expenses,
        categories_by_id=categories_by_id,
        groups_by_id=groups_by_id,
        days=days,
        currency=ctx.default_currency,
    )
    summary.narrative = await narrate_summary(summary.model_dump(exclude={"narrative"}))
    return summary


@router.get("/insights/anomalies", response_model=AnomaliesResponse)
async def insights_anomalies(token: BearerToken, days: int = Query(default=90, ge=1, le=365)):
    """Rule-based anomaly detection (z-score outliers, duplicate-looking
    charges) over the last N days. Not ML — computed, not guessed."""
    ctx = await build_request_context(token)
    client = ctx.client()
    expenses = await client.list_all_expenses()
    categories = await client.list_categories()
    categories_by_id = {str(c["id"]): c["name"] for c in categories}

    anomalies = detect_anomalies(expenses, categories_by_id=categories_by_id, days=days)
    narrative = await narrate_anomalies([a.model_dump() for a in anomalies])
    return AnomaliesResponse(anomalies=anomalies, narrative=narrative)


@router.get("/balances", response_model=BalancesResponse)
async def balances(token: BearerToken):
    """Who owes the user money, and who they owe — computed from expenses
    and settlements, since services/api has no balances endpoint of its own."""
    ctx = await build_request_context(token)
    client = ctx.client()
    expenses = await client.list_all_expenses()
    settlements = await client.list_all_settlements()
    groups = await client.list_groups()

    names_by_id: dict[str, str | None] = {}
    for group in groups:
        for member in group.get("members", []):
            names_by_id[str(member["user_id"])] = member.get("user_name")

    net = compute_balances(expenses, settlements, me_id=ctx.user_id)
    return build_balances_response(net, currency=ctx.default_currency, names_by_id=names_by_id)


@router.get("/insights/group/{group_id}", response_model=GroupInsight)
async def group_insight(
    group_id: str,
    token: BearerToken,
    days: int = Query(default=30, ge=1, le=365),
):
    """Spending insight for a single group: totals, top category, who has
    fronted the most. Numbers computed in Python; the LLM only narrates."""
    ctx = await build_request_context(token)
    client = ctx.client()
    group = await client.get_group(group_id)
    expenses = await client.list_all_expenses(group_id=group_id)
    categories = await client.list_categories()
    categories_by_id = {str(c["id"]): c["name"] for c in categories}
    currency = group.get("default_currency") or ctx.default_currency

    summary = compute_summary(
        expenses,
        categories_by_id=categories_by_id,
        groups_by_id={group_id: group.get("name")},
        days=days,
        currency=currency,
    )
    names = {str(m["user_id"]): m.get("user_name") or m.get("user_email") for m in group.get("members", [])}
    payer = top_payer(expenses, days=days)
    top = (
        TopPayer(user_id=payer[0], name=names.get(payer[0]), total=payer[1], is_me=payer[0] == ctx.user_id)
        if payer
        else None
    )
    top_cat = summary.by_category[0] if summary.by_category else None
    delta = summary.vs_previous_period.delta_pct

    insight = GroupInsight(
        group_id=group_id,
        group_name=group.get("name"),
        period_days=days,
        currency=currency,
        total_spent=summary.total_spent,
        expense_count=summary.expense_count,
        top_category=top_cat.category_name if top_cat else None,
        top_category_share_pct=(
            round(top_cat.total / summary.total_spent * 100, 1) if top_cat and summary.total_spent else None
        ),
        top_payer=top,
        delta_pct=round(delta, 1) if delta is not None else None,
        narrative="",
    )
    if summary.expense_count == 0:
        insight.narrative = f"No expenses in the last {days} days yet. Add one to see insights here."
    else:
        insight.narrative = await narrate_group_insight(insight.model_dump(exclude={"narrative"}))
    return insight
