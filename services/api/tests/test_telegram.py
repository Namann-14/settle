import os
from decimal import Decimal
from types import SimpleNamespace

# Settings() requires these at import time; tests never touch the DB or Clerk.
os.environ.setdefault("CLERK_SECRET_KEY", "test")
os.environ.setdefault("CLERK_PUBLISHABLE_KEY", "test")
os.environ.setdefault("DATABASE_URL", "postgresql://u:p@localhost/test")

from app.controllers import telegram as tc  # noqa: E402
from app.schemas.telegram import parse_update  # noqa: E402
from app.services.telegram import verify_secret  # noqa: E402


def _text_update(text: str, update_id: int = 1, chat_type: str = "private") -> dict:
    return {
        "update_id": update_id,
        "message": {
            "message_id": 10,
            "from": {"id": 42, "username": "naman"},
            "chat": {"id": 42, "type": chat_type},
            "text": text,
        },
    }


def test_secret_accepts_match_and_rejects_others():
    assert verify_secret("s3cret", secret="s3cret")
    assert not verify_secret("nope", secret="s3cret")
    assert not verify_secret(None, secret="s3cret")
    assert not verify_secret("s3cret", secret="")


def test_parse_command_and_aliases():
    assert tc.parse_command("/undo") == "undo"
    assert tc.parse_command("/today@SettleBot") == "today"
    assert tc.parse_command("UNDO") == "undo"
    assert tc.parse_command("hi") == "help"
    assert tc.parse_command("/start") == "help"
    assert tc.parse_command("month!") == "month"
    assert tc.parse_command("lunch 250") is None
    assert tc.parse_command(None) is None


def test_link_code_generation_and_parsing():
    code = tc.generate_link_code()
    assert len(code) == tc.LINK_CODE_LENGTH
    assert set(code) <= set(tc.LINK_ALPHABET)
    assert tc.parse_link_code("/start ab3k9m2x") == "AB3K9M2X"
    assert tc.parse_link_code("/start@SettleBot AB3K9M2X") == "AB3K9M2X"
    assert tc.parse_link_code("link XYZ23456") == "XYZ23456"
    assert tc.parse_link_code("/start") is None
    assert tc.parse_link_code("lunch 250") is None


def test_deep_link(monkeypatch):
    monkeypatch.setattr(tc.settings, "TELEGRAM_BOT_USERNAME", "@SettleBot")
    assert tc.deep_link("ABC") == "https://t.me/SettleBot?start=ABC"
    monkeypatch.setattr(tc.settings, "TELEGRAM_BOT_USERNAME", "")
    assert tc.deep_link("ABC") is None


def test_route_extraction():
    assert tc.route_extraction(None, 0.99) == "no_amount"
    assert tc.route_extraction(0, 0.99) == "no_amount"
    assert tc.route_extraction(250, 0.9) == "save"
    assert tc.route_extraction(250, tc.AUTO_SAVE_CONFIDENCE) == "save"
    assert tc.route_extraction(250, 0.4) == "draft"


def test_pick_category_matches_case_insensitively_and_falls_back_to_other():
    food = SimpleNamespace(name="Food & Dining", is_system=True)
    other = SimpleNamespace(name="Other", is_system=True)
    mine = SimpleNamespace(name="Chai", is_system=False)
    cats = [food, other, mine]
    assert tc.pick_category("food & dining", cats) is food
    assert tc.pick_category("chai", cats) is mine
    assert tc.pick_category("Spaceships", cats) is other
    assert tc.pick_category(None, cats) is other
    assert tc.pick_category("x", [food]) is None


def test_audio_filename_and_money_format():
    assert tc.audio_filename("audio/ogg") == "voice.ogg"
    assert tc.audio_filename("audio/mpeg") == "voice.mp3"
    assert tc.audio_filename(None) == "voice.ogg"
    assert tc.format_money(Decimal("250"), "INR") == "₹250"
    assert tc.format_money(1234.5, "INR") == "₹1,234.50"
    assert tc.format_money(10, "JPY") == "JPY 10"


def test_summary_line_escapes_html():
    payload = {
        "amount": "250",
        "currency": "INR",
        "description": "<b>lunch</b> & chai",
        "category_name": "Food & Dining",
        "date": tc.local_today().isoformat(),
    }
    line = tc._summary_line(payload)
    assert "<b>" not in line
    assert "&lt;b&gt;lunch&lt;/b&gt; &amp; chai" in line


def test_parse_update_kinds():
    text = parse_update(_text_update("lunch 250"))
    assert (text.kind, text.chat_id, text.text, text.username) == ("text", 42, "lunch 250", "naman")

    voice = parse_update(
        {"update_id": 2, "message": {"chat": {"id": 42, "type": "private"},
                                     "voice": {"file_id": "F1", "mime_type": "audio/ogg"}}}
    )
    assert (voice.kind, voice.file_id, voice.mime_type) == ("voice", "F1", "audio/ogg")

    cb = parse_update(
        {"update_id": 3, "callback_query": {"id": "CB1", "from": {"id": 42}, "data": "save:abc",
                                            "message": {"message_id": 77, "chat": {"id": 42, "type": "private"}}}}
    )
    assert (cb.kind, cb.callback_id, cb.callback_data, cb.message_id) == ("callback", "CB1", "save:abc", 77)

    photo = parse_update({"update_id": 4, "message": {"chat": {"id": 42, "type": "private"}, "photo": [{}]}})
    assert photo.kind == "other"


def test_parse_update_ignores_groups_and_non_messages():
    assert parse_update(_text_update("lunch 250", chat_type="group")) is None
    assert parse_update({"update_id": 5, "edited_message": {}}) is None
    assert parse_update({}) is None


def test_duplicate_update_is_ignored(monkeypatch):
    sent = []
    monkeypatch.setattr(tc.telegram_repo, "record_update", lambda db, **kw: None)
    monkeypatch.setattr(tc.tg, "send_text", lambda chat, text: sent.append(text))
    tc.handle_update(db=None, update=parse_update(_text_update("lunch 250")))
    assert sent == []


def test_unlinked_chat_gets_instructions(monkeypatch):
    sent = []
    monkeypatch.setattr(tc.telegram_repo, "record_update", lambda db, **kw: SimpleNamespace())
    monkeypatch.setattr(tc.telegram_repo, "get_user_by_chat", lambda db, chat_id: None)
    monkeypatch.setattr(tc.tg, "send_text", lambda chat, text: sent.append(text))
    tc.handle_update(db=None, update=parse_update(_text_update("lunch 250")))
    assert sent == [tc.UNLINKED_TEXT]
