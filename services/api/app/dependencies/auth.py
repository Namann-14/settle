import logging

from fastapi import Request, HTTPException
from clerk_backend_api import authenticate_request_async
from clerk_backend_api.security.types import AuthenticateRequestOptions

from app.core.config import settings

logger = logging.getLogger(__name__)


async def get_current_user(request: Request):
    try:
        request_state = await authenticate_request_async(
            request,
            AuthenticateRequestOptions(
                secret_key=settings.CLERK_SECRET_KEY,
            )
        )
    except Exception as e:
        logger.error("Clerk authentication error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Authentication service error") from e

    if not request_state.is_authenticated:
        raise HTTPException(status_code=401, detail=request_state.message or "Unauthorized")

    auth = request_state.to_auth()

    user_id = getattr(auth, "user_id", None) or getattr(auth, "sub", None)
    session_id = getattr(auth, "session_id", None) or getattr(auth, "sid", None)

    return {
        "user_id": user_id,
        "session_id": session_id,
    }

