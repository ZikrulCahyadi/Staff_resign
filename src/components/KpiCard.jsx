import React from 'react';

export default function KpiCard({ 
  title, 
  totalValue, 
  totalPercentage, 
  breakdowns = [], 
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

      {/* Breakdowns */}
      {breakdowns.length > 0 && (
        <div className="flex flex-wrap items-center justify-between bg-slate-50/80 rounded-xl p-3 mt-auto border border-slate-100 gap-y-2 gap-x-1">
          {breakdowns.map((b, index) => (
            <React.Fragment key={b.year}>
              <div className="flex flex-col flex-1 min-w-[30%]">
                <span className="text-[10px] font-bold text-slate-400 mb-0.5">TAHUN {b.year}</span>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-[14px] font-bold text-slate-700">
                    {b.value != null ? b.value.toLocaleString() : '0'}
                  </span>
                  {b.percentage !== undefined && (
                    <span className="text-[10px] font-medium text-slate-500">({b.percentage}%)</span>
                  )}
                </div>
              </div>
              {index < breakdowns.length - 1 && breakdowns.length <= 3 && (
                <div className="w-px h-8 bg-slate-200/80 mx-1"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
