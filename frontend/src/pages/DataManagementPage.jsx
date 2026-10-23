import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  Layers,
  ArrowRight,
  Info,
  Server
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { REQUIRED_COLUMNS } from '../data/defaultSampleData';

export default function DataManagementPage() {
  const {
    data,
    datasetMeta,
    dataSource,
    handleCsvUpload,
    resetToSampleData,
    backendStatus,
    backendUrl
  } = useData();

  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // File drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMessage("Invalid file format. Please upload an 'atm_transactions.csv' file.");
      setSuccessMessage(null);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    handleCsvUpload(
      file,
      (count) => {
        setIsProcessing(false);
        setSuccessMessage(`Successfully imported and validated ${count.toLocaleString()} rows from "${file.name}"!`);
      },
      (error) => {
        setIsProcessing(false);
        setErrorMessage(error);
      }
    );
  };

  const loadExternalSampleCsv = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch('/atm_transactions_sample.csv');
      if (!response.ok) throw new Error("Could not fetch sample CSV file.");
      const text = await response.text();
      const file = new File([text], "atm_transactions_sample.csv", { type: "text/csv" });
      handleCsvUpload(
        file,
        (count) => {
          setIsProcessing(false);
          setSuccessMessage(`Successfully ingested and validated ${count.toLocaleString()} rows from "atm_transactions_sample.csv"!`);
        },
        (err) => {
          setIsProcessing(false);
          setErrorMessage(err);
        }
      );
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(err.message);
    }
  };

  // Preview the first 12 rows
  const previewRows = data.slice(0, 12);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Upload Zone & Dataset Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CSV Dropzone (Takes 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <UploadCloud className="w-4 h-4 mr-2 text-blue-600" />
                Upload Dataset (atm_transactions.csv)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your project dataset (e.g. 30,156 rows) to populate the analytics data mart
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={loadExternalSampleCsv}
                disabled={isProcessing}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                title="Loads the 450-row realistic sample CSV file"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Load 450-Row CSV</span>
              </button>
              <button
                onClick={resetToSampleData}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Drag and drop <span className="text-blue-600">atm_transactions.csv</span> here
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              or click to browse your computer
            </p>
            <div className="mt-3 inline-flex items-center text-[11px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              Client-side validation • Zero data loss • Instant parsing
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-xs text-rose-800 animate-in fade-in">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Schema Validation Error:</strong>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Import Complete:</strong>
                <p className="mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Dataset Metadata & Column Validator (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <FileCheck2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                Active Dataset Metadata
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Validated
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">File Name:</span>
                <span className="font-mono font-semibold text-slate-800">{datasetMeta.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Rows:</span>
                <span className="font-bold text-blue-600 text-sm">{datasetMeta.rowCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Import Source:</span>
                <span className="font-medium text-slate-800">
                  {dataSource === 'sample' ? 'Default Embedded' : 'User Uploaded CSV'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Validation Status:</span>
                <span className="text-emerald-600 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  12/12 Columns Match
                </span>
              </div>
            </div>

            {/* Required Column Checklist */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Mandatory Schema Columns
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-600">
                {REQUIRED_COLUMNS.map((col) => (
                  <div key={col} className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{col}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Backend link info */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-500">
            <span className="flex items-center">
              <Server className="w-3.5 h-3.5 mr-1 text-slate-400" />
              FastAPI Status:
            </span>
            <span className={`font-semibold ${backendStatus === 'connected' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {backendStatus === 'connected' ? 'Online (:8000)' : 'Client-Side Mode'}
            </span>
          </div>
        </div>

      </div>

      {/* Star Schema Dimensional Mapping Card */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700/80 gap-2">
          <div>
            <h4 className="text-sm font-bold flex items-center text-white">
              <Layers className="w-4 h-4 mr-2 text-blue-400" />
              ETL Data Pipeline & Star Schema Ingestion
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              How the 12 source columns decompose into Normalized Star Dimensions and the Fact Table
            </p>
          </div>
          <span className="text-xs font-mono text-blue-300 bg-blue-900/50 px-2 py-1 rounded border border-blue-500/30">
            College DW Design
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="text-blue-400 font-bold mb-1">1. dim_atm</div>
            <div className="text-slate-300 text-[11px] space-y-0.5">
              <div>• atmId ➔ atm_id (PK/UK)</div>
              <div>• atmName ➔ atm_name</div>
              <div>• atmAddress ➔ atm_address</div>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="text-emerald-400 font-bold mb-1">2. dim_location</div>
            <div className="text-slate-300 text-[11px] space-y-0.5">
              <div>• atmCity ➔ city_name</div>
              <div>• De-duplicated city grouping</div>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="text-purple-400 font-bold mb-1">3. dim_day & dim_time</div>
            <div className="text-slate-300 text-[11px] space-y-0.5">
              <div>• day ➔ day_name (Mon..Sun)</div>
              <div>• transactionTime ➔ time (HH:MM)</div>
              <div>• (Preserves no-fake-dates rule)</div>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="text-amber-400 font-bold mb-1">4. fact_atm_summary</div>
            <div className="text-slate-300 text-[11px] space-y-0.5">
              <div>• totalBalance</div>
              <div>• totalIncome & totalOutcome</div>
              <div>• numberIncome/OutcomeTx</div>
              <div>• totalNumberTransaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Raw Data Preview (First 12 Rows)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect loaded schema values and verify formatting
            </p>
          </div>
          <span className="text-xs text-slate-500">
            Showing 12 of {data.length.toLocaleString()} rows
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs divide-y divide-slate-100 font-mono">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 font-semibold">
              <tr>
                <th className="py-2.5 px-3">atmId</th>
                <th className="py-2.5 px-3">atmName</th>
                <th className="py-2.5 px-3">atmCity</th>
                <th className="py-2.5 px-3">atmAddress</th>
                <th className="py-2.5 px-3 text-right">totalBalance</th>
                <th className="py-2.5 px-3 text-right">numIncTx</th>
                <th className="py-2.5 px-3 text-right">numOutTx</th>
                <th className="py-2.5 px-3 text-right">totalIncome</th>
                <th className="py-2.5 px-3 text-right">totalOutcome</th>
                <th className="py-2.5 px-3 text-right">totalTx</th>
                <th className="py-2.5 px-3">day</th>
                <th className="py-2.5 px-3">transactionTime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-blue-600">{row.atmId}</td>
                  <td className="py-2 px-3 truncate max-w-[140px] font-sans">{row.atmName}</td>
                  <td className="py-2 px-3 font-sans">{row.atmCity}</td>
                  <td className="py-2 px-3 truncate max-w-[150px] font-sans text-slate-500">{row.atmAddress}</td>
                  <td className="py-2 px-3 text-right">${Number(row.totalBalance).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-emerald-600">{row.numberIncomeTransaction}</td>
                  <td className="py-2 px-3 text-right text-rose-600">{row.numberOutcomeTransaction}</td>
                  <td className="py-2 px-3 text-right text-emerald-600">${Number(row.totalIncome).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right text-rose-600">${Number(row.totalOutcome).toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800">{row.totalNumberTransaction}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-700">{row.day}</td>
                  <td className="py-2 px-3 text-slate-500">{row.transactionTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
