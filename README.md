# ATM Transaction Analytics Data Mart

> **Academic Project:** Data Warehousing & Business Intelligence Prototype  
> **Course:** B.Tech / MCA Data Engineering & Analytics  
> **Tech Stack:** React 19, Tailwind CSS, Recharts, Python 3 FastAPI, PostgreSQL / SQLite  

---

## 1. Project Overview & Objective

The **ATM Transaction Analytics Data Mart** is a specialized analytical dashboard and dimensional data warehouse designed to evaluate the financial and operational performance of an Automated Teller Machine (ATM) network.

The system ingests transaction summary snapshots (`atm_transactions.csv`), normalizes them into a high-performance **Star Schema**, and delivers real-time executive business intelligence on:
- **Cash Flow Dynamics:** Total cash deposited (Income) versus cash dispensed (Outcome).
- **ATM Performance & Ranking:** Top revenue-generating ATMs and high-volume transaction nodes.
- **Geographic Distribution:** Performance comparisons across urban city clusters.
- **Temporal Patterns:** Peak transaction volume by day of the week and hour of the day.

---

## 2. Dataset Structure & Dimensions

The project works with `atm_transactions.csv` (containing 30,156 summary rows) with the following 12 columns:

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `atmId` | Text | Unique text identifier (e.g., `atm350000`) |
| `atmName` | Text | Descriptive name of the ATM facility |
| `atmCity` | Text | Geographic city grouping (e.g., `New York`, `Chicago`) |
| `atmAddress` | Text | Street address location |
| `totalBalance` | Decimal | Reported cash balance in the ATM vault |
| `numberIncomeTransaction` | Integer | Count of deposit transactions |
| `numberOutcomeTransaction` | Integer | Count of withdrawal transactions |
| `totalIncome` | Decimal | Total cash value of deposits |
| `totalOutcome` | Decimal | Total cash value of withdrawals |
| `totalNumberTransaction` | Integer | Total transaction count (`numberIncome` + `numberOutcome`) |
| `day` | Text | Weekday name (`Monday` through `Sunday`) |
| `transactionTime` | Time | Time snapshot (`HH:MM:SS`, e.g., `00:00:00`) |

### Strict Analytical Integrity Note (Dates & Dimensions)
* **No Artificial Dates:** The source dataset does not contain calendar dates (year/month/day). In accordance with strict data warehousing standards, **we do not generate fake dates**.
* **Temporal Modeling:** We model time through a Day-of-Week Dimension (`dim_day`) and Time-of-Day Dimension (`dim_time`). If real calendar dates are introduced in the future, the prospective `dim_date` dimension in `schema.sql` can be populated seamlessly.
* **Geographic Semantics:** `atmCity` is treated as a geographic location cluster, not a confirmed bank branch.

---

## 3. Dimensional Model (Star Schema)

The database design adheres to Ralph Kimball's dimensional modeling methodology:

```
                  +--------------------+
                  |      dim_atm       |
                  +--------------------+
                  | PK: atm_key        |
                  |     atm_id         |
                  |     atm_name       |
                  |     atm_address    |
                  +---------+----------+
                            | 1
                            |
                            | *
+--------------------+      |      +--------------------+
|    dim_location    |      |      |      dim_day       |
+--------------------+      |      +--------------------+
| PK: location_key   |      |      | PK: day_key        |
|     city_name      |*     |     *|     day_name       |
|     state_region   +------+------+     day_number     |
+--------------------+      |      |     is_weekend     |
                            |      +--------------------+
                   +--------+---------+
                   | fact_atm_summary |
                   +------------------+
                   | PK: fact_id      |
                   | FK: atm_key      |
                   | FK: location_key |
                   | FK: day_key      |
                   | FK: time_key     |
                   |------------------|
                   | total_balance    |
                   | number_income_tx |
                   | number_outcome_tx|
                   | total_income     |
                   | total_outcome    |
                   | total_number_tx  |
                   +--------+---------+
                            | *
                            |
                            | 1
                  +---------+----------+
                  |      dim_time      |
                  +--------------------+
                  | PK: time_key       |
                  |     transaction_time
                  |     hour_of_day    |
                  |     period_of_day  |
                  +--------------------+
```

