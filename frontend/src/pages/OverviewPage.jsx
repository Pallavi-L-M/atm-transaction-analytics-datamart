import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Activity,
  Vault,
  MapPin,
  Calendar,
  Clock,
  Info,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { useData } from '../context/DataContext';

export default function OverviewPage({ onSelectAtm }) {
  const {
    analyticsSummary,
    selectedCity,
    setSelectedCity,
    availableCities,
    setSelectedAtmId,
    datasetMeta
  } = useData();

  const [chartView, setChartView] = useState('city'); // 'city' | 'day'
  const [balanceInterpretation, setBalanceInterpretation] = useState('unique'); // 'unique' | 'raw'

  const {
    totalIncome,
    totalOutcome,
    netCashFlow,
    totalTransactions,
    uniqueAtmReportedBalance,
    rawBalanceSum,
    atmCount,
    recordCount,
    top10ByIncome,
    citySummaryList,
    dayDistributionList,
    timeDistributionList
  } = analyticsSummary;

  // Colors for city distribution donut chart
  const CITY_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#6366f1', '#8b5cf6'];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Displaying analytical metrics aggregated from <strong>{recordCount.toLocaleString()}</strong> reported summary rows ({datasetMeta.fileName}).
          </span>
        </div>

        {/* Geographic Quick Filter */}
        <div className="flex items-center space-x-2 shrink-0">
          <label htmlFor="overview-city-filter" className="text-xs font-semibold text-slate-600 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            City Filter:
          </label>
          <select
            id="overview-city-filter"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Cities ({availableCities.length})</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Core Financial KPI Cards (Strictly Following Calculations) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Total ATMs */}
        <MetricCard
          title="Total ATMs"
          value={atmCount.toLocaleString()}
          subtitle="Unique ATM Nodes"
          icon={Building2}
          accentColor="blue"
          badge="dim_atm"
          note="Unique Count"
        />

        {/* Metric 2: Total Reported Income */}
        <MetricCard
          title="Reported Income"
          value={`$${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Sum of reported cash deposits"
          icon={TrendingUp}
          accentColor="emerald"
          badge="Cash Inflow"
          note="totalIncome Sum"
        />

        {/* Metric 3: Total Reported Outcome */}
        <MetricCard
          title="Reported Outcome"
          value={`$${totalOutcome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Sum of reported cash withdrawals"
          icon={TrendingDown}
          accentColor="rose"
          badge="Cash Outflow"
          note="totalOutcome Sum"
        />

        {/* Metric 4: Total Reported Transactions */}
        <MetricCard
          title="Total Transactions"
          value={totalTransactions.toLocaleString()}
          subtitle="Reported transaction count"
          icon={Activity}
          accentColor="violet"
          badge="Activity Count"
          note="totalNumberTx Sum"
        />

        {/* Metric 5: Total Reported ATM Balance */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center">
                Reported Balance
              </span>
              <div className="p-2 rounded-lg border bg-amber-50 text-amber-600 border-amber-200">
                <Vault className="w-5 h-5" />
              </div>
            </div>
            
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              ${(balanceInterpretation === 'unique' ? uniqueAtmReportedBalance : rawBalanceSum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <button
              onClick={() => setBalanceInterpretation(prev => prev === 'unique' ? 'raw' : 'unique')}
              className="text-blue-600 hover:text-blue-800 underline font-medium"
              title="Click to toggle between unique ATM latest balance and raw snapshot row sum"
            >
              {balanceInterpretation === 'unique' ? 'Mode: Unique ATM' : 'Mode: Row Sum'}
            </button>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
              {balanceInterpretation === 'unique' ? 'De-duplicated' : 'All Rows'}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Charts Section: Income vs Outcome Bar Chart & Transaction Volume Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income versus Outcome Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                Reported Income versus Outcome
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison of reported deposit income ($) vs cash withdrawal outflow ($)
              </p>
            </div>

            {/* Toggle chart dimension */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setChartView('city')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  chartView === 'city' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By City
              </button>
              <button
                onClick={() => setChartView('day')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  chartView === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By Day
              </button>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartView === 'city' ? citySummaryList.slice(0, 8) : dayDistributionList}
                margin={{ top: 20, right: 15, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey={chartView === 'city' ? 'city' : 'dayFullName'}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val, name) => [`$${Number(val).toLocaleString()}`, name === 'totalIncome' || name === 'income' ? 'Reported Income' : 'Reported Outcome']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: '12px' }} />
                <Bar
                  dataKey={chartView === 'city' ? 'totalIncome' : 'income'}
                  name="Reported Income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey={chartView === 'city' ? 'totalOutcome' : 'outcome'}
                  name="Reported Outcome"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ATM Transaction Volume Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-indigo-600" />
                ATM Transaction Volume Pattern
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total reported transaction volume across days of the week (Monday - Sunday)
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              dim_day Pattern
            </span>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dayDistributionList}
                margin={{ top: 20, right: 15, left: 10, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="colorTxVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="dayFullName"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                />
                <Tooltip
                  formatter={(val) => [`${Number(val).toLocaleString()} tx`, 'Reported Transactions']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="transactions"
                  name="Transactions"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTxVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Bottom Row: Top 10 ATMs by Reported Income & ATM City Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top 10 ATMs by Reported Income (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Top 10 ATMs by Reported Income
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Highest income-generating ATM nodes across the network
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Ranked 1 to {top10ByIncome.length}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Rank</th>
                  <th className="py-2.5 px-3">ATM ID</th>
                  <th className="py-2.5 px-3">ATM Name</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3 text-right">Reported Income</th>
                  <th className="py-2.5 px-3 text-right">Transactions</th>
                  <th className="py-2.5 px-3 text-center rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {top10ByIncome.map((atm, idx) => (
                  <tr key={atm.atmId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-500">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-600">
                      {atm.atmId}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 truncate max-w-[180px]">
                      {atm.atmName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {atm.atmCity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                      ${atm.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {atm.totalTransactions.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedAtmId(atm.atmId)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center"
                      >
                        Inspect <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ATM City Distribution (Donut Chart & Breakdown) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                ATM City Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Proportion of active ATMs per geographic city
              </p>
            </div>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={citySummaryList}
                    dataKey="atmCount"
                    nameKey="city"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {citySummaryList.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CITY_COLORS[index % CITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} ATMs`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* City Legend / Table */}
            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1">
              {citySummaryList.map((c, i) => (
                <div key={c.city} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CITY_COLORS[i % CITY_COLORS.length] }}
                    />
                    <span className="font-medium text-slate-700">{c.city}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{c.atmCount} ATMs</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Source: <code>dim_location</code> groupings
          </div>
        </div>

      </div>

    </div>
  );
}
