from clerk_backend_api import Clerk

from app.core.config import settings

clerk_client = Clerk(
    bearer_auth=settings.CLERK_SECRET_KEY
)

async def get_clerk_user(user_id: str):
    return await clerk_client.users.get_async(user_id=user_id)

def fetch_clerk_profile(user_id: str) -> tuple[str | None, str | None]:
    """
    Primary email and display name for a Clerk user. Returns (None, None) if
    Clerk can't be reached, so auth never fails just because profile sync did.
    """
    try:
        user = clerk_client.users.get(user_id=user_id)
    except Exception:
        return None, None

    email = None
    for address in user.email_addresses or []:
        if address.id == user.primary_email_address_id or email is None:
            email = address.email_address
    name = " ".join(p for p in (user.first_name, user.last_name) if p) or user.username or None
    return email, name
