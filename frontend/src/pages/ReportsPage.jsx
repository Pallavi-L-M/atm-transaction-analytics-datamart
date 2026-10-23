import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  HardDrive
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function ReportsPage() {
  const {
    analyticsSummary,
    selectedCity,
    selectedDay,
    searchQuery,
    datasetMeta,
    exportFilteredDataToCSV
  } = useData();

  const [reportTitle, setReportTitle] = useState('ATM Transaction Analytics Executive Summary');
  const [reportNotes, setReportNotes] = useState('Official analytical audit report generated from the ATM Transaction Analytics Data Mart. All financial values represent reported summary aggregates.');

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-US');

  const {
    totalIncome,
    totalOutcome,
    netCashFlow,
    totalTransactions,
    uniqueAtmReportedBalance,
    atmCount,
    recordCount,
    top10ByIncome,
    citySummaryList
  } = analyticsSummary;

  const appliedFilters = [
    { label: 'City Filter', value: selectedCity === 'ALL' ? 'All Cities' : selectedCity },
    { label: 'Weekday Filter', value: selectedDay === 'ALL' ? 'All Weekdays' : selectedDay },
    { label: 'Search Query', value: searchQuery.trim() ? `"${searchQuery}"` : 'None (All ATMs)' },
    { label: 'Dataset Source', value: `${datasetMeta.fileName} (${datasetMeta.rowCount.toLocaleString()} rows)` }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Action Header (Hidden in Print) */}
      <div className="no-print bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-blue-600" />
            Executive Reports & Data Export
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate printable audit reports or download filtered data mart records as CSV
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportFilteredDataToCSV('atm_filtered_analytics.csv')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/30 rounded-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 print:p-0 print:border-none print:shadow-none space-y-8">
        
        {/* Report Official Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                <HardDrive className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                ATM Transaction Analytics Data Mart
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              Department of Computer Science & Engineering • Data Warehousing Project
            </p>
            <h2 className="text-lg font-bold text-slate-800 mt-3">
              {reportTitle}
            </h2>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1">
            <div>
              <span className="text-slate-400">Report Date: </span>
              <strong>{currentDate}</strong>
            </div>
            <div>
              <span className="text-slate-400">Generated At: </span>
              <strong>{currentTime}</strong>
            </div>
            <div>
              <span className="text-slate-400">Classification: </span>
              <span className="text-blue-700 font-semibold">College Project Prototype</span>
            </div>
          </div>
        </div>

        {/* Applied Filters & Scope Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
          <div className="font-bold text-slate-800 flex items-center mb-2">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Audit Trail & Active Filter Parameters
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
            {appliedFilters.map((f, i) => (
              <div key={i}>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">{f.label}:</span>
                <span className="font-medium text-slate-800">{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Executive KPI Summary Grid */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
            1. Financial & Operational Summary Aggregates
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">ATM Count</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{atmCount} ATMs</div>
              <span className="text-[10px] text-slate-400">Unique nodes</span>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Reported Income</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400">Deposits sum</span>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Reported Outcome</span>
              <div className="text-xl font-bold text-rose-600 mt-1">
                ${totalOutcome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-400">Withdrawals sum</span>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Transactions</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {totalTransactions.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Reported count</span>
            </div>
          </div>
        </div>

        {/* Top 10 ATMs Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              2. Top Performing ATMs by Reported Income
            </h3>
            <span className="text-xs text-slate-400 font-mono">Ranked 1 to {top10ByIncome.length}</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">ATM ID</th>
                  <th className="py-2.5 px-3">ATM Name</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3 text-right">Income ($)</th>
                  <th className="py-2.5 px-3 text-right">Outcome ($)</th>
                  <th className="py-2.5 px-3 text-right">Transactions</th>
                  <th className="py-2.5 px-3 text-right">Reported Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top10ByIncome.map((atm, i) => (
                  <tr key={atm.atmId}>
                    <td className="py-2 px-3 font-bold text-slate-400">{i + 1}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-blue-600">{atm.atmId}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{atm.atmName}</td>
                    <td className="py-2 px-3 text-slate-600">{atm.atmCity}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-600">
                      ${atm.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-rose-600">
                      ${atm.totalOutcome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700">{atm.totalTransactions.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">
                      ${atm.latestBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* City Breakdown Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            3. Geographic Aggregations (dim_location)
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-2 px-3">City Name</th>
                  <th className="py-2 px-3 text-right">Active ATMs</th>
                  <th className="py-2 px-3 text-right">Total Income ($)</th>
                  <th className="py-2 px-3 text-right">Total Outcome ($)</th>
                  <th className="py-2 px-3 text-right">Total Transactions</th>
                  <th className="py-2 px-3 text-right">Record Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citySummaryList.map((c) => (
                  <tr key={c.city}>
                    <td className="py-2 px-3 font-semibold text-slate-900">{c.city}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{c.atmCount}</td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-600">
                      ${c.totalIncome.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-rose-600">
                      ${c.totalOutcome.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700">{c.totalTransactions.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-slate-500">{c.recordCount} rows</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Notes and Sign-off */}
        <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-4">
          <p className="italic">
            {reportNotes}
          </p>

          <div className="grid grid-cols-2 pt-8 text-center text-xs text-slate-600">
            <div>
              <div className="border-t border-slate-300 w-48 mx-auto pt-1 font-semibold text-slate-800">
                Student Presenter
              </div>
              <span className="text-[10px] text-slate-400">Data Mart Engineer</span>
            </div>
            <div>
              <div className="border-t border-slate-300 w-48 mx-auto pt-1 font-semibold text-slate-800">
                Project Evaluator / Faculty Guide
              </div>
              <span className="text-[10px] text-slate-400">Department Reviewer</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
