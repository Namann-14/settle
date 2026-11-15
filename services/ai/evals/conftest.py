import asyncio

import pytest

from app.core.config import settings


@pytest.fixture(scope="session", autouse=True)
def _require_groq():
    if not settings.groq_api_key:
        pytest.skip("GROQ_API_KEY not set; offline evals call the real model")


@pytest.fixture(scope="session")
def arun():
    """Run a coroutine on one loop shared by the whole session.

    The extraction chains are module-level singletons whose async Groq client
    binds to the first loop it runs on, so a fresh asyncio.run() per test
    would fail from the second test on.
    """
    loop = asyncio.new_event_loop()
    yield loop.run_until_complete
    loop.close()
