import React from 'react';
import { Award, Database, FilterX, HelpCircle, HardDrive } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Header({ activePage, openSchemaModal }) {
  const {
    datasetMeta,
    selectedCity,
    searchQuery,
    selectedDay,
    resetFilters,
    setDemoGuideOpen
  } = useData();

  const titleMap = {
    'overview': { title: 'Overview Dashboard', subtitle: 'Network performance, liquidity, and summary aggregates' },
    'atm-explorer': { title: 'ATM Explorer', subtitle: 'Search, geographic filter, and granular ATM inspection' },
    'analytics': { title: 'Transaction Analytics', subtitle: 'Comparative volume, cash flow, and performance rankings' },
    'data-management': { title: 'Data Management & Ingestion', subtitle: 'CSV schema validation, row count verification, and Star Schema ETL' },
    'reports': { title: 'Reports & Export', subtitle: 'Filterable data export, audit logs, and printable analytics report' },
  };

  const current = titleMap[activePage] || { title: 'ATM Analytics Data Mart', subtitle: 'Financial Dashboard' };
  const hasActiveFilters = selectedCity !== 'ALL' || selectedDay !== 'ALL' || searchQuery.trim() !== '';

  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-4 sticky top-0 z-30 flex items-center justify-between">
      
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {current.title}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            {datasetMeta.rowCount.toLocaleString()} Records Active
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {current.subtitle}
        </p>
      </div>

      {/* Action Buttons & Badges */}
      <div className="flex items-center space-x-3">
        
        {/* Reset Filter Pill if filters active */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Reset Active Filters</span>
          </button>
        )}

        {/* Data Mart Schema Button */}
        <button
          onClick={openSchemaModal}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
        >
          <Database className="w-3.5 h-3.5 text-slate-600" />
          <span>Star Schema</span>
        </button>

        {/* College Demo Guide Trigger Button */}
        <button
          onClick={() => setDemoGuideOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all"
        >
          <Award className="w-4 h-4 text-white" />
          <span>Demo Guide</span>
        </button>

      </div>

    </header>
  );
}
