from fastapi import FastAPI, Header, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.dependencies.auth import get_current_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",  # Next.js dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/me")
async def me(
    current_user=Depends(get_current_user),
):
    return current_user