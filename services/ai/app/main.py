from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.errors import ApiError, CapabilityUnavailable, OcrError
from app.routes import router
from app.services.api_client import close_http_client, init_http_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_http_client()
    yield
    await close_http_client()


app = FastAPI(title="Settle AI Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ApiError)
async def api_error_handler(request: Request, exc: ApiError):
    # Re-emit the same status code services/api returned, so a 401/403/404 from
    # api surfaces as the same code from ai — token forwarding stays honest.
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(CapabilityUnavailable)
async def capability_unavailable_handler(request: Request, exc: CapabilityUnavailable):
    return JSONResponse(
        status_code=501,
        content={
            "detail": {
                "capability": exc.capability,
                "reason": exc.reason,
                "remedy": exc.remedy,
            }
        },
    )


@app.exception_handler(OcrError)
async def ocr_error_handler(request: Request, exc: OcrError):
    return JSONResponse(status_code=502, content={"detail": exc.detail})


@app.get(f"{settings.ai_route_prefix}/health")
def health():
    return {"status": "ok"}


app.include_router(router, prefix=settings.ai_route_prefix)
