# services/ai/app/llm/vision.py

**Purpose:** Receipt OCR provider abstraction.

**Key contents:** `ReceiptOCRProvider` protocol; `UnavailableReceiptOCR` (raises CapabilityUnavailable), `OCRSpaceProvider` (OCR.Space free API, 1MB limit), and `get_receipt_ocr_provider()` selecting by VISION_PROVIDER.

**Depends on / used by:** Uses core/config, core/errors. Output text feeds chains/extraction.

**Decisions & caveats:** Groq has no vision model on this account, so default is none and returns 501 with a remedy. OCR.Space returns raw text only, which the receipt extraction chain expects. Oversized images are rejected early with a clear error.
