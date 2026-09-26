from datetime import date

from app.db.enums import Frequency
from app.services.recurrence import next_date


def test_daily_and_weekly_steps():
    assert next_date(date(2026, 9, 30), Frequency.DAILY) == date(2026, 10, 1)
    assert next_date(date(2026, 9, 27), Frequency.DAILY, 3) == date(2026, 9, 30)
    assert next_date(date(2026, 12, 28), Frequency.WEEKLY) == date(2027, 1, 4)
    assert next_date(date(2026, 9, 1), Frequency.WEEKLY, 2) == date(2026, 9, 15)


def test_monthly_clamps_to_month_end_and_recovers():
    feb = next_date(date(2026, 1, 31), Frequency.MONTHLY, anchor_day=31)
    assert feb == date(2026, 2, 28)
    # Anchored to the 31st, so March goes back to the 31st instead of the 28th.
    assert next_date(feb, Frequency.MONTHLY, anchor_day=31) == date(2026, 3, 31)


def test_monthly_leap_year_and_interval():
    assert next_date(date(2028, 1, 30), Frequency.MONTHLY, anchor_day=30) == date(2028, 2, 29)
    assert next_date(date(2026, 11, 15), Frequency.MONTHLY, 3) == date(2027, 2, 15)


def test_yearly_from_leap_day():
    assert next_date(date(2028, 2, 29), Frequency.YEARLY, anchor_day=29) == date(2029, 2, 28)
    assert next_date(date(2029, 2, 28), Frequency.YEARLY, 3, anchor_day=29) == date(2032, 2, 29)
