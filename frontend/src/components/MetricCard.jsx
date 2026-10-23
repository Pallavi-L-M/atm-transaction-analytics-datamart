import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, badge, accentColor = 'blue', note }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    violet: 'bg-violet-50 text-violet-600 border-violet-200'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          {Icon && (
            <div className={`p-2 rounded-lg border ${colorMap[accentColor] || colorMap.blue}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </span>
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              {badge}
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{subtitle}</span>
        {note && <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{note}</span>}
      </div>
    </div>
  );
}
