"""
Database connection and engine configuration.
Supports PostgreSQL (via psycopg2) and automatically falls back to local SQLite
if PostgreSQL is not yet configured or reachable.
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ATM_DataMart_DB")

# Environment variable for PostgreSQL: e.g. postgresql://postgres:postgres@localhost:5432/atm_datamart
DEFAULT_PG_URL = os.getenv("DATABASE_URL")

Base = declarative_base()

engine = None
is_postgresql = False

if DEFAULT_PG_URL and DEFAULT_PG_URL.startswith("postgres"):
    try:
        logger.info(f"Attempting connection to PostgreSQL: {DEFAULT_PG_URL.split('@')[-1]}")
        engine = create_engine(DEFAULT_PG_URL, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            pass
        is_postgresql = True
        logger.info("Successfully connected to PostgreSQL Data Mart!")
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL ({e}). Falling back to local SQLite database.")
        engine = None

if engine is None:
    # Use zero-config SQLite data mart
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "atm_datamart.db")
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    is_postgresql = False
    logger.info(f"Using local Star Schema SQLite engine at: {db_path}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
