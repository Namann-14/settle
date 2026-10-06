# services/api/app/models/exchange_rate.py

**Purpose:** ORM model for daily currency exchange rates.

**Key contents:** `ExchangeRate` with base/quote currency, `rate` Numeric(18,8) and `as_of_date`, unique per (base, quote, day).

**Depends on / used by:** No readers yet.

**Decisions & caveats:** Currently unused: there is no exchange-rate source, so spending totals never convert currencies and report other currencies separately (decisions.md).
