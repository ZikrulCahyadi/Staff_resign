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
  const { x, y, width, height, value, payload, year } = props;
  
  if (value === 0 || height < 20 || !payload || !year) return null; // Don't show label if segment is too small

  const perc = payload[`perc${year}`];
  const color = '#ffffff';

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

export default function PositionChart({ data, selectedYears = [] }) {
  // Use top 6 for vertical chart readability, sort ascending so the largest is on the right side of the x-axis
  const chartData = [...data].slice(0, 6).sort((a, b) => a.totalCount - b.totalCount);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">Cluster Resign by Jabatan</h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Top jabatan {selectedYears.join(' vs ')}</p>
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
              {selectedYears.map((year, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === selectedYears.length - 1;
                // For stacked bars, bottom radius is applied to the first element, top radius to the last
                let radius = [0, 0, 0, 0];
                if (selectedYears.length === 1) {
                  radius = [4, 4, 4, 4];
                } else if (isFirst) {
                  radius = [0, 0, 4, 4];
                } else if (isLast) {
                  radius = [4, 4, 0, 0];
                }

                return (
                  <Bar 
                    key={year}
                    dataKey={`count${year}`} 
                    name={`Tahun ${year}`} 
                    stackId="a" 
                    fill={YEAR_COLORS[idx % YEAR_COLORS.length]} 
                    radius={radius} 
                    maxBarSize={50}
                  >
                    <LabelList content={(props) => <CustomLabel {...props} year={year} />} dataKey={`count${year}`} />
                  </Bar>
                );
              })}
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
