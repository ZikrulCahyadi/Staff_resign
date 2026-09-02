import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg">
        <p className="font-bold text-slate-800 text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-xs mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-slate-600 font-medium">{entry.name}:</span>
            <span className="font-bold text-slate-900">{entry.value}</span>
            <span className="text-slate-500">
              ({entry.payload[`perc${entry.dataKey.replace('count', '')}`]}%)
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLabel = (props) => {
  const { x, y, width, height, value, dataKey, payload } = props;
  const is2025 = dataKey === 'count2025';
  const perc = is2025 ? payload?.perc2025 : payload?.perc2026;
  const color = is2025 ? '#1e3a8a' : '#ea580c';
  
  if (value === 0 || !payload) return null;

  return (
    <text 
      x={x + width + 5} 
      y={y + height / 2 + 4} 
      fill={color} 
      fontSize="11" 
      fontWeight="bold"
    >
      {perc}%; {value}
    </text>
  );
};

export default function ClusterChart({ data }) {
  // Use top 8 clusters and reverse so the largest is at the top in vertical layout
  const chartData = [...data].slice(0, 8).reverse();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">Cluster Penyebab Resign</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Sebaran top cluster 2025 vs 2026</p>
      </div>
      
      <div className="flex-1 w-full min-h-[350px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 40, left: 10, bottom: 0 }}
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
              <Bar dataKey="count2026" name="2026" fill="#f97316" radius={[0, 4, 4, 0]} maxBarSize={20}>
                <LabelList content={<CustomLabel />} dataKey="count2026" />
              </Bar>
              <Bar dataKey="count2025" name="2025" fill="#1e40af" radius={[0, 4, 4, 0]} maxBarSize={20}>
                <LabelList content={<CustomLabel />} dataKey="count2025" />
              </Bar>
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
