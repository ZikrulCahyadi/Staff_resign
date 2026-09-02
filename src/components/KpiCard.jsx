import React from 'react';

export default function KpiCard({ 
  title, 
  totalValue, 
  totalPercentage, 
  val2025, 
  perc2025, 
  val2026, 
  perc2026, 
  color = 'slate' 
}) {
  
  // Elegant, soft color palettes
  const palettes = {
    slate: { icon: 'bg-slate-100 text-slate-600', text: 'text-slate-800' },
    blue: { icon: 'bg-blue-50 text-blue-600', text: 'text-blue-800' },
    emerald: { icon: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-800' },
    rose: { icon: 'bg-rose-50 text-rose-600', text: 'text-rose-800' },
    amber: { icon: 'bg-amber-50 text-amber-600', text: 'text-amber-800' }
  };

  const style = palettes[color] || palettes.slate;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/60 flex flex-col h-full hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.12)] transition-shadow duration-300">
      
      {/* Title & Badge */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
        {totalPercentage !== undefined && totalPercentage !== null && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${style.icon}`}>
            {totalPercentage}%
          </span>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-5">
        <span className={`text-4xl font-extrabold tracking-tight ${style.text}`}>
          {totalValue != null ? totalValue.toLocaleString() : '0'}
        </span>
      </div>

      {/* Breakdown 2025 vs 2026 (Relaxed layout, no harsh dividers) */}
      <div className="flex items-center gap-6 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-slate-400 uppercase mb-0.5">Tahun 2025</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-slate-700">
              {val2025 != null ? val2025.toLocaleString() : '0'}
            </span>
            {perc2025 !== undefined && (
              <span className="text-xs font-semibold text-slate-400">({perc2025}%)</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-slate-400 uppercase mb-0.5">Tahun 2026</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-slate-700">
              {val2026 != null ? val2026.toLocaleString() : '0'}
            </span>
            {perc2026 !== undefined && (
              <span className="text-xs font-semibold text-slate-400">({perc2026}%)</span>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
