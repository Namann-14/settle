# services/api/app/controllers/exceptions.py

**Purpose:** Domain exception hierarchy raised by controllers.

**Key contents:** `ControllerError` base; `NotFoundError` with User/Expense/Group/Settlement/Category subclasses; `PermissionDeniedError`, `ValidationError`, `ConflictError`.

**Depends on / used by:** Every controller; the route layer translates them to 404/403/422/409 responses.

**Decisions & caveats:** Keeps controllers HTTP-agnostic so the Telegram flow can reuse them. Note `ValidationError` here is not Pydantic's.
