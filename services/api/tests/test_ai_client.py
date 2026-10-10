import os

import pytest

# Settings() requires these at import time; tests never touch the DB or Clerk.
os.environ.setdefault("CLERK_SECRET_KEY", "test")
os.environ.setdefault("CLERK_PUBLISHABLE_KEY", "test")
os.environ.setdefault("DATABASE_URL", "postgresql://u:p@localhost/test")

from app.core.config import settings  # noqa: E402
from app.services import ai_client  # noqa: E402


@pytest.mark.parametrize(
    ("base", "prefix", "expected"),
    [
        ("http://localhost:8001", "", "http://localhost:8001/internal/extract/text"),
        ("https://x.vercel.app", "/ai", "https://x.vercel.app/ai/internal/extract/text"),
        ("https://x.vercel.app/ai", "/ai", "https://x.vercel.app/ai/internal/extract/text"),
        ("https://x.vercel.app/ai/", "/ai", "https://x.vercel.app/ai/internal/extract/text"),
    ],
)
def test_url_does_not_double_the_route_prefix(monkeypatch, base, prefix, expected):
    monkeypatch.setattr(settings, "AI_SERVICE_URL", base)
    monkeypatch.setattr(settings, "AI_ROUTE_PREFIX", prefix)
    assert ai_client._url("/internal/extract/text") == expected
