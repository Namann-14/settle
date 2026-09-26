from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.controllers import spending as spending_controller
from app.dependencies.database import get_db
from app.models.user import User
from app.routes import get_current_db_user, handle_controller_errors
from app.schemas.spending import SpendingSummary

router = APIRouter(
    prefix="/spending",
    tags=["spending"],
)


@router.get("/summary", response_model=SpendingSummary)
def get_summary(
    month: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}$", description="YYYY-MM, defaults to this month"),
    trend_months: int = Query(default=6, ge=1, le=24),
    current_user: User = Depends(get_current_db_user),
    db: Session = Depends(get_db),
):
    """
    The user's spending for a month: their share of personal and group
    expenses, by category and day, against their budgets, plus income.
    """
    with handle_controller_errors():
        return spending_controller.get_summary(db, current_user, month, trend_months)
