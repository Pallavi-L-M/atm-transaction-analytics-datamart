import React from 'react';
import { X, Building2, MapPin, DollarSign, ArrowUpRight, ArrowDownRight, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AtmDetailDrawer({ atm, onClose }) {
  if (!atm) return null;

  // Aggregate day-wise metrics for this single ATM
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayStats = dayOrder.map(d => ({
    day: d.substring(0, 3),
    income: 0,
    outcome: 0,
    transactions: 0
  }));

  atm.records.forEach(r => {
    const idx = dayOrder.indexOf(r.day);
    if (idx !== -1) {
      dayStats[idx].income += Number(r.totalIncome) || 0;
      dayStats[idx].outcome += Number(r.totalOutcome) || 0;
      dayStats[idx].transactions += Number(r.totalNumberTransaction) || 0;
    }
  });

  const netCashFlow = atm.totalIncome - atm.totalOutcome;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end transition-opacity duration-300">
      <div className="w-full max-w-xl bg-white shadow-2xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {atm.atmId}
              </span>
              <span className="text-xs text-slate-400 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {atm.atmCity}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-2 text-white">{atm.atmName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{atm.atmAddress}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Cash & Balance Overview Card */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl p-5 border border-blue-100/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Reported ATM Cash Balance
              </span>
              <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Operational
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              ${atm.latestBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              *Latest reported balance snapshot in the dataset.
            </p>
          </div>

          {/* Income vs Outcome Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
                <span>Reported Income</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-emerald-600">
                ${atm.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {atm.incomeTxCount.toLocaleString()} deposit transactions
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase mb-1">
                <span>Reported Outcome</span>
                <ArrowDownRight className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xl font-bold text-rose-600">
                ${atm.totalOutcome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {atm.outcomeTxCount.toLocaleString()} cash withdrawals
              </div>
            </div>
          </div>

          {/* Net Flow & Transaction Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Net Cash Flow:</span>
              <span className={`font-bold ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                {netCashFlow >= 0 ? '+' : ''}${netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Total Reported Transactions:</span>
              <span className="font-bold text-slate-900">
                {atm.totalTransactions.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Summary Records in Dataset:</span>
              <span className="font-bold text-slate-900">
                {atm.recordCount} rows
              </span>
            </div>
          </div>

          {/* Activity by Day of Week Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-blue-600" />
                Performance by Day of Week
              </h3>
              <span className="text-xs text-slate-400">Amounts in $</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v > 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                    formatter={(val, name) => [`$${Number(val).toLocaleString()}`, name === 'income' ? 'Income' : 'Outcome']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  />
                  <Bar dataKey="income" fill="#10b981" name="income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="outcome" fill="#f43f5e" name="outcome" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Records Table for this ATM */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Dataset Summary Logs ({atm.records.length})
              </h4>
            </div>
            <div className="max-h-56 overflow-y-auto text-xs">
              <table className="w-full text-left divide-y divide-slate-100">
                <thead className="bg-slate-50/70 text-slate-600 sticky top-0 font-semibold">
                  <tr>
                    <th className="px-3 py-2">Day</th>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2 text-right">Income ($)</th>
                    <th className="px-3 py-2 text-right">Outcome ($)</th>
                    <th className="px-3 py-2 text-right">Tx Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {atm.records.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-medium text-slate-700">{r.day}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">{r.transactionTime}</td>
                      <td className="px-3 py-2 text-right text-emerald-600 font-medium">
                        ${Number(r.totalIncome).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-rose-600 font-medium">
                        ${Number(r.totalOutcome).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">{r.totalNumberTransaction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Star Schema Key: <code className="text-blue-700 font-mono">dim_atm.{atm.atmId}</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
}
