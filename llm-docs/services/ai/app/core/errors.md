# services/ai/app/core/errors.py

**Purpose:** Exception types for the AI service, mapped to HTTP responses in main.py.

**Key contents:** `AiServiceError` base; `ApiError` (upstream services/api failure with status code), `CapabilityUnavailable` (feature intentionally not configured, with reason and remedy), `OcrError` (provider failure).

**Depends on / used by:** Handlers in main.py; raised by services/api_client, llm/vision.

**Decisions & caveats:** ApiError status codes are re-emitted unchanged so a 401 from api is a 401 from ai. CapabilityUnavailable -> 501, OcrError -> 502.
