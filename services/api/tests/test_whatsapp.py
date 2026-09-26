import hashlib
import hmac
import os
from decimal import Decimal
from types import SimpleNamespace

# Settings() requires these at import time; tests never touch the DB or Clerk.
os.environ.setdefault("CLERK_SECRET_KEY", "test")
os.environ.setdefault("CLERK_PUBLISHABLE_KEY", "test")
os.environ.setdefault("DATABASE_URL", "postgresql://u:p@localhost/test")

from app.controllers import whatsapp as wc  # noqa: E402
from app.schemas.whatsapp import parse_webhook  # noqa: E402
from app.services.whatsapp import verify_signature  # noqa: E402


def _sign(body: bytes, secret: str) -> str:
    return "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


def test_signature_accepts_valid_and_rejects_tampered():
    body = b'{"entry": []}'
    header = _sign(body, "s3cret")
    assert verify_signature(body, header, app_secret="s3cret")
    assert not verify_signature(body + b" ", header, app_secret="s3cret")
    assert not verify_signature(body, _sign(body, "other"), app_secret="s3cret")
    assert not verify_signature(body, None, app_secret="s3cret")
    assert not verify_signature(body, header, app_secret="")


def test_parse_command_and_aliases():
    assert wc.parse_command("UNDO") == "undo"
    assert wc.parse_command(" today ") == "today"
    assert wc.parse_command("hi") == "help"
    assert wc.parse_command("month!") == "month"
    assert wc.parse_command("lunch 250") is None
    assert wc.parse_command(None) is None


def test_link_code_generation_and_parsing():
    code = wc.generate_link_code()
    assert len(code) == wc.LINK_CODE_LENGTH
    assert set(code) <= set(wc.LINK_ALPHABET)
    assert wc.parse_link_code("link ab3k9m") == "AB3K9M"
    assert wc.parse_link_code("  LINK XYZ234 ") == "XYZ234"
    assert wc.parse_link_code("link") is None
    assert wc.parse_link_code("lunch 250") is None


def test_route_extraction():
    assert wc.route_extraction(None, 0.99) == "no_amount"
    assert wc.route_extraction(0, 0.99) == "no_amount"
    assert wc.route_extraction(250, 0.9) == "save"
    assert wc.route_extraction(250, wc.AUTO_SAVE_CONFIDENCE) == "save"
    assert wc.route_extraction(250, 0.4) == "draft"


def test_pick_category_matches_case_insensitively_and_falls_back_to_other():
    food = SimpleNamespace(name="Food & Dining", is_system=True)
    other = SimpleNamespace(name="Other", is_system=True)
    mine = SimpleNamespace(name="Chai", is_system=False)
    cats = [food, other, mine]
    assert wc.pick_category("food & dining", cats) is food
    assert wc.pick_category("chai", cats) is mine
    assert wc.pick_category("Spaceships", cats) is other
    assert wc.pick_category(None, cats) is other
    assert wc.pick_category("x", [food]) is None


def test_audio_filename_and_money_format():
    assert wc.audio_filename("audio/ogg; codecs=opus") == "voice.ogg"
    assert wc.audio_filename("audio/mpeg") == "voice.mp3"
    assert wc.audio_filename(None) == "voice.ogg"
    assert wc.format_money(Decimal("250"), "INR") == "₹250"
    assert wc.format_money(1234.5, "INR") == "₹1,234.50"
    assert wc.format_money(10, "JPY") == "JPY 10"


def test_parse_webhook_flattens_messages_and_skips_statuses():
    payload = {
        "entry": [
            {
                "changes": [
                    {"value": {"statuses": [{"id": "wamid.S", "status": "read"}]}},
                    {
                        "value": {
                            "messages": [
                                {"id": "wamid.1", "from": "919800000001", "type": "text", "text": {"body": "lunch 250"}},
                                {"id": "wamid.2", "from": "919800000001", "type": "audio",
                                 "audio": {"id": "MEDIA1", "mime_type": "audio/ogg; codecs=opus"}},
                                {"id": "wamid.3", "from": "919800000001", "type": "interactive",
                                 "interactive": {"type": "button_reply", "button_reply": {"id": "save:abc", "title": "Save"}}},
                                {"id": "wamid.4", "from": "919800000001", "type": "image", "image": {"id": "IMG"}},
                            ]
                        }
                    },
                ]
            }
        ]
    }
    msgs = parse_webhook(payload)
    assert [m.kind for m in msgs] == ["text", "audio", "interactive", "other"]
    assert msgs[0].text == "lunch 250"
    assert msgs[1].media_id == "MEDIA1"
    assert msgs[2].button_id == "save:abc"
    assert parse_webhook({}) == []


def test_duplicate_message_is_ignored(monkeypatch):
    sent = []
    monkeypatch.setattr(wc.whatsapp_repo, "record_message", lambda db, **kw: None)
    monkeypatch.setattr(wc.wa, "send_text", lambda to, body: sent.append(body))
    msg = parse_webhook(
        {"entry": [{"changes": [{"value": {"messages": [
            {"id": "wamid.1", "from": "9198", "type": "text", "text": {"body": "lunch 250"}}
        ]}}]}]}
    )[0]
    wc.handle_message(db=None, msg=msg)
    assert sent == []


def test_unlinked_sender_gets_instructions(monkeypatch):
    sent = []
    monkeypatch.setattr(wc.whatsapp_repo, "record_message", lambda db, **kw: SimpleNamespace())
    monkeypatch.setattr(wc.whatsapp_repo, "get_user_by_phone", lambda db, phone: None)
    monkeypatch.setattr(wc.wa, "send_text", lambda to, body: sent.append(body))
    msg = parse_webhook(
        {"entry": [{"changes": [{"value": {"messages": [
            {"id": "wamid.9", "from": "9198", "type": "text", "text": {"body": "lunch 250"}}
        ]}}]}]}
    )[0]
    wc.handle_message(db=None, msg=msg)
    assert sent == [wc.UNLINKED_TEXT]
