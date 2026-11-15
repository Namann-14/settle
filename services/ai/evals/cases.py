import json
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"


def load_cases(name: str) -> dict:
    """A hand-labelled case file from evals/data: shared `context` plus `cases`."""
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))
