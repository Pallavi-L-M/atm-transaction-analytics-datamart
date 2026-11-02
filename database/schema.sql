-- ====================================================================
-- ATM TRANSACTION ANALYTICS DATA MART (INDIAN BANKING CONTEXT)
-- Database Engine: PostgreSQL (pgAdmin / psql / Neon Compatible)
-- Project: College Data Warehousing & Analytics
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
-- A prospective 'dim_date' table is included for future expansion.
-- --------------------------------------------------------------------

-- 1. CLEAN UP EXISTING OBJECTS (Allows safe re-running)
DROP VIEW IF EXISTS view_top_atms_by_income CASCADE;
DROP VIEW IF EXISTS view_atm_city_summary CASCADE;
DROP VIEW IF EXISTS view_weekday_cashflow CASCADE;
DROP VIEW IF EXISTS view_cash_replenishment_alert CASCADE;
DROP TABLE IF EXISTS fact_atm_summary CASCADE;
DROP TABLE IF EXISTS dim_date CASCADE;
DROP TABLE IF EXISTS dim_time CASCADE;
DROP TABLE IF EXISTS dim_day CASCADE;
DROP TABLE IF EXISTS dim_location CASCADE;
DROP TABLE IF EXISTS dim_atm CASCADE;

-- ====================================================================
-- 2. STAR SCHEMA DIMENSIONS
-- ====================================================================

-- Dimension 1: ATM Dimension (Unique Indian ATM Terminals)
CREATE TABLE dim_atm (
    atm_key SERIAL PRIMARY KEY,
    atm_id VARCHAR(50) UNIQUE NOT NULL,       -- Source text ID: e.g. 'atm350000'
    atm_name VARCHAR(150) NOT NULL,          -- e.g. 'SBI ATM - MG Road Metro'
    atm_address VARCHAR(255)                 -- Street/location address
);

-- Dimension 2: Location Dimension (Indian Cities / Regional Zones)
CREATE TABLE dim_location (
    location_key SERIAL PRIMARY KEY,
    city_name VARCHAR(100) UNIQUE NOT NULL,   -- e.g. 'Bengaluru', 'Mumbai', 'Delhi'
    state_region VARCHAR(100) DEFAULT 'Domestic Zone'
);

-- Dimension 3: Day of Week Dimension (Weekly Transaction Patterns)
CREATE TABLE dim_day (
    day_key SERIAL PRIMARY KEY,
    day_name VARCHAR(20) UNIQUE NOT NULL,     -- 'Monday' through 'Sunday'
    day_number_in_week SMALLINT NOT NULL,     -- 1 (Monday) to 7 (Sunday)
    is_weekend BOOLEAN NOT NULL DEFAULT FALSE -- TRUE for Saturday/Sunday
);

-- Dimension 4: Time Dimension (Hourly & Time Slice Patterns)
CREATE TABLE dim_time (
    time_key SERIAL PRIMARY KEY,
    transaction_time VARCHAR(20) UNIQUE NOT NULL, -- '00:00:00', '14:15:00'
    hour_of_day SMALLINT NOT NULL,                -- 0 to 23
    minute_of_hour SMALLINT NOT NULL,             -- 0 to 59
    period_of_day VARCHAR(20) NOT NULL            -- 'Night', 'Morning', 'Afternoon', 'Evening'
);

-- Dimension 5: Prospective Date Dimension (For Future Calendar Timestamps)
CREATE TABLE dim_date (
    date_key INT PRIMARY KEY,
    calendar_date DATE UNIQUE,
    calendar_year INT,
    calendar_month INT,
    calendar_quarter INT
);

-- ====================================================================
-- 3. CENTRAL FACT TABLE
-- ====================================================================

