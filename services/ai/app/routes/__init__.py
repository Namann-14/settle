from fastapi import APIRouter

from app.routes.chat import router as chat_router
from app.routes.expenses import router as expenses_router
from app.routes.insights import router as insights_router

router = APIRouter()
router.include_router(chat_router)
router.include_router(expenses_router)
router.include_router(insights_router)
