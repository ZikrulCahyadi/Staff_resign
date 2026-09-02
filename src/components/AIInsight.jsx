import React, { useEffect, useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { getAIInsight } from '../services/aiInsightService';

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

    // Add a small delay to prevent spamming the API on every fast filter change
    const debounceTimer = setTimeout(() => {
      fetchInsight();
    }, 1000);
    
    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [trendData, metadata]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-indigo-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">AI Insight</h3>
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
        ) : insight ? (
          <div className="prose prose-sm prose-indigo max-w-none" dangerouslySetInnerHTML={{ __html: insight.replace(/\n/g, '<br />') }} />
        ) : (
          <p className="text-slate-500 italic">Menunggu data...</p>
        )}
      </div>
    </div>
  );
}