CREATE TABLE fact_atm_summary (
    fact_id BIGSERIAL PRIMARY KEY,
    
    -- Foreign Keys to Star Dimensions
    atm_key INT NOT NULL REFERENCES dim_atm(atm_key),
    location_key INT NOT NULL REFERENCES dim_location(location_key),
    day_key INT NOT NULL REFERENCES dim_day(day_key),
    time_key INT NOT NULL REFERENCES dim_time(time_key),
    date_key INT REFERENCES dim_date(date_key), -- NULL until real calendar dates exist
    
    -- Measures (Reported Transaction Aggregates in ₹ INR)
    total_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    number_income_transaction INT NOT NULL DEFAULT 0,
    number_outcome_transaction INT NOT NULL DEFAULT 0,
    total_income NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_outcome NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_number_transaction INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fast Star Join Indexes
CREATE INDEX idx_fact_atm ON fact_atm_summary(atm_key);
CREATE INDEX idx_fact_location ON fact_atm_summary(location_key);
CREATE INDEX idx_fact_day ON fact_atm_summary(day_key);
CREATE INDEX idx_fact_time ON fact_atm_summary(time_key);

-- ====================================================================
-- 4. SEED DATA (INDIAN BANKING CONTEXT)
-- ====================================================================

-- Seed Day Dimension
INSERT INTO dim_day (day_name, day_number_in_week, is_weekend) VALUES
('Monday', 1, FALSE),
('Tuesday', 2, FALSE),
('Wednesday', 3, FALSE),
('Thursday', 4, FALSE),
('Friday', 5, FALSE),
('Saturday', 6, TRUE),
('Sunday', 7, TRUE)
ON CONFLICT (day_name) DO NOTHING;

-- Seed Indian City Clusters
INSERT INTO dim_location (city_name, state_region) VALUES
('Bengaluru', 'Karnataka - South'),
('Mumbai', 'Maharashtra - West'),
('Delhi', 'NCR - North'),
('Hyderabad', 'Telangana - South'),
('Chennai', 'Tamil Nadu - South'),
('Kolkata', 'West Bengal - East'),
('Pune', 'Maharashtra - West'),
('Ahmedabad', 'Gujarat - West'),
('Jaipur', 'Rajasthan - North'),
('Kochi', 'Kerala - South')
ON CONFLICT (city_name) DO NOTHING;

-- Seed Indian ATM Terminals
INSERT INTO dim_atm (atm_id, atm_name, atm_address) VALUES
('atm350000', 'SBI ATM - MG Road Metro', 'MG Road Metro Station Concourse, Bengaluru'),
('atm350001', 'HDFC Bank ATM - Indiranagar', '100 Feet Rd, Indiranagar, Bengaluru'),
('atm350002', 'ICICI Bank ATM - Koramangala', '80 Feet Road, 4th Block, Koramangala, Bengaluru'),
('atm350003', 'Axis Bank ATM - Whitefield', 'ITPL Main Road, Whitefield, Bengaluru'),
('atm350004', 'SBI ATM - Connaught Place', 'Inner Circle, Connaught Place, New Delhi'),
('atm350005', 'PNB ATM - Chandni Chowk', 'Main Market, Chandni Chowk, Delhi'),
('atm350006', 'HDFC Bank ATM - Nehru Place', 'Eros Corporate Tower, Nehru Place, New Delhi'),
('atm350007', 'SBI ATM - Nariman Point', 'Free Press Journal Marg, Nariman Point, Mumbai'),
('atm350008', 'ICICI Bank ATM - Bandra West', 'Hill Road, Bandra West, Mumbai'),
('atm350009', 'Bank of Baroda ATM - Andheri East', 'Chakala, Andheri-Kurla Road, Mumbai'),
('atm350010', 'Kotak Mahindra ATM - BKC', 'Bandra Kurla Complex, Mumbai'),
('atm350011', 'SBI ATM - Hitec City Cyber Towers', 'Cyber Towers Concourse, Hitec City, Hyderabad'),
('atm350012', 'HDFC Bank ATM - Banjara Hills', 'Road No. 12, Banjara Hills, Hyderabad'),
('atm350013', 'Canara Bank ATM - Secunderabad', 'Station Road, Secunderabad'),
('atm350014', 'SBI ATM - T Nagar', 'Usman Road, Panagal Park, T Nagar, Chennai'),
('atm350015', 'Indian Bank ATM - Anna Nagar', '2nd Avenue, Roundtana, Anna Nagar, Chennai'),
('atm350016', 'HDFC Bank ATM - OMR IT Corridor', 'Rajiv Gandhi Salai, Thoraipakkam, Chennai'),
('atm350017', 'SBI ATM - Park Street', 'Park Street Crossing, Kolkata'),
('atm350018', 'PNB ATM - Salt Lake Sector V', 'Sector V, Salt Lake, Kolkata'),
('atm350019', 'SBI ATM - FC Road', 'Fergusson College Road, Shivajinagar, Pune'),
('atm350020', 'HDFC Bank ATM - Hinjewadi IT Park', 'Phase 1, Hinjewadi, Pune'),
('atm350021', 'SBI ATM - CG Road', 'CG Road, Navrangpura, Ahmedabad'),
('atm350022', 'Bank of Baroda ATM - SG Highway', 'SG Highway, Bodakdev, Ahmedabad'),
('atm350023', 'SBI ATM - MI Road', 'MI Road, Near Panch Batti, Jaipur'),
('atm350024', 'SBI ATM - MG Road', 'MG Road, Ernakulam, Kochi')
ON CONFLICT (atm_id) DO NOTHING;

-- Seed Time Slices
INSERT INTO dim_time (transaction_time, hour_of_day, minute_of_hour, period_of_day) VALUES
('00:00:00', 0, 0, 'Night'),
('06:00:00', 6, 0, 'Morning'),
('09:00:00', 9, 0, 'Morning'),
('10:15:00', 10, 15, 'Morning'),
('11:30:00', 11, 30, 'Morning'),
('13:00:00', 13, 0, 'Afternoon'),
('14:15:00', 14, 15, 'Afternoon'),
('17:00:00', 17, 0, 'Afternoon'),
('18:30:00', 18, 30, 'Evening'),
('21:00:00', 21, 0, 'Evening'),
('23:45:00', 23, 45, 'Night')
ON CONFLICT (transaction_time) DO NOTHING;

-- Seed Sample Fact Summaries (in ₹ INR)
INSERT INTO fact_atm_summary 
(atm_key, location_key, day_key, time_key, total_balance, number_income_transaction, number_outcome_transaction, total_income, total_outcome, total_number_transaction)
VALUES
(1,  1, 1, 3,  1850000.00, 32, 115, 245000.00, 395000.00, 147),
(1,  1, 3, 7,  1720000.00, 28, 130, 210000.00, 460000.00, 158),
(1,  1, 5, 9,  1580000.00, 40, 145, 310000.00, 520000.00, 185),
(2,  1, 6, 10, 1250000.00, 18, 140, 145000.00, 490000.00, 158),
(3,  1, 2, 4,  1920000.00, 35, 125, 280000.00, 440000.00, 160),
(4,  1, 7, 2,  1100000.00, 15,  95, 120000.00, 310000.00, 110),
(5,  3, 1, 3,  2150000.00, 42, 135, 350000.00, 480000.00, 177),
(6,  3, 3, 6,  1680000.00, 25, 110, 195000.00, 385000.00, 135),
(7,  3, 5, 8,  1450000.00, 30, 150, 240000.00, 530000.00, 180),
(8,  2, 1, 3,  2350000.00, 48, 140, 410000.00, 495000.00, 188),
(9,  2, 4, 7,  1820000.00, 34, 155, 275000.00, 545000.00, 189),
(10, 2, 6, 10, 1380000.00, 22, 160, 180000.00, 580000.00, 182),
(11, 2, 5, 8,  2200000.00, 45, 130, 380000.00, 460000.00, 175),
(12, 4, 2, 5,  1950000.00, 38, 120, 295000.00, 425000.00, 158),
(13, 4, 4, 7,  1750000.00, 30, 138, 230000.00, 470000.00, 168),
(14, 4, 7, 11, 1420000.00, 14, 105, 110000.00, 360000.00, 119),
(15, 5, 1, 3,  1650000.00, 32, 128, 255000.00, 440000.00, 160),
(16, 5, 3, 6,  1520000.00, 26, 118, 205000.00, 410000.00, 144),
(17, 5, 5, 8,  1390000.00, 35, 142, 280000.00, 495000.00, 177),
(18, 6, 2, 4,  1780000.00, 31, 122, 245000.00, 420000.00, 153),
(19, 6, 5, 9,  1490000.00, 28, 136, 220000.00, 475000.00, 164),
(20, 7, 3, 6,  1840000.00, 36, 125, 290000.00, 435000.00, 161),
(21, 7, 5, 8,  1610000.00, 33, 140, 265000.00, 485000.00, 173),
(22, 8, 2, 4,  1720000.00, 29, 115, 230000.00, 395000.00, 144),
(23, 8, 4, 7,  1550000.00, 27, 130, 215000.00, 450000.00, 157),
(24, 9, 3, 5,  1630000.00, 25, 112, 195000.00, 380000.00, 137),
(25, 10, 4, 7, 1580000.00, 26, 118, 210000.00, 405000.00, 144);

-- ====================================================================
-- 5. ANALYTICAL VIEWS FOR BI & REPORTING
-- ====================================================================

-- View 1: City-wise Financial Aggregation
CREATE OR REPLACE VIEW view_atm_city_summary AS
SELECT 
    l.city_name,
    COUNT(DISTINCT a.atm_id) AS total_atms,
    ROUND(SUM(f.total_income), 2) AS reported_total_income_inr,
    ROUND(SUM(f.total_outcome), 2) AS reported_total_outcome_inr,
    ROUND(SUM(f.total_income) - SUM(f.total_outcome), 2) AS net_cash_flow_inr,
    SUM(f.total_number_transaction) AS total_transactions,
    ROUND(AVG(f.total_balance), 2) AS avg_reported_balance_inr
FROM fact_atm_summary f
JOIN dim_atm a ON f.atm_key = a.atm_key
JOIN dim_location l ON f.location_key = l.location_key
GROUP BY l.city_name
ORDER BY reported_total_income_inr DESC;

-- View 2: Top Performing ATMs by Reported Income
CREATE OR REPLACE VIEW view_top_atms_by_income AS
SELECT 
    a.atm_id,
    a.atm_name,
    l.city_name,
    ROUND(SUM(f.total_income), 2) AS total_reported_income_inr,
    ROUND(SUM(f.total_outcome), 2) AS total_reported_outcome_inr,
    SUM(f.total_number_transaction) AS total_transactions,
    MAX(f.total_balance) AS reported_balance_inr
FROM fact_atm_summary f
JOIN dim_atm a ON f.atm_key = a.atm_key
JOIN dim_location l ON f.location_key = l.location_key
GROUP BY a.atm_id, a.atm_name, l.city_name
ORDER BY total_reported_income_inr DESC
LIMIT 10;

-- View 3: Weekday Cash Flow Pattern
CREATE OR REPLACE VIEW view_weekday_cashflow AS
SELECT 
    d.day_name,
    d.day_number_in_week,
    d.is_weekend,
    ROUND(SUM(f.total_income), 2) AS total_income_inr,
    ROUND(SUM(f.total_outcome), 2) AS total_outcome_inr,
    SUM(f.total_number_transaction) AS total_transactions
FROM fact_atm_summary f
JOIN dim_day d ON f.day_key = d.day_key
GROUP BY d.day_name, d.day_number_in_week, d.is_weekend
ORDER BY d.day_number_in_week;

-- View 4: Cash Replenishment Alert View
CREATE OR REPLACE VIEW view_cash_replenishment_alert AS
SELECT 
    a.atm_id,
    a.atm_name,
    l.city_name,
    f.total_balance AS current_balance_inr,
    f.total_outcome AS recent_withdrawal_inr,
    CASE 
        WHEN f.total_balance < 1200000.00 THEN 'CRITICAL: Replenish Cash Urgently'
        WHEN f.total_balance < 1600000.00 THEN 'WARNING: Moderate Cash Level'
        ELSE 'NORMAL: Sufficient Vault Cash'
    END AS cash_status
FROM fact_atm_summary f
JOIN dim_atm a ON f.atm_key = a.atm_key
JOIN dim_location l ON f.location_key = l.location_key
ORDER BY f.total_balance ASC;

-- ====================================================================
-- 6. READY-TO-RUN SQL QUERIES (FOR PGADMIN / PSQL / NEON)
-- ====================================================================

-- Query A: Get High-Level Network Metrics
SELECT 
    COUNT(DISTINCT a.atm_id) AS total_unique_atms,
    ROUND(SUM(f.total_income), 2) AS total_reported_income_inr,
    ROUND(SUM(f.total_outcome), 2) AS total_reported_outcome_inr,
    ROUND(SUM(f.total_income) - SUM(f.total_outcome), 2) AS net_network_cashflow_inr,
    SUM(f.total_number_transaction) AS total_network_transactions
FROM fact_atm_summary f
JOIN dim_atm a ON f.atm_key = a.atm_key;

-- Query B: City-wise Performance Ranking
SELECT * FROM view_atm_city_summary;

-- Query C: Top 10 ATMs by Income Generation
SELECT * FROM view_top_atms_by_income;

-- Query D: Cash Replenishment Priority List
SELECT * FROM view_cash_replenishment_alert WHERE cash_status LIKE 'CRITICAL%';

-- Query E: Weekday Activity Analysis (Identify Weekend vs Weekday Surge)
SELECT 
    CASE WHEN is_weekend THEN 'Weekend (Sat-Sun)' ELSE 'Weekday (Mon-Fri)' END AS day_category,
    SUM(total_transactions) AS transaction_count,
    ROUND(SUM(total_income_inr), 2) AS total_income_inr,
    ROUND(SUM(total_outcome_inr), 2) AS total_outcome_inr
FROM view_weekday_cashflow
GROUP BY is_weekend;
