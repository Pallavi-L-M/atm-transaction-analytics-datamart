import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpDown,
  Building2,
  DollarSign,
  Activity,
  Award,
  ChevronRight,
  PieChart as PieIcon
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
  Cell
} from 'recharts';
import { useData } from '../context/DataContext';

export default function AnalyticsPage() {
  const {
    analyticsSummary,
    setSelectedAtmId
  } = useData();

  const [rankingMetric, setRankingMetric] = useState('income'); // 'income' | 'transactions' | 'outcome'

  const {
    citySummaryList,
    uniqueAtmsList,
    totalIncome,
    totalOutcome,
    totalIncomeTxCount,
    totalOutcomeTxCount,
    totalTransactions
  } = analyticsSummary;

  // Sorted list for ATM ranking section
  const rankedAtms = [...uniqueAtmsList].sort((a, b) => {
    if (rankingMetric === 'income') return b.totalIncome - a.totalIncome;
    if (rankingMetric === 'outcome') return b.totalOutcome - a.totalOutcome;
    return b.totalTransactions - a.totalTransactions;
  }).slice(0, 10);

  // Compute key analytical ratios for college presentation
  const cashFlowRatio = totalOutcome > 0 ? (totalIncome / totalOutcome).toFixed(2) : 'N/A';
  const avgIncomePerDeposit = totalIncomeTxCount > 0 ? (totalIncome / totalIncomeTxCount).toFixed(2) : '0';
  const avgOutcomePerWithdrawal = totalOutcomeTxCount > 0 ? (totalOutcome / totalOutcomeTxCount).toFixed(2) : '0';
  const topCity = citySummaryList.length > 0 ? citySummaryList[0].city : 'None';

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Analytics Highlights / Viva Talking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Top Inflow City</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{topCity}</div>
          <p className="text-xs text-slate-500 mt-1">Generated highest reported deposits</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Inflow / Outflow Ratio</span>
          <div className="text-xl font-bold text-blue-600 mt-1">{cashFlowRatio}x</div>
          <p className="text-xs text-slate-500 mt-1">Deposits vs Withdrawals volume</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Avg Deposit Per Tx</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">${avgIncomePerDeposit}</div>
          <p className="text-xs text-slate-500 mt-1">Reported deposit amount efficiency</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Avg Withdrawal Per Tx</span>
          <div className="text-xl font-bold text-rose-600 mt-1">${avgOutcomePerWithdrawal}</div>
          <p className="text-xs text-slate-500 mt-1">Reported withdrawal ticket size</p>
        </div>

      </div>

      {/* Chart 1: Compare Income and Outcome by City */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
              Comparative City Income & Cash Outflow
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side dimensional aggregation across all geographic city clusters
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            dim_location Analysis
          </span>
        </div>

        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={citySummaryList}
              margin={{ top: 20, right: 20, left: 15, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                formatter={(val, name) => [`$${Number(val).toLocaleString()}`, name === 'totalIncome' ? 'Reported Income' : 'Reported Outcome']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: 10, fontSize: '12px' }} />
              <Bar dataKey="totalIncome" name="totalIncome (Deposits)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalOutcome" name="totalOutcome (Withdrawals)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Compare ATM Transaction Counts by City */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-indigo-600" />
              Transaction Volume Comparison by City
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative number of transactions processed per urban location
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Total: {totalTransactions.toLocaleString()} tx
          </span>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={citySummaryList}
              margin={{ top: 20, right: 20, left: 15, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val) => [`${Number(val).toLocaleString()} tx`, 'Transaction Volume']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="totalTransactions" name="Total Transactions" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Ranking Section: Rank ATMs by Metric */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Award className="w-4 h-4 mr-2 text-amber-500" />
              ATM Performance Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rank ATMs dynamically by income generation, cash outflow, or total transaction volume
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setRankingMetric('income')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                rankingMetric === 'income' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Income
            </button>
            <button
              onClick={() => setRankingMetric('outcome')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                rankingMetric === 'outcome' ? 'bg-white text-rose-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Cash Outflow
            </button>
            <button
              onClick={() => setRankingMetric('transactions')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                rankingMetric === 'transactions' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Volume (Tx Count)
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">ATM ID</th>
                <th className="py-3 px-3">ATM Name</th>
                <th className="py-3 px-3">City</th>
                <th className="py-3 px-3 text-right">Reported Income</th>
                <th className="py-3 px-3 text-right">Reported Outcome</th>
                <th className="py-3 px-3 text-right">Total Transactions</th>
                <th className="py-3 px-3 text-right">Current Balance</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedAtms.map((atm, idx) => (
                <tr key={atm.atmId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-400">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                      idx === 0 ? 'bg-amber-100 text-amber-800 font-extrabold' :
                      idx === 1 ? 'bg-slate-200 text-slate-800 font-bold' :
                      idx === 2 ? 'bg-orange-100 text-orange-800 font-bold' : 'text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">
                    {atm.atmId}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {atm.atmName}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {atm.atmCity}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-bold ${
                    rankingMetric === 'income' ? 'text-emerald-600 font-extrabold bg-emerald-50/40' : 'text-slate-700'
                  }`}>
                    ${atm.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-bold ${
                    rankingMetric === 'outcome' ? 'text-rose-600 font-extrabold bg-rose-50/40' : 'text-slate-700'
                  }`}>
                    ${atm.totalOutcome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-bold ${
                    rankingMetric === 'transactions' ? 'text-blue-600 font-extrabold bg-blue-50/40' : 'text-slate-700'
                  }`}>
                    {atm.totalTransactions.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    ${atm.latestBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setSelectedAtmId(atm.atmId)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center"
                    >
                      Details <ChevronRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
