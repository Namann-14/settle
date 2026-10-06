# services/api/app/routes/users.py

**Purpose:** HTTP routes for the current user's profile and Telegram linking.

**Key contents:** `GET/PATCH /users/me`, `POST /users/me/telegram/link-code`, `DELETE /users/me/telegram`.

**Depends on / used by:** Delegates to `controllers/user.py` and `controllers/telegram.py`; schemas in `schemas/user.py`, `schemas/telegram.py`.

**Decisions & caveats:** The link code flow returns a short-lived code plus a t.me deep link; tapping Start sends `/start <code>` to the bot.
