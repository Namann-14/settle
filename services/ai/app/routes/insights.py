from __future__ import annotations

from fastapi import APIRouter, Query

from app.chains.insights import narrate_anomalies, narrate_summary
from app.routes.deps import BearerToken
from app.schemas.insights import AnomaliesResponse, BalancesResponse, InsightsSummary
from app.services.balances import build_balances_response, compute_balances
from app.services.context import build_request_context
from app.services.insights import compute_summary, detect_anomalies

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
