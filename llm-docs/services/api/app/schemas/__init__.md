# services/api/app/schemas/__init__.py

**Purpose:** Package init re-exporting the core Pydantic schemas.

**Key contents:** Re-exports create/update/response schemas for user, category, expense, expense split, group, group member and settlement.

**Depends on / used by:** Imported by repositories and controllers.

**Decisions & caveats:** Does not include budget, income, invitation, recurring, spending, balances or telegram schemas; import those from their modules.
