import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import settings

LOCAL_DOCKER_URL = "postgresql://hemc_user:hemc_password@localhost:5433/hemc_db"

def get_active_database_url() -> str:
    db_url = settings.DATABASE_URL
    # If cloud URL, verify network reachability with quick timeout
    if ("supabase" in db_url or "aws" in db_url) and not os.getenv("FORCE_CLOUD_DB"):
        try:
            test_engine = create_engine(db_url, connect_args={"connect_timeout": 3})
            with test_engine.connect():
                return db_url
        except Exception as e:
            print(f"⚠️ [OFFLINE AUTO-FALLBACK] Cloud database unreachable ({e}).")
            print(f"   Switching automatically to local Docker database: {LOCAL_DOCKER_URL}")
            return LOCAL_DOCKER_URL
    return db_url

active_database_url = get_active_database_url()

engine_kwargs = {}
if "postgresql" in active_database_url:
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_recycle": 300,
        "pool_pre_ping": True,
    })
    if "supabase" in active_database_url or "aws" in active_database_url:
        engine_kwargs["connect_args"] = {
            "connect_timeout": 5,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        }

engine = create_engine(active_database_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
