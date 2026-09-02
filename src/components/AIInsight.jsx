import React, { useEffect, useState } from 'react';
import { Sparkles, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import { getAIInsight } from '../services/aiInsightService';

const TrendIcon = ({ trend }) => {
  const t = trend?.toLowerCase() || '';
  if (t.includes('naik') || t.includes('meningkat')) return <TrendingUp size={14} className="text-rose-500 shrink-0" />;
  if (t.includes('turun') || t.includes('menurun')) return <TrendingDown size={14} className="text-emerald-500 shrink-0" />;
  return <Minus size={14} className="text-slate-400 shrink-0" />;
};

export default function AIInsight({ trendData, metadata }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchInsight = async () => {
      if (!trendData || trendData.length === 0) {
        if (isMounted) setInsight("Tidak cukup data untuk menghasilkan insight.");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const text = await getAIInsight(trendData, metadata);
        if (isMounted) {
          setInsight(text);
        }
      } catch (err) {
        if (isMounted) {
          console.error("AI Insight error:", err);
          setError("Gagal menghasilkan insight dari AI. Pastikan server backend berjalan dan API Key terkonfigurasi.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchInsight();
    }, 1000);
    
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [trendData, metadata]);

  // Find max and min turnover months for highlight
  let maxMonth = null;
  let minMonth = null;
  
  if (trendData && trendData.length > 0) {
    let maxTotal = -1;
    let minTotal = Infinity;
    
    trendData.forEach(d => {
      const total = (d.it || 0) + (d.vt || 0);
      if (total > maxTotal) { maxTotal = total; maxMonth = d; }
      if (total < minTotal) { minTotal = total; minMonth = d; }
    });
  }

  const renderInsight = () => {
    if (!insight) return <p className="text-slate-500 italic">Menunggu data...</p>;
    
    // Calculate deterministic facts from local data
    let totalIT = 0;
    let totalVT = 0;
    
    if (trendData && trendData.length > 0) {
      trendData.forEach(d => {
        totalIT += d.it || 0;
        totalVT += d.vt || 0;
      });
    }

    const itTrend = metadata?.itSlope > 0 ? 'Naik' : metadata?.itSlope < 0 ? 'Turun' : 'Stabil';
    const vtTrend = metadata?.vtSlope > 0 ? 'Naik' : metadata?.vtSlope < 0 ? 'Turun' : 'Stabil';
    const dominant = totalIT > totalVT ? 'IT (Involuntary)' : totalVT > totalIT ? 'VT (Voluntary)' : 'Seimbang';
    
    const maxTotal = maxMonth ? ((maxMonth.it || 0) + (maxMonth.vt || 0)) : 0;
    const minTotal = minMonth ? ((minMonth.it || 0) + (minMonth.vt || 0)) : 0;
    
    const maxColorClass = maxMonth && (maxMonth.it > maxMonth.vt) ? 'text-rose-600' : 'text-indigo-600';
    const minColorClass = minMonth && (minMonth.it > minMonth.vt) ? 'text-rose-600' : 'text-indigo-600';

    try {
      const aiData = JSON.parse(insight);
      return (
        <div className="space-y-4">
          
          {/* Visual Line Chart IT vs VT */}
          <div className="h-56 w-full bg-white/70 rounded-xl p-3 border border-indigo-100 shadow-sm relative">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Visualisasi Perbandingan IT & VT</p>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                  labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                
                {/* Custom Highlight Dots for Peak & Lowest */}
                {maxMonth && <ReferenceDot x={maxMonth.name} y={maxMonth.it} r={5} fill="#ef4444" stroke="white" strokeWidth={2} label={maxMonth.it >= maxMonth.vt ? { value: 'Tertinggi', position: 'top', fill: '#ef4444', fontSize: 10 } : null} />}
                {maxMonth && <ReferenceDot x={maxMonth.name} y={maxMonth.vt} r={5} fill="#6366f1" stroke="white" strokeWidth={2} label={maxMonth.vt > maxMonth.it ? { value: 'Tertinggi', position: 'top', fill: '#6366f1', fontSize: 10 } : null} />}
                
                {minMonth && <ReferenceDot x={minMonth.name} y={minMonth.it} r={5} fill="#10b981" stroke="white" strokeWidth={2} label={minMonth.it <= minMonth.vt ? { value: 'Terendah', position: 'top', fill: '#10b981', fontSize: 10 } : null} />}
                {minMonth && <ReferenceDot x={minMonth.name} y={minMonth.vt} r={5} fill="#10b981" stroke="white" strokeWidth={2} label={minMonth.vt < minMonth.it ? { value: 'Terendah', position: 'top', fill: '#10b981', fontSize: 10 } : null} />}

                <Line type="monotone" dataKey="it" name="IT (Involuntary)" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="vt" name="VT (Voluntary)" stroke="#6366f1" strokeWidth={3} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white/60 rounded-xl p-3 border border-indigo-100/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trend IT</p>
              <div className="flex items-center gap-1.5">
                <TrendIcon trend={itTrend} />
                <p className="text-sm font-bold text-slate-700 capitalize">{itTrend}</p>
              </div>
            </div>
            <div className="bg-white/60 rounded-xl p-3 border border-indigo-100/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trend VT</p>
              <div className="flex items-center gap-1.5">
                <TrendIcon trend={vtTrend} />
                <p className="text-sm font-bold text-slate-700 capitalize">{vtTrend}</p>
              </div>
            </div>
            <div className="bg-white/60 rounded-xl p-3 border border-indigo-100/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dominan</p>
              <p className={`text-sm font-bold ${totalIT > totalVT ? 'text-rose-600' : 'text-indigo-600'}`}>{dominant}</p>
            </div>
            <div className="bg-white/60 rounded-xl p-3 border border-indigo-100/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bulan Tertinggi</p>
              <p className={`text-sm font-bold ${maxColorClass}`}>
                {maxMonth?.name} <span className="text-xs opacity-70 ml-1">({maxTotal})</span>
              </p>
            </div>
            <div className="bg-white/60 rounded-xl p-3 border border-indigo-100/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bulan Terendah</p>
              <p className={`text-sm font-bold ${minColorClass}`}>
                {minMonth?.name} <span className="text-xs opacity-70 ml-1">({minTotal})</span>
              </p>
            </div>
            <div className="bg-white/60 rounded-xl p-3 border border-indigo-100/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Resign</p>
              <p className="text-sm font-bold text-slate-700">{totalIT + totalVT} Orang</p>
            </div>
          </div>
          <div className="bg-indigo-600 text-white rounded-xl p-4 shadow-md shadow-indigo-200">
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider mb-1 flex items-center gap-1"><Sparkles size={12}/> Analisis Pola (AI)</p>
            <p className="text-sm font-medium leading-relaxed">{aiData.summary}</p>
          </div>
        </div>
      );
    } catch (e) {
      return (
        <div className="prose prose-sm prose-indigo max-w-none" dangerouslySetInnerHTML={{ 
          __html: insight
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />') 
        }} />
      );
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-indigo-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">AI Insight & Analisis Pola</h3>
          <p className="text-xs text-slate-500">Menganalisis perbandingan, tren & titik kritis</p>
        </div>
      </div>
      
      <div className="text-slate-700 text-sm leading-relaxed min-h-[100px]">
        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="h-4 bg-indigo-100 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-indigo-100 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-indigo-100 rounded animate-pulse w-5/6"></div>
            <div className="mt-2 text-xs text-indigo-400">Menganalisa trend data...</div>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        ) : renderInsight()}
      </div>
    </div>
  );
}

