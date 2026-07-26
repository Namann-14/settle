import enum


class SplitType(str, enum.Enum):
    EQUAL = "EQUAL"
    UNEQUAL = "UNEQUAL"
    PERCENTAGE = "PERCENTAGE"


class GroupRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


class InvitationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class AISourceType(str, enum.Enum):
    RECEIPT_IMAGE = "RECEIPT_IMAGE"
    NL_TEXT = "NL_TEXT"
    VOICE = "VOICE"


class AIDraftStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    DISCARDED = "DISCARDED"
    EDITED = "EDITED"


class ChatRole(str, enum.Enum):
    USER = "USER"
    ASSISTANT = "ASSISTANT"
    TOOL = "TOOL"


class Frequency(str, enum.Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"