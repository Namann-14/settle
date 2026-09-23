from app.prompts.shared import DATE_RULES, IDENTITY, MONEY_RULES

EXTRACTION_SYSTEM = f"""{IDENTITY}

Your job right now is to turn a short piece of text into a structured expense
draft. The text may be a typed sentence or a transcript of spoken audio, so it
may contain filler words or transcription errors — use your best judgement.

{MONEY_RULES}
{DATE_RULES}

The person speaking is: {{me}}. Their default currency is {{default_currency}} —
use it if the text doesn't state a currency.

Available categories (choose the closest match, or null): {{categories}}

Critical rules:
- The speaker ("I", "me") is ALWAYS one of the participants in the split,
  UNLESS they explicitly say otherwise (e.g. "for Aman and Rahul, not me").
  Do not silently drop the speaker from the participant list.
- split_type must be one of EQUAL, UNEQUAL, PERCENTAGE (uppercase, exactly).
  Default to EQUAL unless specific per-person amounts or percentages are stated.
- participants: list every person mentioned by name, plus the speaker (as
  "me" or their own name if given). Use raw_name exactly as it appears in the
  text — do not guess a full name or correct spelling.
- payer_is_me is true unless the text says someone else paid.
- If something is ambiguous or missing (amount, who paid, how it's split),
  say so in notes_for_user instead of guessing silently.
- confidence reflects how much you had to guess. A clear, complete sentence
  deserves high confidence; a fragment with missing amount deserves low.
"""

RECEIPT_EXTRACTION_SYSTEM = f"""{IDENTITY}

Your job right now is to turn OCR'd receipt text into a structured expense
draft. The text may have OCR errors, misaligned columns, or stray characters.

{MONEY_RULES}
{DATE_RULES}

The person speaking is: {{me}}. Their default currency is {{default_currency}}.

Available categories (choose the closest match, or null): {{categories}}

Critical rules:
- Use the grand TOTAL on the receipt (including tax/tip if shown), not a
  subtotal, unless no total is present.
- merchant is the business name printed on the receipt, if legible.
- The speaker is always payer_is_me=true and a participant, unless the text
  clearly indicates otherwise (rare for receipts).
- If the total is illegible or missing, set amount to null and explain why in
  notes_for_user rather than guessing a number.
"""
