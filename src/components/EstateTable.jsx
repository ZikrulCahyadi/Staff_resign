import React from 'react';

export default function EstateTable({ data, title, globalTotals }) {
  const top10TotalIt = data.reduce((sum, item) => sum + (item.it || 0), 0);
  const top10TotalVt = data.reduce((sum, item) => sum + (item.vt || 0), 0);
  const top10Total = data.reduce((sum, item) => sum + item.total, 0);
  
  const lainIt = globalTotals.it - top10TotalIt;
  const lainVt = globalTotals.vt - top10TotalVt;
  const lainTotal = globalTotals.total - top10Total;
  const lainPerc = globalTotals.total > 0 ? Math.round((lainTotal / globalTotals.total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold rounded-tl-lg">Kebun</th>
              <th scope="col" className="px-4 py-3 font-semibold text-center">IT</th>
              <th scope="col" className="px-4 py-3 font-semibold text-center">VT</th>
              <th scope="col" className="px-4 py-3 font-semibold text-center">TTL</th>
              <th scope="col" className="px-4 py-3 font-semibold text-right rounded-tr-lg">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{item.kebun}</td>
                  <td className="px-4 py-2.5 text-center text-slate-600">{item.it || '-'}</td>
                  <td className="px-4 py-2.5 text-center text-slate-600">{item.vt || '-'}</td>
                  <td className="px-4 py-2.5 text-center font-semibold text-slate-800">{item.total}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="bg-amber-100/60 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">
                      {Math.round(item.perc)}%
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                  Tidak ada data
                </td>
              </tr>
            )}
            
            {/* Lain Lain Row */}
            {lainTotal > 0 && (
              <tr className="bg-slate-50/30">
                <td className="px-4 py-2.5 italic text-slate-500">Lain Lain</td>
                <td className="px-4 py-2.5 text-center text-slate-500">{lainIt || '-'}</td>
                <td className="px-4 py-2.5 text-center text-slate-500">{lainVt || '-'}</td>
                <td className="px-4 py-2.5 text-center text-slate-500 font-medium">{lainTotal}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
                    {lainPerc}%
                  </span>
                </td>
              </tr>
            )}
            
            {/* Total Row */}
            <tr className="bg-blue-50/50 border-t-2 border-blue-100">
              <td className="px-4 py-3 font-bold text-blue-900 rounded-bl-lg">TOTAL</td>
              <td className="px-4 py-3 text-center font-bold text-blue-800">{globalTotals.it}</td>
              <td className="px-4 py-3 text-center font-bold text-blue-800">{globalTotals.vt}</td>
              <td className="px-4 py-3 text-center font-bold text-blue-900">{globalTotals.total}</td>
              <td className="px-4 py-3 text-right font-bold text-blue-800 rounded-br-lg">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