---

## 4. Business Logic & Calculations

All calculations reflect reported summary dataset aggregates:
1. **Total Reported Income:**  
   $$\text{Total Income} = \sum \text{totalIncome}$$
2. **Total Reported Outcome:**  
   $$\text{Total Outcome} = \sum \text{totalOutcome}$$
3. **Net Cash Flow:**  
   $$\text{Net Flow} = \text{Total Income} - \text{Total Outcome}$$
4. **Total Reported Transactions:**  
   $$\text{Total Transactions} = \sum \text{totalNumberTransaction}$$
5. **Reported ATM Balance (Double-Counting Prevention):**  
   Because each ATM has multiple summary records across different days/times, summing `totalBalance` naively across all rows causes double-counting. Our Data Mart calculates **Reported ATM Balance** by taking the latest reported balance snapshot for each unique `atmId`:
   $$\text{Network Balance} = \sum_{a \in \text{Unique ATMs}} \text{LatestBalance}(a)$$
   *(The raw row sum is also provided via an interactive toggle for snapshot volume audits).*
6. **Total ATM Count:**  
   $$\text{ATM Count} = |\text{Unique } \text{atmId}|$$

---

## 5. Project Folder Structure

```
atm-analytics-datamart/
├── data/
│   └── atm_transactions_sample.csv   # 450 realistic records strictly matching schema
├── database/
│   ├── schema.sql                    # PostgreSQL Star Schema DDL & analytical views
│   ├── etl_import.py                 # Standalone CLI ETL ingestion tool
│   └── generate_sample_data.py       # Python script generating realistic sample data
├── backend/
│   ├── main.py                       # FastAPI REST API application
│   ├── models.py                     # SQLAlchemy Star Schema models
│   ├── database.py                   # Engine config (PostgreSQL with SQLite fallback)
│   ├── etl.py                        # ETL ingestion and dimension lookup engine
│   └── requirements.txt              # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Dark navy sidebar navigation
│   │   │   ├── Header.jsx            # Top navbar with filter pills and demo triggers
│   │   │   ├── MetricCard.jsx        # Reusable financial KPI card
│   │   │   ├── AtmDetailDrawer.jsx   # Slide-over panel for ATM drill-down
│   │   │   ├── DemoGuideModal.jsx    # Interactive 7-step presentation guide
│   │   │   └── SchemaModal.jsx       # Visual Star Schema diagram & SQL viewer
│   │   ├── pages/
│   │   │   ├── OverviewPage.jsx      # Overview dashboard with Recharts
│   │   │   ├── AtmExplorerPage.jsx   # Searchable & filterable ATM directory
│   │   │   ├── AnalyticsPage.jsx     # City comparison & performance rankings
│   │   │   ├── DataManagementPage.jsx# Drag-and-drop CSV validator & ETL preview
│   │   │   └── ReportsPage.jsx       # Print-ready report & CSV exporter
│   │   ├── context/
│   │   │   └── DataContext.jsx       # Central state, PapaParse CSV loader, filter engine
│   │   ├── data/
│   │   │   └── defaultSampleData.js  # Embedded dataset for zero-config offline mode
│   │   ├── App.jsx
│   │   └── index.css                 # Tailwind CSS & print styles
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 6. How to Run the Application

The system is designed with **zero-breakage tolerance**:
* **Standalone Frontend Mode:** Runs immediately out of the box with embedded sample data and client-side CSV parsing.
* **Full Stack Mode:** Connects to the FastAPI backend and PostgreSQL or SQLite database.

### Quick Start 1: Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

### Quick Start 2: Backend (FastAPI)
In a separate terminal:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation (Swagger UI) is available at: **`http://127.0.0.1:8000/docs`**

