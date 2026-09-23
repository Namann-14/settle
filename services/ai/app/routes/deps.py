from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status


def require_bearer_token(authorization: Annotated[str | None, Header()] = None) -> str:
    """Extract the raw bearer token from the Authorization header.

    Does NOT verify the token locally — services/ai has no Clerk secret of its
    own. Every route that uses this ends up calling services/api at least once
    (build_request_context calls /users/me first), and api's existing Clerk
    verification + per-resource permission checks reject a bad token there.
    This dependency only fails fast on an obviously malformed header, so we
    don't burn an HTTP round-trip on requests with no token at all.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Empty bearer token")
    return token


BearerToken = Annotated[str, Depends(require_bearer_token)]
