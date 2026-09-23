from __future__ import annotations


class AiServiceError(Exception):
    """Base class for errors raised by this service."""


class ApiError(AiServiceError):
    """A call to services/api failed.

    Carries the upstream status code so routes can re-emit it unchanged — a 401
    from api must surface as a 401 from ai, otherwise token forwarding lies.
    """

    def __init__(self, status_code: int, detail: str) -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"[{status_code}] {detail}")


class CapabilityUnavailable(AiServiceError):
    """A feature is deliberately not wired up (e.g. receipt OCR with no vision model).

    Distinct from a bug: the remedy tells the caller how to enable it.
    """

    def __init__(self, capability: str, reason: str, remedy: str) -> None:
        self.capability = capability
        self.reason = reason
        self.remedy = remedy
        super().__init__(f"{capability} unavailable: {reason}. {remedy}")


class OcrError(AiServiceError):
    """A configured OCR provider failed at runtime (bad response, rejected
    file, provider outage) — distinct from CapabilityUnavailable, which means
    no provider is configured at all."""

    def __init__(self, detail: str) -> None:
        self.detail = detail
        super().__init__(f"OCR failed: {detail}")
