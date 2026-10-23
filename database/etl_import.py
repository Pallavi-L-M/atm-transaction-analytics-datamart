"""
Standalone ETL Script for ATM Transaction Analytics Data Mart.
Can be executed directly from terminal by college students or evaluators.

Usage:
    python etl_import.py
    python etl_import.py ../data/atm_transactions_sample.csv
    python etl_import.py /path/to/atm_transactions.csv --db postgresql://user:pass@localhost:5432/atm_datamart
"""

import sys
import os
import argparse
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.models import Base
from backend.etl import run_etl_from_csv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ATM_ETL_Tool")

def main():
    parser = argparse.ArgumentParser(description="Ingest ATM Transaction CSV into Star Schema Data Mart")
    parser.add_argument("csv_path", nargs="?", default=None, help="Path to atm_transactions.csv")
    parser.add_argument("--db", default=None, help="Database URL (e.g. postgresql://postgres:pass@localhost:5432/atm_datamart)")
    parser.add_argument("--max-rows", type=int, default=None, help="Limit number of rows for testing")
    args = parser.parse_args()

    # Determine CSV file path
    csv_file = args.csv_path
    if not csv_file:
        default_sample = os.path.join(PROJECT_ROOT, "data", "atm_transactions_sample.csv")
        full_csv = os.path.join(PROJECT_ROOT, "data", "atm_transactions.csv")
        if os.path.exists(full_csv):
            csv_file = full_csv
        elif os.path.exists(default_sample):
            csv_file = default_sample
        else:
            print("Error: No CSV file specified and neither data/atm_transactions.csv nor sample found.")
            sys.exit(1)

    # Determine database connection
    db_url = args.db or os.getenv("DATABASE_URL")
    if not db_url:
        sqlite_path = os.path.join(PROJECT_ROOT, "backend", "atm_datamart.db")
        db_url = f"sqlite:///{sqlite_path}"
        logger.info(f"No PostgreSQL URL provided. Using local SQLite Data Mart at: {sqlite_path}")
    else:
        logger.info(f"Connecting to database: {db_url.split('@')[-1]}")

    engine = create_engine(db_url)
    Base.metadata.create_all(bind=engine)

    Session = sessionmaker(bind=engine)
    with Session() as session:
        logger.info(f"Starting ETL Ingestion from: {csv_file}")
        results = run_etl_from_csv(csv_file, session, max_rows=args.max_rows)
        
        print("\n" + "="*60)
        print("   ATM TRANSACTION ANALYTICS DATA MART - ETL REPORT")
        print("="*60)
        print(f" Source CSV File     : {os.path.basename(csv_file)}")
        print(f" Target Database     : {'PostgreSQL' if 'postgres' in db_url else 'SQLite Data Mart'}")
        print(f" Fact Rows Inserted  : {results['facts_loaded']:,}")
        print(f" Unique ATMs (dim_atm): {results['unique_atms']}")
        print(f" Cities (dim_location): {results['cities']}")
        print(f" Schema Design       : Star Schema (4 Dimensions, 1 Fact)")
        print("="*60)
        print("[OK] Data Mart is ready for dashboard analytics!\n")

if __name__ == "__main__":
    main()
