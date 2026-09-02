import React from 'react';

export default function ClusterAnalysisTable({ data, selectedYears = [], yearlyStats = {} }) {
  const sortedData = [...data].sort((a, b) => b.totalCount - a.totalCount);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">Analisis Kategori Cluster Resign</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase">
            <tr>
              <th rowSpan="2" className="px-4 py-3 font-semibold align-middle rounded-tl-lg">Kategori Cluster</th>
              {selectedYears.map(year => (
                <th key={`th-${year}`} colSpan="2" className="px-4 py-2 font-semibold text-center border-b border-slate-200">
                  {year}
                </th>
              ))}
              <th rowSpan="2" className="px-4 py-3 font-semibold align-middle rounded-tr-lg w-1/3">Keterangan</th>
            </tr>
            <tr>
              {selectedYears.map(year => (
                <React.Fragment key={`subth-${year}`}>
                  <th className="px-3 py-2 font-semibold text-center text-slate-400 bg-slate-50/50 text-[10px]">Jml (Org)</th>
                  <th className="px-3 py-2 font-semibold text-center text-slate-400 bg-slate-50/50 text-[10px]">%</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{item.cluster}</td>
                  {selectedYears.map(year => (
                    <React.Fragment key={`td-${year}`}>
                      <td className="px-3 py-3 text-center text-slate-600">{item[`count${year}`]}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">{item[`perc${year}`]}%</span>
                      </td>
                    </React.Fragment>
                  ))}
                  <td className="px-4 py-3 text-slate-500 text-xs leading-relaxed min-w-[250px] whitespace-normal">{item.desc || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={selectedYears.length * 2 + 2} className="px-4 py-8 text-center text-slate-400">
                  Tidak ada data
                </td>
              </tr>
            )}
            
            {/* Total Row */}
            <tr className="bg-blue-50/50 border-t-2 border-blue-100">
              <td className="px-4 py-3 font-bold text-blue-900 rounded-bl-lg">TOTAL</td>
              {selectedYears.map(year => {
                const yearTotal = yearlyStats[year] ? yearlyStats[year].total : 0;
                return (
                  <React.Fragment key={`total-${year}`}>
                    <td className="px-3 py-3 text-center font-bold text-blue-800">{yearTotal}</td>
                    <td className="px-3 py-3 text-center font-bold text-blue-800">100%</td>
                  </React.Fragment>
                );
              })}
              <td className="px-4 py-3 rounded-br-lg"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
