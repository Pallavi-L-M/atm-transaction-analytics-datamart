"""
SQLAlchemy Star Schema models for ATM Transaction Analytics Data Mart.
Strictly maps to:
- dim_atm
- dim_location
- dim_day
- dim_time
- fact_atm_summary
"""

from sqlalchemy import Column, Integer, BigInteger, String, Numeric, Boolean, Time, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class DimAtm(Base):
    __tablename__ = "dim_atm"

    atm_key = Column(Integer, primary_key=True, index=True, autoincrement=True)
    atm_id = Column(String(50), unique=True, nullable=False, index=True)
    atm_name = Column(String(150), nullable=False)
    atm_address = Column(String(255), nullable=True)

    facts = relationship("FactAtmSummary", back_populates="atm")

class DimLocation(Base):
    __tablename__ = "dim_location"

    location_key = Column(Integer, primary_key=True, index=True, autoincrement=True)
    city_name = Column(String(100), unique=True, nullable=False, index=True)
    state_region = Column(String(100), default="Domestic Zone")

    facts = relationship("FactAtmSummary", back_populates="location")

class DimDay(Base):
    __tablename__ = "dim_day"

    day_key = Column(Integer, primary_key=True, index=True, autoincrement=True)
    day_name = Column(String(20), unique=True, nullable=False, index=True)
    day_number_in_week = Column(Integer, nullable=False)
    is_weekend = Column(Boolean, default=False)

    facts = relationship("FactAtmSummary", back_populates="day")

class DimTime(Base):
    __tablename__ = "dim_time"

    time_key = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_time = Column(String(20), unique=True, nullable=False, index=True) # string formatted HH:MM:SS for broad cross-db support
    hour_of_day = Column(Integer, nullable=False)
    minute_of_hour = Column(Integer, nullable=False)
    period_of_day = Column(String(20), nullable=False)

    facts = relationship("FactAtmSummary", back_populates="time")

class FactAtmSummary(Base):
    __tablename__ = "fact_atm_summary"

    fact_id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Foreign Keys
    atm_key = Column(Integer, ForeignKey("dim_atm.atm_key"), nullable=False, index=True)
    location_key = Column(Integer, ForeignKey("dim_location.location_key"), nullable=False, index=True)
    day_key = Column(Integer, ForeignKey("dim_day.day_key"), nullable=False, index=True)
    time_key = Column(Integer, ForeignKey("dim_time.time_key"), nullable=False, index=True)

    # Fact Metrics (Summaries reported in source dataset)
    total_balance = Column(Numeric(14, 2), nullable=False, default=0.00)
    number_income_transaction = Column(Integer, nullable=False, default=0)
    number_outcome_transaction = Column(Integer, nullable=False, default=0)
    total_income = Column(Numeric(14, 2), nullable=False, default=0.00)
    total_outcome = Column(Numeric(14, 2), nullable=False, default=0.00)
    total_number_transaction = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    atm = relationship("DimAtm", back_populates="facts")
    location = relationship("DimLocation", back_populates="facts")
    day = relationship("DimDay", back_populates="facts")
    time = relationship("DimTime", back_populates="facts")
