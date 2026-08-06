from fastapi import FastAPI

from app.routes import router

app = FastAPI(title="Settle AI Service")
app.include_router(router)
