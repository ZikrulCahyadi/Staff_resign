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
  const color = '#ffffff';
  
  if (value === 0 || height < 20 || !payload) return null; // Don't show label if segment is too small

  return (
    <text 
      x={x + width / 2} 
      y={y + height / 2 - 4} 
      fill={color} 
      fontSize="11" 
      fontWeight="bold"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      <tspan x={x + width / 2} dy="0">{perc}%</tspan>
      <tspan x={x + width / 2} dy="12">{value}</tspan>
    </text>
  );
};

const CustomXAxisTick = ({ x, y, payload }) => {
  if (!payload || !payload.value) return null;
  const words = payload.value.split(' ');
  const half = Math.ceil(words.length / 2);
  const line1 = words.length > 1 ? words.slice(0, half).join(' ') : payload.value;
  const line2 = words.length > 1 ? words.slice(half).join(' ') : '';

  return (
    <g transform={`translate(${x},${y + 12})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">
        <tspan x="0" dy="0">{line1}</tspan>
        {line2 && <tspan x="0" dy="14">{line2}</tspan>}
      </text>
    </g>
  );
};

export default function PositionChart({ data }) {
  // Use top 6 for vertical chart readability, reversed so largest is on the right or just leave as is
  // Actually, sort ascending so the largest is on the right side of the x-axis
  const chartData = [...data].slice(0, 6).sort((a, b) => (a.count2025 + a.count2026) - (b.count2025 + b.count2026));

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">Cluster Resign by Jabatan</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Top jabatan 2025 vs 2026</p>
      </div>
      
      <div className="flex-1 w-full min-h-[350px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="jabatan" 
                axisLine={false} 
                tickLine={false} 
                tick={<CustomXAxisTick />}
                interval={0}
                height={60}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }} 
                verticalAlign="bottom"
                align="center"
              />
              <Bar dataKey="count2025" name="2025" stackId="a" fill="#1e40af" radius={[0, 0, 4, 4]} maxBarSize={50}>
                <LabelList content={<CustomLabel />} dataKey="count2025" />
              </Bar>
              <Bar dataKey="count2026" name="TD 2026" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={50}>
                <LabelList content={<CustomLabel />} dataKey="count2026" />
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
