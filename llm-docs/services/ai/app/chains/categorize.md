# services/ai/app/chains/categorize.py

**Purpose:** LLM chain that assigns an expense to one of the user's categories.

**Key contents:** Prompt | extraction model with structured output `_CategoryGuess` (category_name, confidence, reasoning); `categorize_expense(...)` formats the description with amount/merchant and the category names list.

**Depends on / used by:** Uses llm/client.get_extraction_model, prompts/categorize. Called by an API route that maps category_name back to a category_id.

**Decisions & caveats:** Retries once, then returns a low-confidence fallback instead of a 500: Groq's server-side schema validation sometimes rejects a numeric field emitted as a string. An off-list name means no match (category_id=None). The chain is cached lazily at module level.