---

### Quick Start 3: Connecting to PostgreSQL (Optional)
1. Create a database in PostgreSQL:
   ```sql
   CREATE DATABASE atm_datamart;
   ```
2. Execute the schema script:
   ```bash
   psql -U postgres -d atm_datamart -f database/schema.sql
   ```
3. Set your connection URL environment variable:
   ```bash
   # Windows PowerShell:
   $env:DATABASE_URL="postgresql://postgres:your_password@localhost:5432/atm_datamart"

   # Linux/macOS:
   export DATABASE_URL="postgresql://postgres:your_password@localhost:5432/atm_datamart"
   ```
4. Run the ETL script to populate PostgreSQL:
   ```bash
   python database/etl_import.py data/atm_transactions_sample.csv
   ```
   *(Or pass your 30,156-row `atm_transactions.csv` file).*

---

## 7. College Demonstration Workflow (Presentation Script)

Follow these 7 steps during your viva or project presentation. You can also click the **"Demo Guide"** button in the dashboard to execute each step automatically:

1. **Step 1: Open the Overview Dashboard**
   * *Demonstrate:* Key KPIs (Total ATMs, Reported Income, Outcome, Transactions, Reported Balance).
   * *Talking Point:* Explain the difference between raw row sum and de-duplicated unique ATM balance.
2. **Step 2: Show Dataset & Record Count**
   * *Demonstrate:* Navigate to **Data Management**. Show the active file name and record count.
   * *Talking Point:* Highlight the 12/12 validated schema columns and the ETL pipeline mapping into dimensions.
3. **Step 3: Search for an ATM**
   * *Demonstrate:* Open **ATM Explorer**, type `atm350000`, and click **Inspect**.
   * *Talking Point:* Show the slide-over drawer with day-of-week breakdown and reported cash level.
4. **Step 4: Filter Data by City**
   * *Demonstrate:* In ATM Explorer, select `Chicago` or `New York` from the city dropdown.
   * *Talking Point:* Explain how dimension filtering slices the underlying fact records.
5. **Step 5: Compare Income and Outcome**
   * *Demonstrate:* Navigate to **Transaction Analytics**. Examine the grouped bar chart comparing income (deposits) vs outcome (withdrawals).
   * *Talking Point:* Discuss ATM cash replenishment and bank liquidity balancing.
6. **Step 6: Display Top 10 ATMs by Income**
   * *Demonstrate:* Show the Leaderboard ranking the top 10 ATMs by income, cash outflow, or transaction volume.
   * *Talking Point:* Explain how branch managers prioritize cash servicing for top nodes.
7. **Step 7: Export and Print Report**
   * *Demonstrate:* Navigate to **Reports & Export**, click **Print Report / Save PDF** or **Export CSV**.
   * *Talking Point:* Show the audit trail with report date, applied filters, and academic sign-off blocks.

---

## 8. College Viva Q&A Quick Reference

**Q1: Why is this called a Data Mart instead of an OLTP database?**  
*Answer:* OLTP (Online Transaction Processing) databases record individual live transactions one by one with heavy row-level locking. A Data Mart is a subset of an analytical data warehouse organized in a dimensional Star Schema, optimized for high-speed read queries, aggregations, and business intelligence.

**Q2: Why is there no calendar date in your star schema?**  
*Answer:* The source dataset provides only weekday names (`Wednesday`) and snapshot times (`00:00:00`), but no historical calendar date. Fabricating dates would compromise data integrity. We therefore modeled temporal behavior via `dim_day` and `dim_time`. A prospective `dim_date` is defined in `schema.sql` for when real calendar timestamps become available.

**Q3: How did you avoid double-counting ATM balances?**  
*Answer:* Because the dataset contains repeated summary rows for the same ATM over multiple days and times, summing `totalBalance` across all rows would artificially multiply the reported bank cash. Our system computes network balance using the latest reported balance snapshot per unique ATM identifier.
