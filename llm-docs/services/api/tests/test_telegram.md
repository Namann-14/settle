# services/api/tests/test_telegram.py

**Purpose:** Unit tests for the Telegram bot logic.

**Key contents:** Covers secret verification, command parsing and aliases, link-code generation/parsing, deep links, extraction routing (save vs draft), category picking, money formatting, HTML escaping, update parsing, and duplicate/unlinked handling.

**Depends on / used by:** Tests `controllers/telegram.py`, `schemas/telegram.py`, `services/telegram.py`.

**Decisions & caveats:** Sets dummy env vars before imports because `Settings()` is required at import time. No real DB or network; repository and send functions are monkeypatched.
