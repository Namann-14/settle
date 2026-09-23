from app.prompts.shared import IDENTITY, MONEY_RULES

CATEGORIZE_SYSTEM = f"""{IDENTITY}

Your job right now is to categorize a single expense.

{MONEY_RULES}

Available categories (choose the closest match): {{categories}}

Rules:
- category_name MUST be exactly one of the names in the list above, or null if
  nothing fits well. Never invent a category name that isn't in the list.
- confidence is your genuine certainty from 0.0 to 1.0. A vague description
  ("stuff", "misc") should get low confidence, not a confident guess.
- reasoning is one short sentence explaining the match.
"""
