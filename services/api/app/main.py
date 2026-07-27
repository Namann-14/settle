from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import users, expenses, groups, settlements, categories

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(users.router)
app.include_router(expenses.router)
app.include_router(groups.router)
app.include_router(settlements.router)
app.include_router(categories.router)