# services/ai/evals/judge.py

**Purpose:** LLM-as-judge for chat turns, over any OpenAI-compatible endpoint (Groq, NVIDIA, Ollama Cloud).

**Key contents:** `judge_config()` reads `JUDGE_API_KEY` / `JUDGE_BASE_URL` / `JUDGE_MODEL` (defaults: Groq and `qwen/qwen3.8-27b`). `judge_chat_turn` asks whether every number in the answer is supported by the tool outputs (`grounded`) and whether it addresses the question (`answers_question`), and returns the parsed JSON verdict.

**Depends on / used by:** httpx, python-dotenv. Used by `online.py`.

**Decisions & caveats:** Plain httpx, not a LangChain model, so judge calls are never traced into the app's LangSmith project (which would eat the trace quota). No fallback to `GROQ_API_KEY`: Groq limits are per org, and the judge must not consume production quota. The judge is a different model family from the agents (gpt-oss) to avoid self-preference. Retries 429/5xx honouring `Retry-After`. Strips `<think>` blocks and takes the last JSON object in the reply. Tool outputs are trimmed to the newest 8000 chars. Unset CI variables arrive as empty strings, hence `or` defaults rather than `get()` defaults.
