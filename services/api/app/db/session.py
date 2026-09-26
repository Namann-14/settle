from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.timing import install_query_timing

db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)

# No pool_pre_ping: it costs a full network round trip on every checkout,
# which dominates latency against a remote database. Instead, connections
# are retired after 4 minutes, which is shorter than Neon's 5-minute idle
# suspend, so a pooled connection never outlives the compute it points at.
engine = create_engine(
    db_url,
    pool_recycle=240,
    # The dashboard fires ~8 requests at once; size the pool (and the startup
    # warm-up in main.py) so none of them waits on a fresh TLS handshake.
    pool_size=10,
    max_overflow=10,
)

install_query_timing(engine)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)
