from clerk_backend_api import Clerk

from app.core.config import settings

clerk_client = Clerk(
    bearer_auth=settings.CLERK_SECRET_KEY
)

async def get_clerk_user(user_id: str):
    return await clerk_client.users.get_async(user_id=user_id)