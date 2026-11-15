# services/ai/evals/conftest.py

**Purpose:** Shared pytest fixtures for the offline eval suites.

**Key contents:** Session autouse fixture that skips everything when `GROQ_API_KEY` is unset; `arun` fixture that runs coroutines on one shared event loop.

**Depends on / used by:** `app.core.config.settings`. Used by every `test_*.py` in `evals/`.

**Decisions & caveats:** One loop for the whole session on purpose: the extraction chains are module-level singletons whose async Groq client binds to the first loop it runs on, so `asyncio.run()` per test breaks from the second test on. Sync tests plus this fixture avoid adding pytest-asyncio.
