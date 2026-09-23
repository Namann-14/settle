from __future__ import annotations

from enum import Enum


class SplitType(str, Enum):
    """Mirrors services/api's SplitType exactly (app/db/enums.py).

    Declared as a real Enum, not `str` — with a plain str field, llama-3.3-70b
    has returned lowercase "equal" and invented values like "exact" that don't
    exist in the api schema. A real Enum puts the allowed values into the
    JSON-Schema `enum` sent to the model, and Pydantic rejects anything else.
    """

    EQUAL = "EQUAL"
    UNEQUAL = "UNEQUAL"
    PERCENTAGE = "PERCENTAGE"


class SourceType(str, Enum):
    """Mirrors services/api's AISourceType (app/db/enums.py)."""

    RECEIPT_IMAGE = "RECEIPT_IMAGE"
    NL_TEXT = "NL_TEXT"
    VOICE = "VOICE"
