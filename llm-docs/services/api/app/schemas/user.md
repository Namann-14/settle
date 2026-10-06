# services/api/app/schemas/user.py

**Purpose:** Pydantic schemas for users.

**Key contents:** `UserCreate`, `UserUpdate`, `UserResponse` (includes `telegram_linked` and `telegram_username`).

**Depends on / used by:** Used by `routes/users.py`, `repositories/user.py`.

**Decisions & caveats:** `telegram_linked` is a computed property on the ORM model. Telegram chat id and link code are not exposed.
