-- ====================================================================
-- ATM TRANSACTION ANALYTICS DATA MART
-- Star Schema Definition (PostgreSQL Compatible)
-- Project: College Data Warehousing & Analytics Project
-- ====================================================================

-- --------------------------------------------------------------------
-- ARCHITECTURAL NOTE ON DIM_DATE:
-- The source dataset 'atm_transactions.csv' provides:
--   - 'day' (e.g., 'Wednesday', 'Monday')
--   - 'transactionTime' (e.g., '00:00:00', '14:30:00')
-- It DOES NOT contain calendar dates (Year-Month-Day).
-- To maintain strict analytical integrity without inventing artificial
-- calendar dates, our Star Schema defines 'dim_day' (weekday dimension)
-- and 'dim_time' (time-of-day dimension).
-- A prospective 'dim_date' table is included below for future expansion
-- when real calendar timestamps are made available by the bank core.
-- --------------------------------------------------------------------

-- Clean up existing tables if re-running
DROP TABLE IF EXISTS fact_atm_summary CASCADE;
DROP TABLE IF EXISTS dim_date CASCADE;
DROP TABLE IF EXISTS dim_time CASCADE;
DROP TABLE IF EXISTS dim_day CASCADE;
DROP TABLE IF EXISTS dim_location CASCADE;
DROP TABLE IF EXISTS dim_atm CASCADE;

-- 1. ATM Dimension (ATM Master Details)
CREATE TABLE dim_atm (
    atm_key SERIAL PRIMARY KEY,
    atm_id VARCHAR(50) UNIQUE NOT NULL,       -- Source text ID: e.g. 'atm350000'
    atm_name VARCHAR(150) NOT NULL,          -- e.g. 'ATM Main Branch Lobby'
    atm_address VARCHAR(255)                 -- Street/location address
);

-- 2. Location Dimension (City / Area Grouping)
-- Note: 'atmCity' is treated as a geographic cluster, not a confirmed bank branch
CREATE TABLE dim_location (
    location_key SERIAL PRIMARY KEY,
    city_name VARCHAR(100) UNIQUE NOT NULL,
    state_region VARCHAR(100) DEFAULT 'Domestic Zone'
);

-- 3. Day of Week Dimension (Captures recurring weekly transactional patterns)
CREATE TABLE dim_day (
    day_key SERIAL PRIMARY KEY,
    day_name VARCHAR(20) UNIQUE NOT NULL,     -- e.g. 'Monday', 'Tuesday', ..., 'Sunday'
    day_number_in_week SMALLINT NOT NULL,     -- 1 (Monday) to 7 (Sunday)
    is_weekend BOOLEAN NOT NULL DEFAULT FALSE -- TRUE for Saturday/Sunday
);

-- 4. Time of Day Dimension (Captures hourly/time slice patterns)
CREATE TABLE dim_time (
    time_key SERIAL PRIMARY KEY,
    transaction_time TIME UNIQUE NOT NULL,    -- e.g. '00:00:00'
    hour_of_day SMALLINT NOT NULL,            -- 0 to 23
    minute_of_hour SMALLINT NOT NULL,         -- 0 to 59
    period_of_day VARCHAR(20) NOT NULL        -- 'Night', 'Morning', 'Afternoon', 'Evening'
);

-- 5. Optional Calendar Date Dimension (For future historical date support)
CREATE TABLE dim_date (
    date_key INT PRIMARY KEY,                 -- e.g. YYYYMMDD
    calendar_date DATE UNIQUE,
    calendar_year INT,
    calendar_month INT,
    calendar_quarter INT,
    day_of_month INT
);

-- 6. Fact Table: ATM Transaction Summary
CREATE TABLE fact_atm_summary (
    fact_id BIGSERIAL PRIMARY KEY,
    
    -- Dimension Foreign Keys
    atm_key INT NOT NULL REFERENCES dim_atm(atm_key),
    location_key INT NOT NULL REFERENCES dim_location(location_key),
    day_key INT NOT NULL REFERENCES dim_day(day_key),
    time_key INT NOT NULL REFERENCES dim_time(time_key),
    date_key INT REFERENCES dim_date(date_key), -- NULL until real calendar dates exist
    
    -- Metrics / Aggregates reported in the dataset
    total_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    number_income_transaction INT NOT NULL DEFAULT 0,
    number_outcome_transaction INT NOT NULL DEFAULT 0,
    total_income NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_outcome NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_number_transaction INT NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Fast Analytics & Star Joins
CREATE INDEX idx_fact_atm ON fact_atm_summary(atm_key);
CREATE INDEX idx_fact_location ON fact_atm_summary(location_key);
CREATE INDEX idx_fact_day ON fact_atm_summary(day_key);
CREATE INDEX idx_fact_time ON fact_atm_summary(time_key);

-- Pre-seed Day Dimension
INSERT INTO dim_day (day_name, day_number_in_week, is_weekend) VALUES
('Monday', 1, FALSE),
('Tuesday', 2, FALSE),
('Wednesday', 3, FALSE),
('Thursday', 4, FALSE),
('Friday', 5, FALSE),
('Saturday', 6, TRUE),
('Sunday', 7, TRUE)
ON CONFLICT (day_name) DO NOTHING;

-- Helpful Analytical Views for Fast Querying
CREATE OR REPLACE VIEW view_atm_city_summary AS
SELECT 
    l.city_name,
    COUNT(DISTINCT a.atm_id) AS total_atms,
    SUM(f.total_income) AS reported_total_income,
    SUM(f.total_outcome) AS reported_total_outcome,
    SUM(f.total_number_transaction) AS reported_total_transactions,
    ROUND(AVG(f.total_balance), 2) AS avg_reported_balance
FROM fact_atm_summary f
JOIN dim_atm a ON f.atm_key = a.atm_key
JOIN dim_location l ON f.location_key = l.location_key
GROUP BY l.city_name;

CREATE OR REPLACE VIEW view_top_atms_by_income AS
SELECT 
    a.atm_id,
    a.atm_name,
    l.city_name,
    SUM(f.total_income) AS total_reported_income,
    SUM(f.total_outcome) AS total_reported_outcome,
    SUM(f.total_number_transaction) AS total_reported_transactions,
    MAX(f.total_balance) AS reported_balance
FROM fact_atm_summary f
JOIN dim_atm a ON f.atm_key = a.atm_key
JOIN dim_location l ON f.location_key = l.location_key
GROUP BY a.atm_id, a.atm_name, l.city_name
ORDER BY total_reported_income DESC
LIMIT 10;
