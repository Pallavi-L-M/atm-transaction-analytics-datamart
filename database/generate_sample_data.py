"""
Generates an authentic Indian ATM dataset for the ATM Transaction Analytics Data Mart.
Adheres strictly to the 12 columns specified by user:
- atmId
- atmName
- atmCity
- atmAddress
- totalBalance
- numberIncomeTransaction
- numberOutcomeTransaction
- totalIncome
- totalOutcome
- totalNumberTransaction
- day
- transactionTime
"""

import csv
import json
import random
import os

INDIAN_ATMS = [
    ("atm350000", "SBI ATM - MG Road Metro", "Bengaluru", "MG Road Metro Station Concourse, Bengaluru"),
    ("atm350001", "HDFC Bank ATM - Indiranagar", "Bengaluru", "100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru"),
    ("atm350002", "ICICI Bank ATM - Koramangala", "Bengaluru", "80 Feet Road, 4th Block, Koramangala, Bengaluru"),
    ("atm350003", "Axis Bank ATM - Whitefield", "Bengaluru", "ITPL Main Road, Whitefield, Bengaluru"),
    ("atm350004", "SBI ATM - Connaught Place", "Delhi", "Inner Circle, Block A, Connaught Place, New Delhi"),
    ("atm350005", "PNB ATM - Chandni Chowk", "Delhi", "Main Market, Near Gurudwara, Chandni Chowk, Delhi"),
    ("atm350006", "HDFC Bank ATM - Nehru Place", "Delhi", "Eros Corporate Tower, Nehru Place, New Delhi"),
    ("atm350007", "SBI ATM - Nariman Point", "Mumbai", "Free Press Journal Marg, Nariman Point, Mumbai"),
    ("atm350008", "ICICI Bank ATM - Bandra West", "Mumbai", "Hill Road, Opp. Marks & Spencer, Bandra West, Mumbai"),
    ("atm350009", "Bank of Baroda ATM - Andheri East", "Mumbai", "Chakala, Andheri-Kurla Road, Andheri East, Mumbai"),
    ("atm350010", "Kotak Mahindra ATM - BKC", "Mumbai", "G Block, Bandra Kurla Complex, Mumbai"),
    ("atm350011", "SBI ATM - Hitec City Cyber Towers", "Hyderabad", "Cyber Towers Concourse, Hitec City, Hyderabad"),
    ("atm350012", "HDFC Bank ATM - Banjara Hills", "Hyderabad", "Road No. 12, Banjara Hills, Hyderabad"),
    ("atm350013", "Canara Bank ATM - Secunderabad", "Hyderabad", "Station Road, Clock Tower, Secunderabad"),
    ("atm350014", "SBI ATM - T Nagar", "Chennai", "Usman Road, Panagal Park, T Nagar, Chennai"),
    ("atm350015", "Indian Bank ATM - Anna Nagar", "Chennai", "2nd Avenue, Roundtana, Anna Nagar, Chennai"),
    ("atm350016", "HDFC Bank ATM - OMR IT Corridor", "Chennai", "Rajiv Gandhi Salai, Thoraipakkam, Chennai"),
    ("atm350017", "SBI ATM - Park Street", "Kolkata", "Park Street Crossing, Central Kolkata, Kolkata"),
    ("atm350018", "PNB ATM - Salt Lake Sector V", "Kolkata", "Electronics Complex, Sector V, Salt Lake, Kolkata"),
    ("atm350019", "SBI ATM - FC Road", "Pune", "Fergusson College Road, Shivajinagar, Pune"),
    ("atm350020", "HDFC Bank ATM - Hinjewadi IT Park", "Pune", "Phase 1, Rajiv Gandhi Infotech Park, Hinjewadi, Pune"),
    ("atm350021", "SBI ATM - CG Road", "Ahmedabad", "CG Road, Navrangpura, Ahmedabad"),
    ("atm350022", "Bank of Baroda ATM - SG Highway", "Ahmedabad", "SG Highway, Bodakdev, Ahmedabad"),
    ("atm350023", "SBI ATM - MI Road", "Jaipur", "MI Road, Near Panch Batti, Jaipur"),
    ("atm350024", "SBI ATM - MG Road", "Kochi", "MG Road, Ernakulam North, Kochi"),
]

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

