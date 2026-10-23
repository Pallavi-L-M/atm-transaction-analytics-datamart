import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Filter,
  ArrowUpDown,
  Building2,
  ChevronRight,
  FilterX,
  Eye,
  DollarSign,
  Activity
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AtmExplorerPage() {
  const {
    analyticsSummary,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    availableCities,
    setSelectedAtmId,
    resetFilters
  } = useData();

  const [sortField, setSortField] = useState('totalIncome'); // 'totalIncome' | 'totalOutcome' | 'totalTransactions' | 'latestBalance' | 'atmId'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Sorting
  const sortedAtms = useMemo(() => {
    const list = [...analyticsSummary.uniqueAtmsList];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? (valA - valB) : (valB - valA);
    });
    return list;
  }, [analyticsSummary.uniqueAtmsList, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedAtms.length / rowsPerPage) || 1;
  const paginatedAtms = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedAtms.slice(start, start + rowsPerPage);
  }, [sortedAtms, currentPage, rowsPerPage]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const hasFilter = searchQuery.trim() !== '' || selectedCity !== 'ALL';

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Search and Filter Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ATM ID (e.g. atm350000) or Name..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* City Filter & Reset Actions */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label htmlFor="explorer-city-filter" className="text-xs font-semibold text-slate-600 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                City:
              </label>
              <select
                id="explorer-city-filter"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Cities ({availableCities.length})</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {hasFilter && (
              <button
                onClick={() => {
                  resetFilters();
                  setCurrentPage(1);
                }}
                className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{sortedAtms.length}</strong> matching ATMs (out of {analyticsSummary.atmCount} unique in current dataset)
          </span>
          <span className="text-slate-400">
            Click any column header to sort • Click 'Inspect' to open the ATM detail drawer
          </span>
        </div>
      </div>

      {/* Main ATM Explorer Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => toggleSort('atmId')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>ATM ID</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('atmName')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>ATM Name & Address</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('atmCity')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>City</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('latestBalance')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Reported Balance</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('totalIncome')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Reported Income</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('totalOutcome')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Reported Outcome</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('totalTransactions')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100 select-none"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Transactions</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">
                  Detail Panel
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {paginatedAtms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No matching ATMs found</p>
                    <p className="text-xs text-slate-400 mt-1">Try relaxing your search query or city filter</p>
                  </td>
                </tr>
              ) : (
                paginatedAtms.map((atm) => (
                  <tr
                    key={atm.atmId}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedAtmId(atm.atmId)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {atm.atmId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {atm.atmName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {atm.atmAddress}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        {atm.atmCity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                      ${atm.latestBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      ${atm.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                      ${atm.totalOutcome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">
                        {atm.totalTransactions.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedAtmId(atm.atmId)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {sortedAtms.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-medium"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
