import React from 'react';
import { Filter, RefreshCcw } from 'lucide-react';

export default function DashboardHeader({ region, setRegion, regions, onReset }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm mb-6 border border-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Resignation Staff</h1>
        <p className="text-slate-500 font-medium">Perbandingan Data 2025 vs 2026</p>
      </div>

      <div className="mt-4 md:mt-0 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-slate-400" />
          </div>
          <select
            className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full outline-none transition-all hover:bg-slate-100 cursor-pointer appearance-none"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="All Region">All Region</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-xl transition-all shadow-sm group"
        >
          <RefreshCcw className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          Reset Filter
        </button>
      </div>
    </div>
  );
}