TIMES = [
    "00:00:00", "01:30:00", "03:00:00", "06:00:00", "07:30:00", "09:00:00",
    "10:15:00", "11:30:00", "13:00:00", "14:15:00", "15:45:00", "17:00:00",
    "18:30:00", "19:45:00", "21:00:00", "22:15:00", "23:00:00", "23:45:00"
]

def generate_indian_atm_dataset(num_records=450):
    random.seed(42)
    rows = []

    # Realistic base vault balance per ATM in INR (between 8 Lakhs to 24 Lakhs)
    atm_base_balances = {
        atm[0]: round(random.uniform(850000.0, 2450000.0), 2) for atm in INDIAN_ATMS
    }

    for _ in range(num_records):
        atm = random.choice(INDIAN_ATMS)
        atm_id, atm_name, atm_city, atm_address = atm

        day = random.choice(DAYS)
        transaction_time = random.choice(TIMES)

        # Deposit counts (Cash Acceptor / CDM) vs Withdrawal counts
        num_income = random.randint(5, 45)
        num_outcome = random.randint(20, 160)
        total_tx = num_income + num_outcome

        # Financial values in INR (₹)
        # Average deposit per CDM transaction: ₹3,000 - ₹15,000
        total_income = round(num_income * random.uniform(3200.0, 12500.0), 2)
        # Average cash withdrawal per transaction: ₹1,000 - ₹4,500 (standard Indian ATM ticket)
        total_outcome = round(num_outcome * random.uniform(1200.0, 4800.0), 2)

        current_balance = round(
            max(150000.0, atm_base_balances[atm_id] + (total_income * 0.15) - (total_outcome * 0.2) + random.uniform(-15000, 15000)),
            2
        )

        rows.append({
            "atmId": atm_id,
            "atmName": atm_name,
            "atmCity": atm_city,
            "atmAddress": atm_address,
            "totalBalance": current_balance,
            "numberIncomeTransaction": num_income,
            "numberOutcomeTransaction": num_outcome,
            "totalIncome": total_income,
            "totalOutcome": total_outcome,
            "totalNumberTransaction": total_tx,
            "day": day,
            "transactionTime": transaction_time
        })

    return rows

def save_csv(rows, target_path):
    os.makedirs(os.path.dirname(os.path.abspath(target_path)), exist_ok=True)
    fieldnames = [
        "atmId", "atmName", "atmCity", "atmAddress",
        "totalBalance", "numberIncomeTransaction", "numberOutcomeTransaction",
        "totalIncome", "totalOutcome", "totalNumberTransaction",
        "day", "transactionTime"
    ]
    with open(target_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Saved {len(rows)} records to {target_path}")

def generate_js_sample(rows, js_target_path):
    os.makedirs(os.path.dirname(os.path.abspath(js_target_path)), exist_ok=True)
    # Use first 35 rows for embedded quick load to keep bundle snappy, while preserving all cities & ATMs
    sample_rows = rows[:35]
    
    js_content = """/**
 * Preloaded realistic Indian dataset for the ATM Transaction Analytics Data Mart.
 * Strictly adheres to 12 columns:
 * atmId, atmName, atmCity, atmAddress, totalBalance,
 * numberIncomeTransaction, numberOutcomeTransaction,
 * totalIncome, totalOutcome, totalNumberTransaction, day, transactionTime
 */

export const REQUIRED_COLUMNS = [
  "atmId",
  "atmName",
  "atmCity",
  "atmAddress",
  "totalBalance",
  "numberIncomeTransaction",
  "numberOutcomeTransaction",
  "totalIncome",
  "totalOutcome",
  "totalNumberTransaction",
  "day",
  "transactionTime"
];

export const DEFAULT_SAMPLE_DATA = """ + json.dumps(sample_rows, indent=2) + ";\n"

    with open(js_target_path, mode="w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"Saved JS sample module to {js_target_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(base_dir, ".."))

    dataset = generate_indian_atm_dataset(450)

    # 1. Save data/atm_transactions_sample.csv
    csv_path = os.path.join(project_root, "data", "atm_transactions_sample.csv")
    save_csv(dataset, csv_path)

    # 2. Save frontend/public/atm_transactions_sample.csv
    public_csv_path = os.path.join(project_root, "frontend", "public", "atm_transactions_sample.csv")
    save_csv(dataset, public_csv_path)

    # 3. Save frontend/src/data/defaultSampleData.js
    js_path = os.path.join(project_root, "frontend", "src", "data", "defaultSampleData.js")
    generate_js_sample(dataset, js_path)
