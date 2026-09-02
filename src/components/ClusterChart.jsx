import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const YEAR_COLORS = ['#1e40af', '#f97316', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg">
        <p className="font-bold text-slate-800 text-sm mb-2">{label}</p>
        {payload.map((entry, index) => {
          const year = entry.dataKey.replace('count', '');
          return (
            <div key={`item-${index}`} className="flex items-center gap-2 text-xs mb-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-600 font-medium">Tahun {year}:</span>
              <span className="font-bold text-slate-900">{entry.value}</span>
              <span className="text-slate-500">
                ({entry.payload[`perc${year}`]}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const CustomLabel = (props) => {
  const { x, y, width, height, value, payload, fill, year } = props;
  
  if (value === 0 || !payload || !year) return null;
  
  const perc = payload[`perc${year}`];

  return (
    <text 
      x={x + width + 5} 
      y={y + height / 2 + 4} 
      fill={fill} 
      fontSize="11" 
      fontWeight="bold"
    >
      {perc}%; {value}
    </text>
  );
};

const PREFERRED_ORDER = [
  'Pindah perusahaan',
  'Working Condition',
  'Under perform',
  'Keluarga',
  'Efisiensi',
  'Kasus',
  'Pergi tanpa Keterangan',
  'Hbs Kontrak',
  'Indisipliner'
];

export default function ClusterChart({ data, selectedYears = [] }) {
  // Sort data based on PREFERRED_ORDER
  const chartData = [...data]
    .sort((a, b) => {
      const indexA = PREFERRED_ORDER.indexOf(a.cluster);
      const indexB = PREFERRED_ORDER.indexOf(b.cluster);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return b.totalCount - a.totalCount;
    })
    .slice(0, 9);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">Cluster Penyebab Resign</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Sebaran top cluster {selectedYears.join(' vs ')}</p>
      </div>
      
      <div className="flex-1 w-full min-h-[350px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 60, left: 10, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="cluster" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: '500' }} 
                width={140}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }} 
                verticalAlign="bottom" 
                align="center"
              />
              {[...selectedYears].sort().reverse().map((year, idx) => (
                <Bar 
                  key={year}
                  dataKey={`count${year}`} 
                  name={`Tahun ${year}`} 
                  fill={YEAR_COLORS[idx % YEAR_COLORS.length]} 
                  radius={[0, 4, 4, 0]} 
                  maxBarSize={20}
                >
                  <LabelList content={(props) => <CustomLabel {...props} fill={YEAR_COLORS[idx % YEAR_COLORS.length]} year={year} />} dataKey={`count${year}`} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
            Tidak ada data
          </div>
        )}
      </div>
    </div>
  );
}
