import React from 'react';
import {
  LayoutDashboard,
  Search,
  BarChart3,
  Database,
  FileText,
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Sidebar({ activePage, setActivePage, openSchemaModal }) {
  const {
    datasetMeta,
    dataSource,
    backendStatus,
    setDemoGuideOpen
  } = useData();

  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'atm-explorer', label: 'ATM Explorer', icon: Search },
    { id: 'analytics', label: 'Transaction Analytics', icon: BarChart3 },
    { id: 'data-management', label: 'Data Management', icon: Database },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none text-slate-300">
      
      {/* Top Branding Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                ATM Analytics
              </h1>
              <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">
                Data Mart Prototype
              </span>
            </div>
          </div>
          <div className="mt-3 px-2 py-1 bg-slate-800/60 rounded-md border border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
            <span>Project: B.Tech / MCA</span>
            <span className="text-blue-400 font-mono text-[10px]">v1.0</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Core Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Interactive College Demo & Schema Trigger Buttons */}
        <div className="p-3 space-y-2 border-t border-slate-800/80">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Presentation Tools
          </div>
          
          <button
            onClick={() => setDemoGuideOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 text-blue-200 hover:bg-blue-800/40 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-blue-400" />
              <span>College Demo Guide</span>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-500 text-white animate-pulse">
              7 Steps
            </span>
          </button>

          <button
            onClick={openSchemaModal}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 transition-colors"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Star Schema (SQL)</span>
          </button>
        </div>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="text-[11px] space-y-2">
          
          {/* Dataset Status */}
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
              Dataset:
            </span>
            <span className="font-semibold text-slate-200">
              {datasetMeta.rowCount.toLocaleString()} rows
            </span>
          </div>

          {/* Mode */}
          <div className="flex items-center justify-between text-slate-400">
            <span>Source:</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
              {dataSource === 'sample' ? 'Sample Data' : 'CSV Uploaded'}
            </span>
          </div>

          {/* Backend Status */}
          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
            <span>FastAPI Backend:</span>
            <span className={`inline-flex items-center text-[10px] font-medium ${
              backendStatus === 'connected' ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                backendStatus === 'connected' ? 'bg-emerald-400' : 'bg-slate-500'
              }`} />
              {backendStatus === 'connected' ? 'Online' : 'Offline (Client Mode)'}
            </span>
          </div>

        </div>
      </div>

    </aside>
  );
}
