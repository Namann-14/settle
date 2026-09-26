from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.timing import TimingMiddleware
from app.db.session import engine
from app.routes import budgets, categories, expenses, groups, incomes, recurring, settlements, spending, users


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Opening a connection to the remote database costs a TLS handshake
    # (~1.5s). The dashboard fires several requests at once, so fill the pool
    # up front instead of making the first page load pay for each one.
    # Best effort: a database that isn't reachable yet must not block startup.
    try:
        size = engine.pool.size()
        # Hold all of them at once so each is a distinct connection, then hand back.
        with ThreadPoolExecutor(max_workers=size) as pool:
            connections = list(pool.map(lambda _: engine.connect(), range(size)))
        for conn in connections:
            conn.close()
    except Exception:
        pass
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(TimingMiddleware)


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
app.include_router(budgets.router)
app.include_router(incomes.router)
app.include_router(recurring.router)
app.include_router(spending.router)
