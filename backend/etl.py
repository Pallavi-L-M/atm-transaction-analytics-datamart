"""
ETL Ingestion Pipeline:
Reads atm_transactions.csv, validates columns, populates Star Schema
Dimensions (dim_atm, dim_location, dim_day, dim_time) and Fact Table (fact_atm_summary).
"""

import os
import csv
import logging
from sqlalchemy.orm import Session
from .models import DimAtm, DimLocation, DimDay, DimTime, FactAtmSummary

logger = logging.getLogger("ATM_DataMart_ETL")

REQUIRED_COLUMNS = [
    "atmId", "atmName", "atmCity", "atmAddress",
    "totalBalance", "numberIncomeTransaction", "numberOutcomeTransaction",
    "totalIncome", "totalOutcome", "totalNumberTransaction",
    "day", "transactionTime"
]

DAYS_SEED = [
    ("Monday", 1, False),
    ("Tuesday", 2, False),
    ("Wednesday", 3, False),
    ("Thursday", 4, False),
    ("Friday", 5, False),
    ("Saturday", 6, True),
    ("Sunday", 7, True),
]

def seed_day_dimension(db: Session):
    for day_name, num, is_wk in DAYS_SEED:
        existing = db.query(DimDay).filter(DimDay.day_name == day_name).first()
        if not existing:
            db.add(DimDay(day_name=day_name, day_number_in_week=num, is_weekend=is_wk))
    db.commit()

def get_period_of_day(hour: int) -> str:
    if 0 <= hour < 6:
        return "Night"
    elif 6 <= hour < 12:
        return "Morning"
    elif 12 <= hour < 18:
        return "Afternoon"
    return "Evening"

def run_etl_from_csv(csv_path: str, db: Session, max_rows: int = None) -> dict:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset file not found at: {csv_path}")

    seed_day_dimension(db)

    # Cache dimension keys in-memory for high-speed lookups during batch inserts
    atm_cache = {a.atm_id: a.atm_key for a in db.query(DimAtm).all()}
    loc_cache = {l.city_name: l.location_key for l in db.query(DimLocation).all()}
    day_cache = {d.day_name: d.day_key for d in db.query(DimDay).all()}
    time_cache = {t.transaction_time: t.time_key for t in db.query(DimTime).all()}

    rows_inserted = 0
    atms_created = 0
    locations_created = 0
    times_created = 0

    batch_facts = []

    with open(csv_path, mode="r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        
        # Validate columns
        headers = reader.fieldnames or []
        missing = [c for c in REQUIRED_COLUMNS if c not in headers]
        if missing:
            raise ValueError(f"Missing required columns in CSV: {', '.join(missing)}")

        for idx, row in enumerate(reader):
            if max_rows and idx >= max_rows:
                break

            atm_id = (row.get("atmId") or "").strip()
            atm_name = (row.get("atmName") or "ATM").strip()
            atm_address = (row.get("atmAddress") or "").strip()
            city = (row.get("atmCity") or "Unknown").strip()
            day = (row.get("day") or "").strip()
            tx_time = (row.get("transactionTime") or "00:00:00").strip()

            if not atm_id:
                continue

            # 1. Lookup or create DimAtm
            if atm_id not in atm_cache:
                new_atm = DimAtm(atm_id=atm_id, atm_name=atm_name, atm_address=atm_address)
                db.add(new_atm)
                db.flush()
                atm_cache[atm_id] = new_atm.atm_key
                atms_created += 1

            # 2. Lookup or create DimLocation
            if city not in loc_cache:
                new_loc = DimLocation(city_name=city)
                db.add(new_loc)
                db.flush()
                loc_cache[city] = new_loc.location_key
                locations_created += 1

            # 3. Lookup or create DimDay
            day_key = day_cache.get(day)
            if not day_key:
                # If custom weekday name encountered
                new_day = DimDay(day_name=day, day_number_in_week=0, is_weekend=False)
                db.add(new_day)
                db.flush()
                day_cache[day] = new_day.day_key
                day_key = new_day.day_key

            # 4. Lookup or create DimTime
            if tx_time not in time_cache:
                hour = 0
                minute = 0
                try:
                    parts = tx_time.split(":")
                    hour = int(parts[0])
                    minute = int(parts[1]) if len(parts) > 1 else 0
                except Exception:
                    pass
                period = get_period_of_day(hour)
                new_time = DimTime(
                    transaction_time=tx_time,
                    hour_of_day=hour,
                    minute_of_hour=minute,
                    period_of_day=period
                )
                db.add(new_time)
                db.flush()
                time_cache[tx_time] = new_time.time_key
                times_created += 1

            # 5. Prepare Fact Row
            try:
                tot_bal = float(row.get("totalBalance") or 0.0)
                num_inc = int(float(row.get("numberIncomeTransaction") or 0))
                num_out = int(float(row.get("numberOutcomeTransaction") or 0))
                tot_inc = float(row.get("totalIncome") or 0.0)
                tot_out = float(row.get("totalOutcome") or 0.0)
                tot_num = int(float(row.get("totalNumberTransaction") or 0))
            except Exception:
                tot_bal = tot_inc = tot_out = 0.0
                num_inc = num_out = tot_num = 0

            fact = FactAtmSummary(
                atm_key=atm_cache[atm_id],
                location_key=loc_cache[city],
                day_key=day_key,
                time_key=time_cache[tx_time],
                total_balance=tot_bal,
                number_income_transaction=num_inc,
                number_outcome_transaction=num_out,
                total_income=tot_inc,
                total_outcome=tot_out,
                total_number_transaction=tot_num
            )
            batch_facts.append(fact)

            if len(batch_facts) >= 1000:
                db.bulk_save_objects(batch_facts)
                db.commit()
                rows_inserted += len(batch_facts)
                batch_facts = []

        if batch_facts:
            db.bulk_save_objects(batch_facts)
            db.commit()
            rows_inserted += len(batch_facts)

    logger.info(f"ETL Complete: {rows_inserted} facts loaded, {atms_created} new ATMs, {locations_created} cities.")
    return {
        "status": "success",
        "facts_loaded": rows_inserted,
        "unique_atms": len(atm_cache),
        "cities": len(loc_cache)
    }
