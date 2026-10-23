"""
FastAPI Server for ATM Transaction Analytics Data Mart.
Provides analytical endpoints, star-schema querying, and CSV ingestion.
"""

import os
import shutil
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from .database import engine, Base, get_db, is_postgresql
from .models import DimAtm, DimLocation, DimDay, DimTime, FactAtmSummary
from .etl import run_etl_from_csv, seed_day_dimension, REQUIRED_COLUMNS

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ATM Transaction Analytics Data Mart API",
    description="Star Schema analytics backend for college data warehousing project",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite runs on localhost:5173 / localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Pre-seed day dimension and check if sample data exists
    with Session(engine) as db:
        seed_day_dimension(db)
        fact_count = db.query(FactAtmSummary).count()
        if fact_count == 0:
            sample_path = os.path.join(os.path.dirname(__file__), "..", "data", "atm_transactions_sample.csv")
            if os.path.exists(sample_path):
                try:
                    run_etl_from_csv(sample_path, db)
                except Exception as e:
                    print(f"Startup sample ETL notice: {e}")

@app.get("/")
def root():
    return {
        "project": "ATM Transaction Analytics Data Mart",
        "status": "online",
        "documentation": "/docs",
        "database_type": "PostgreSQL" if is_postgresql else "SQLite (Local Data Mart)"
    }

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    try:
        fact_count = db.query(FactAtmSummary).count()
        atm_count = db.query(DimAtm).count()
        return {
            "status": "ok",
            "database_type": "PostgreSQL" if is_postgresql else "SQLite",
            "fact_records": fact_count,
            "unique_atms": atm_count
        }
    except Exception as e:
        return {
            "status": "error",
            "detail": str(e)
        }

@app.get("/api/overview")
def get_overview_metrics(city: Optional[str] = None, day: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(FactAtmSummary)
    
    if city and city != "ALL":
        query = query.join(DimLocation).filter(DimLocation.city_name == city)
    if day and day != "ALL":
        query = query.join(DimDay).filter(DimDay.day_name == day)

    # Aggregates
    totals = db.query(
        func.sum(FactAtmSummary.total_income).label("total_income"),
        func.sum(FactAtmSummary.total_outcome).label("total_outcome"),
        func.sum(FactAtmSummary.total_number_transaction).label("total_transactions"),
        func.count(func.distinct(FactAtmSummary.atm_key)).label("atm_count"),
        func.count(FactAtmSummary.fact_id).label("record_count")
    )
    
    if city and city != "ALL":
        totals = totals.join(DimLocation).filter(DimLocation.city_name == city)
    if day and day != "ALL":
        totals = totals.join(DimDay).filter(DimDay.day_name == day)
        
    res = totals.first()

    tot_inc = float(res.total_income or 0.0)
    tot_out = float(res.total_outcome or 0.0)
    tot_tx = int(res.total_transactions or 0)
    atm_cnt = int(res.atm_count or 0)
    rec_cnt = int(res.record_count or 0)

    # Top 10 ATMs by income
    top_atms_query = (
        db.query(
            DimAtm.atm_id,
            DimAtm.atm_name,
            DimLocation.city_name,
            func.sum(FactAtmSummary.total_income).label("total_income"),
            func.sum(FactAtmSummary.total_outcome).label("total_outcome"),
            func.sum(FactAtmSummary.total_number_transaction).label("total_transactions"),
            func.max(FactAtmSummary.total_balance).label("reported_balance")
        )
        .join(DimAtm, FactAtmSummary.atm_key == DimAtm.atm_key)
        .join(DimLocation, FactAtmSummary.location_key == DimLocation.location_key)
        .group_by(DimAtm.atm_id, DimAtm.atm_name, DimLocation.city_name)
        .order_by(desc("total_income"))
        .limit(10)
    ).all()

    top_atms = [
        {
            "atmId": row.atm_id,
            "atmName": row.atm_name,
            "atmCity": row.city_name,
            "totalIncome": float(row.total_income or 0),
            "totalOutcome": float(row.total_outcome or 0),
            "totalTransactions": int(row.total_transactions or 0),
            "latestBalance": float(row.reported_balance or 0)
        }
        for row in top_atms_query
    ]

    return {
        "totalIncome": tot_inc,
        "totalOutcome": tot_out,
        "netCashFlow": tot_inc - tot_out,
        "totalTransactions": tot_tx,
        "atmCount": atm_cnt,
        "recordCount": rec_cnt,
        "top10ByIncome": top_atms
    }

@app.get("/api/atms")
def list_atms(
    q: Optional[str] = None,
    city: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = (
        db.query(
            DimAtm.atm_id,
            DimAtm.atm_name,
            DimAtm.atm_address,
            DimLocation.city_name,
            func.sum(FactAtmSummary.total_income).label("total_income"),
            func.sum(FactAtmSummary.total_outcome).label("total_outcome"),
            func.sum(FactAtmSummary.total_number_transaction).label("total_transactions"),
            func.max(FactAtmSummary.total_balance).label("latest_balance")
        )
        .join(DimAtm, FactAtmSummary.atm_key == DimAtm.atm_key)
        .join(DimLocation, FactAtmSummary.location_key == DimLocation.location_key)
        .group_by(DimAtm.atm_id, DimAtm.atm_name, DimAtm.atm_address, DimLocation.city_name)
    )

    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            (DimAtm.atm_id.ilike(search_pattern)) | 
            (DimAtm.atm_name.ilike(search_pattern))
        )
    if city and city != "ALL":
        query = query.filter(DimLocation.city_name == city)

    results = query.order_by(desc("total_income")).limit(limit).all()

    return [
        {
            "atmId": r.atm_id,
            "atmName": r.atm_name,
            "atmAddress": r.atm_address,
            "atmCity": r.city_name,
            "totalIncome": float(r.total_income or 0),
            "totalOutcome": float(r.total_outcome or 0),
            "totalTransactions": int(r.total_transactions or 0),
            "latestBalance": float(r.latest_balance or 0)
        }
        for r in results
    ]

@app.post("/api/upload-csv")
async def upload_dataset_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")

    temp_path = os.path.join(os.path.dirname(__file__), f"temp_{file.filename}")
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = run_etl_from_csv(temp_path, db)
        return {
            "status": "success",
            "message": f"Successfully loaded {result['facts_loaded']} records into Star Schema.",
            "metrics": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/api/schema-info")
def get_schema_info():
    return {
        "model": "Star Schema",
        "fact_table": "fact_atm_summary",
        "dimensions": [
            {"table": "dim_atm", "keys": ["atm_key"], "attributes": ["atm_id", "atm_name", "atm_address"]},
            {"table": "dim_location", "keys": ["location_key"], "attributes": ["city_name", "state_region"]},
            {"table": "dim_day", "keys": ["day_key"], "attributes": ["day_name", "day_number_in_week", "is_weekend"]},
            {"table": "dim_time", "keys": ["time_key"], "attributes": ["transaction_time", "hour_of_day", "period_of_day"]},
        ],
        "notes": "No calendar dates in source dataset; modeled via dim_day and dim_time without inventing artificial dates."
    }
