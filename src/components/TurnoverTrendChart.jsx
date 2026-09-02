import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-slate-100 shadow-lg rounded-xl min-w-[200px]">
        <p className="font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                {entry.dataKey.includes('Trend') ? (
                  <div className="w-4 h-0 border-b-2 border-dotted" style={{ borderColor: entry.color }}></div>
                ) : (
                  <div className="w-4 h-0 border-b-2" style={{ borderColor: entry.color }}></div>
                )}
                <span className="text-slate-600 font-medium">{entry.name}</span>
              </div>
              <span className="font-bold text-slate-800">{Number(entry.value).toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = () => {
  return (
    <div className="flex flex-wrap justify-center gap-6 mt-4 text-xs font-semibold text-slate-700">
      <div className="flex items-center gap-2">
        <div className="w-6 h-0 border-b-[3px] border-[#1e40af]"></div>
        <span>IT</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-0 border-b-[3px] border-[#f97316]"></div>
        <span>VT</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-0 border-b-[3px] border-[#10b981]"></div>
        <span>Total</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-0 border-b-[2px] border-dotted border-[#1e40af]"></div>
        <span>Linear (IT)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-0 border-b-[2px] border-dotted border-[#f97316]"></div>
        <span>Linear (VT)</span>
      </div>
    </div>
  );
};

export default function TurnoverTrendChart({ data, trendLines }) {
  // Map data to include trend lines
  const chartData = data.map((d, i) => {
    return {
      ...d,
      itTrend: trendLines.it.intercept + trendLines.it.slope * i,
      vtTrend: trendLines.vt.intercept + trendLines.vt.slope * i,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full relative">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Grafik Trend Turnover 2025 - Juli 2026</h3>
        </div>
      </div>
      
      <div className="h-[350px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={{ stroke: '#cbd5e1' }} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#475569', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Solid Lines */}
              <Line 
                type="monotone" 
                dataKey="total" 
                name="Total" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }} 
              />
              <Line 
                type="monotone" 
                dataKey="it" 
                name="IT" 
                stroke="#1e40af" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#1e40af', strokeWidth: 0 }} 
              />
              <Line 
                type="monotone" 
                dataKey="vt" 
                name="VT" 
                stroke="#f97316" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6, fill: '#f97316', strokeWidth: 0 }} 
              />
              
              {/* Trend lines */}
              <Line 
                type="linear" 
                dataKey="itTrend" 
                name="Linear (IT)" 
                stroke="#1e40af" 
                strokeWidth={2} 
                strokeDasharray="2 4" 
                dot={false}
                activeDot={false}
              />
              <Line 
                type="linear" 
                dataKey="vtTrend" 
                name="Linear (VT)" 
                stroke="#f97316" 
                strokeWidth={2} 
                strokeDasharray="2 4" 
                dot={false}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Tidak ada data
          </div>
        )}
      </div>
      <CustomLegend />
    </div>
  );
}
