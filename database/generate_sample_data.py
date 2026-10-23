"""
Generates a realistic sample dataset for the ATM Transaction Analytics Data Mart.
Strictly adheres to the 12 columns specified by the user:
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
import random

ATMS = [
    ("atm350000", "Downtown Metro Branch ATM", "New York", "120 Broadway Ave, Manhattan"),
    ("atm350001", "Times Square Financial Kiosk", "New York", "7th Ave & W 45th St"),
    ("atm350002", "Grand Central Concourse ATM", "New York", "89 E 42nd St, Midtown"),
    ("atm350003", "Brooklyn Heights Plaza ATM", "New York", "145 Montague St, Brooklyn"),
    ("atm350004", "Michigan Ave Retail Hub ATM", "Chicago", "620 N Michigan Ave"),
    ("atm350005", "Loop Financial Center ATM", "Chicago", "230 S LaSalle St"),
    ("atm350006", "O'Hare Terminal 3 ATM", "Chicago", "10000 W O'Hare Ave"),
    ("atm350007", "Lincoln Park Station ATM", "Chicago", "950 W Fullerton Ave"),
    ("atm350008", "Wilshire Blvd Corporate ATM", "Los Angeles", "11000 Wilshire Blvd, Westwood"),
    ("atm350009", "Downtown LA Arts District ATM", "Los Angeles", "400 S Santa Fe Ave"),
    ("atm350010", "Hollywood Walk Gateway ATM", "Los Angeles", "6801 Hollywood Blvd"),
    ("atm350011", "LAX Departure Level ATM", "Los Angeles", "1 World Way, Westchester"),
    ("atm350012", "Post Oak Galleria Pavilion ATM", "Houston", "5085 Westheimer Rd"),
    ("atm350013", "Texas Medical Center ATM", "Houston", "6550 Fannin St"),
    ("atm350014", "Houston Downtown Tunnel ATM", "Houston", "909 Fannin St"),
    ("atm350015", "Camelback Corridor ATM", "Phoenix", "2400 E Camelback Rd"),
    ("atm350016", "Sky Harbor Terminal 4 ATM", "Phoenix", "3400 E Sky Harbor Blvd"),
    ("atm350017", "Rittenhouse Square ATM", "Philadelphia", "1800 Walnut St"),
    ("atm350018", "Market East Transit ATM", "Philadelphia", "1001 Market St"),
    ("atm350019", "River Walk Commerce ATM", "San Antonio", "300 E Market St"),
    ("atm350020", "Alamo Plaza Tourist Kiosk", "San Antonio", "300 Alamo Plaza"),
    ("atm350021", "Uptown Dallas McKinney ATM", "Dallas", "2500 McKinney Ave"),
    ("atm350022", "DFW Terminal D South ATM", "Dallas", "2333 S International Pkwy"),
    ("atm350023", "Deep Ellum Creative Zone ATM", "Dallas", "2800 Main St"),
    ("atm350024", "Silicon Hills Tech Center ATM", "Austin", "11501 Domain Dr"),
]

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

TIMES = [
    "00:00:00", "01:30:00", "03:00:00", "05:00:00", "07:15:00", "08:30:00",
    "09:45:00", "11:00:00", "12:15:00", "13:30:00", "14:45:00", "16:00:00",
    "17:30:00", "18:45:00", "20:00:00", "21:30:00", "22:45:00", "23:15:00"
]

def generate_sample_csv(output_path="atm_transactions_sample.csv", num_records=400):
    random.seed(42)
    rows = []
    
    # Store persistent base balance per ATM to reflect realistic bank cash level
    atm_base_balances = {
        atm[0]: round(random.uniform(35000.0, 180000.0), 2) for atm in ATMS
    }

    for _ in range(num_records):
        atm = random.choice(ATMS)
        atm_id, atm_name, atm_city, atm_address = atm
        
        day = random.choice(DAYS)
        transaction_time = random.choice(TIMES)
        
        # Transactions: Outcome (withdrawals) are usually higher frequency than income (deposits)
        num_income = random.randint(2, 45)
        num_outcome = random.randint(10, 140)
        total_tx = num_income + num_outcome
        
        # Financial amounts
        # Average deposit per income tx: $150 - $600
        total_income = round(num_income * random.uniform(180.0, 520.0), 2)
        # Average withdrawal per outcome tx: $60 - $220
        total_outcome = round(num_outcome * random.uniform(70.0, 240.0), 2)
        
        # Reported balance in this summary snapshot
        # Slight variation around the ATM's base level
        current_balance = round(
            max(5000.0, atm_base_balances[atm_id] + (total_income * 0.1) - (total_outcome * 0.1) + random.uniform(-1500, 1500)),
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

    fieldnames = [
        "atmId", "atmName", "atmCity", "atmAddress",
        "totalBalance", "numberIncomeTransaction", "numberOutcomeTransaction",
        "totalIncome", "totalOutcome", "totalNumberTransaction",
        "day", "transactionTime"
    ]

    import os
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Successfully generated {len(rows)} records in {output_path}")

if __name__ == "__main__":
    import os
    out_dir = os.path.dirname(os.path.abspath(__file__))
    target = os.path.join(out_dir, "..", "data", "atm_transactions_sample.csv")
    generate_sample_csv(target, 450)
