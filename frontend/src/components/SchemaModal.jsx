import React, { useState } from 'react';
import { X, Database, Layers, Key, Table2, Info, Check, Copy } from 'lucide-react';

export default function SchemaModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('diagram');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- PostgreSQL Star Schema for ATM Transaction Analytics Data Mart
CREATE TABLE dim_atm (
    atm_key SERIAL PRIMARY KEY,
    atm_id VARCHAR(50) UNIQUE NOT NULL,
    atm_name VARCHAR(150) NOT NULL,
    atm_address VARCHAR(255)
);

CREATE TABLE dim_location (
    location_key SERIAL PRIMARY KEY,
    city_name VARCHAR(100) UNIQUE NOT NULL,
    state_region VARCHAR(100) DEFAULT 'Domestic Zone'
);

CREATE TABLE dim_day (
    day_key SERIAL PRIMARY KEY,
    day_name VARCHAR(20) UNIQUE NOT NULL,
    day_number_in_week SMALLINT NOT NULL,
    is_weekend BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE dim_time (
    time_key SERIAL PRIMARY KEY,
    transaction_time TIME UNIQUE NOT NULL,
    hour_of_day SMALLINT NOT NULL,
    minute_of_hour SMALLINT NOT NULL,
    period_of_day VARCHAR(20) NOT NULL
);

CREATE TABLE fact_atm_summary (
    fact_id BIGSERIAL PRIMARY KEY,
    atm_key INT NOT NULL REFERENCES dim_atm(atm_key),
    location_key INT NOT NULL REFERENCES dim_location(location_key),
    day_key INT NOT NULL REFERENCES dim_day(day_key),
    time_key INT NOT NULL REFERENCES dim_time(time_key),
    total_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    number_income_transaction INT NOT NULL DEFAULT 0,
    number_outcome_transaction INT NOT NULL DEFAULT 0,
    total_income NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_outcome NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_number_transaction INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Data Mart Star Schema Architecture</h3>
              <p className="text-xs text-slate-400">
                Dimensional Model: 4 Dimensions + 1 Central Fact Table
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 bg-slate-100 border-b border-slate-200 flex space-x-4">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'diagram'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Visual Star Schema & Relationships
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            PostgreSQL DDL (schema.sql)
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Date & Semantics Architecture Note
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'diagram' && (
            <div className="space-y-6">
              
              {/* Star Schema Interactive Visual Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                
                {/* Left Dimensions */}
                <div className="space-y-4">
                  {/* Dim ATM */}
                  <div className="bg-blue-50/70 border-2 border-blue-200 rounded-xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-200">
                      <span className="text-xs font-bold text-blue-900 flex items-center">
                        <Table2 className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
                        dim_atm (Dimension)
                      </span>
                      <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 rounded font-mono">PK: atm_key</span>
                    </div>
                    <ul className="text-xs space-y-1 text-slate-700 font-mono">
                      <li>• <strong className="text-blue-800">atm_key</strong> (SERIAL, PK)</li>
                      <li>• atm_id (VARCHAR: 'atm350000')</li>
                      <li>• atm_name (VARCHAR)</li>
                      <li>• atm_address (VARCHAR)</li>
                    </ul>
                  </div>

                  {/* Dim Location */}
                  <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200">
                      <span className="text-xs font-bold text-emerald-900 flex items-center">
                        <Table2 className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                        dim_location (Dimension)
                      </span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 rounded font-mono">PK: location_key</span>
                    </div>
                    <ul className="text-xs space-y-1 text-slate-700 font-mono">
                      <li>• <strong className="text-emerald-800">location_key</strong> (SERIAL, PK)</li>
                      <li>• city_name (VARCHAR: 'Chicago')</li>
                      <li>• state_region (VARCHAR)</li>
                    </ul>
                  </div>
                </div>

                {/* Central Fact Table */}
                <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 shadow-md text-center">
                  <div className="flex items-center justify-center space-x-1.5 pb-2 mb-2 border-b border-amber-300">
                    <Key className="w-4 h-4 text-amber-700" />
                    <span className="text-sm font-black text-amber-950 uppercase tracking-wide">
                      fact_atm_summary
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900 mb-2 font-medium">
                    Central Granular Summary Fact Table
                  </p>
                  <div className="text-left bg-white rounded-lg p-2.5 border border-amber-200 text-xs font-mono space-y-1 text-slate-800 max-h-56 overflow-y-auto">
                    <div className="text-amber-800 font-bold border-b pb-1">Foreign Keys:</div>
                    <div className="text-blue-700">FK1: atm_key → dim_atm</div>
                    <div className="text-emerald-700">FK2: location_key → dim_location</div>
                    <div className="text-purple-700">FK3: day_key → dim_day</div>
                    <div className="text-indigo-700">FK4: time_key → dim_time</div>
                    <div className="text-slate-500 italic">FK5: date_key (Nullable)</div>
                    <div className="text-amber-800 font-bold border-b pt-1 pb-1">Measures / Aggregates:</div>
                    <div>+ total_balance (NUMERIC)</div>
                    <div>+ number_income_tx (INT)</div>
                    <div>+ number_outcome_tx (INT)</div>
                    <div>+ total_income (NUMERIC)</div>
                    <div>+ total_outcome (NUMERIC)</div>
                    <div>+ total_number_tx (INT)</div>
                  </div>
                </div>

                {/* Right Dimensions */}
                <div className="space-y-4">
                  {/* Dim Day */}
                  <div className="bg-purple-50/70 border-2 border-purple-200 rounded-xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-200">
                      <span className="text-xs font-bold text-purple-900 flex items-center">
                        <Table2 className="w-3.5 h-3.5 mr-1.5 text-purple-700" />
                        dim_day (Dimension)
                      </span>
                      <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 rounded font-mono">PK: day_key</span>
                    </div>
                    <ul className="text-xs space-y-1 text-slate-700 font-mono">
                      <li>• <strong className="text-purple-800">day_key</strong> (SERIAL, PK)</li>
                      <li>• day_name (VARCHAR: 'Wednesday')</li>
                      <li>• day_number_in_week (1..7)</li>
                      <li>• is_weekend (BOOLEAN)</li>
                    </ul>
                  </div>

                  {/* Dim Time */}
                  <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-xl p-3.5 shadow-sm">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-200">
                      <span className="text-xs font-bold text-indigo-900 flex items-center">
                        <Table2 className="w-3.5 h-3.5 mr-1.5 text-indigo-700" />
                        dim_time (Dimension)
                      </span>
                      <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 rounded font-mono">PK: time_key</span>
                    </div>
                    <ul className="text-xs space-y-1 text-slate-700 font-mono">
                      <li>• <strong className="text-indigo-800">time_key</strong> (SERIAL, PK)</li>
                      <li>• transaction_time (TIME: '00:00:00')</li>
                      <li>• hour_of_day (0..23)</li>
                      <li>• period_of_day ('Morning', etc.)</li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* Data Mart Pipeline Flow */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
                <span className="font-bold text-slate-900">ETL Ingestion Pipeline: </span>
                <span><code>atm_transactions.csv</code> (30,156 rows) ➔ Python ETL / Data Loader ➔ Upsert unique ATMs to <code>dim_atm</code> ➔ Upsert cities to <code>dim_location</code> ➔ Upsert times to <code>dim_time</code> ➔ Insert fact rows with surrogate keys into <code>fact_atm_summary</code>.</span>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="relative">
              <button
                onClick={copySql}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
              </button>
              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-[60vh]">
                {sqlCode}
              </pre>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <h4 className="font-bold text-amber-900 text-sm mb-1">
                  Integrity Guarantee: Handling Real Dates vs. Day-of-Week
                </h4>
                <p className="text-amber-800">
                  The dataset contains column <code>day</code> ('Wednesday') and <code>transactionTime</code> ('00:00:00'), but no calendar date (e.g., 2026-05-14). In strict accordance with the project constraints, our Data Mart does <strong>not</strong> invent artificial calendar dates. Instead, we model temporal behavior through <code>dim_day</code> and <code>dim_time</code>, allowing accurate behavioral analysis of weekday patterns and hourly peak times.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                <h4 className="font-bold text-blue-900 text-sm mb-1">
                  Avoiding Double-Counting in Reported Balances
                </h4>
                <p className="text-blue-800">
                  Each ATM has multiple summary records reflecting different days and time periods. Summing <code>totalBalance</code> across all records would artificially inflate the total network cash. Our data mart computes <em>Reported ATM Balance</em> by evaluating the latest reported snapshot for each unique ATM, while also providing the aggregate sum for snapshot volume audits.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  Location Dimension Semantics
                </h4>
                <p className="text-slate-600">
                  <code>atmCity</code> represents a geographic distribution cluster. It does not imply a single bank branch location. The schema maintains <code>dim_location</code> independently from <code>dim_atm</code> to support future expansion into states, zip codes, and regional zones.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Schema File: <code className="text-blue-700 font-semibold">database/schema.sql</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg"
          >
            Close Schema View
          </button>
        </div>

      </div>
    </div>
  );
}
