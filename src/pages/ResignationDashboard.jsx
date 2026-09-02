import React, { useState, useEffect, useMemo } from 'react';
import { Filter, ArrowRight } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import KpiCard from '../components/KpiCard';
import ClusterChart from '../components/ClusterChart';
import PositionChart from '../components/PositionChart';
import EstateTable from '../components/EstateTable';
import ClusterAnalysisTable from '../components/ClusterAnalysisTable';
import TurnoverTrendChart from '../components/TurnoverTrendChart';
import AIInsight from '../components/AIInsight';

import { getEmployeesData } from '../services/resignationService';
import {
  getYearData,
  getResignationSummary,
  getVoluntarySummary,
  getInvoluntarySummary,
  getAlumniSummary,
  getNonAlumniSummary,
  getClusterAnalysis,
  getPositionAnalysis,
  getTopEstates,
  getMonthlyTrend,
  calculateLinearRegression,
  calculatePercentage
} from '../utils/resignationUtils';

export default function ResignationDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState('All Region');
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const employees = await getEmployeesData();
        setData(employees || []);
        
        const uniqueRegions = [...new Set(employees.map(e => e.region).filter(Boolean))].sort();
        setRegions(uniqueRegions);
        
        setError(null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(`Gagal mengambil data dari database: ${err.message || JSON.stringify(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (region === 'All Region') return data;
    return data.filter(item => item.region === region);
  }, [data, region]);

  // Aggregate Data
  const data2025 = useMemo(() => getYearData(filteredData, 2025), [filteredData]);
  const data2026 = useMemo(() => getYearData(filteredData, 2026), [filteredData]);

  // KPIs
  const summary2025 = useMemo(() => getResignationSummary(filteredData, 2025), [filteredData]);
  const summary2026 = useMemo(() => getResignationSummary(filteredData, 2026), [filteredData]);
  const totalResignCombined = summary2025.total + summary2026.total;
  
  const vt2025 = useMemo(() => getVoluntarySummary(filteredData, 2025), [filteredData]);
  const vt2026 = useMemo(() => getVoluntarySummary(filteredData, 2026), [filteredData]);
  const vtCombined = vt2025.count + vt2026.count;
  
  const it2025 = useMemo(() => getInvoluntarySummary(filteredData, 2025), [filteredData]);
  const it2026 = useMemo(() => getInvoluntarySummary(filteredData, 2026), [filteredData]);
  const itCombined = it2025.count + it2026.count;

  const alumni2025 = useMemo(() => getAlumniSummary(filteredData, 2025), [filteredData]);
  const alumni2026 = useMemo(() => getAlumniSummary(filteredData, 2026), [filteredData]);
  const alumniCombined = alumni2025.count + alumni2026.count;
  
  const nonAlumni2025 = useMemo(() => getNonAlumniSummary(filteredData, 2025), [filteredData]);
  const nonAlumni2026 = useMemo(() => getNonAlumniSummary(filteredData, 2026), [filteredData]);
  const nonAlumniCombined = nonAlumni2025.count + nonAlumni2026.count;

  // Charts & Tables
  const clusterData = useMemo(() => getClusterAnalysis(data2025, data2026), [data2025, data2026]);
  const positionData = useMemo(() => getPositionAnalysis(data2025, data2026), [data2025, data2026]);
  
  const topEstates2025 = useMemo(() => getTopEstates(filteredData, 2025), [filteredData]);
  const topEstates2026 = useMemo(() => getTopEstates(filteredData, 2026), [filteredData]);

  const trendData = useMemo(() => getMonthlyTrend(filteredData), [filteredData]);
  
  const trendLines = useMemo(() => {
    return {
      it: calculateLinearRegression(trendData, 'it'),
      vt: calculateLinearRegression(trendData, 'vt'),
    };
  }, [trendData]);

  const handleReset = () => {
    setRegion('All Region');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Memuat data resignation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[50vh]">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 max-w-md">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <DashboardHeader 
        region={region} 
        setRegion={setRegion} 
        regions={regions} 
        onReset={handleReset} 
      />

      {filteredData.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Filter className="w-8 h-8 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Tidak Ada Data</h3>
          <p className="text-slate-500">Tidak ada data resignation untuk filter region yang dipilih.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          
          {/* KPI Row */}
          <div className="flex flex-wrap lg:flex-nowrap gap-2 items-center">
            <div className="flex-1 min-w-[200px]">
              <KpiCard 
                title="Total Resign" 
                totalValue={totalResignCombined}
                val2025={summary2025.total} 
                perc2025={calculatePercentage(summary2025.total, totalResignCombined)}
                val2026={summary2026.total}
                perc2026={calculatePercentage(summary2026.total, totalResignCombined)}
                color="slate"
              />
            </div>
            <div className="hidden lg:flex flex-col items-center justify-center text-slate-300">
              <ArrowRight size={24} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <KpiCard 
                title="Voluntary (VT)" 
                totalValue={vtCombined}
                totalPercentage={calculatePercentage(vtCombined, totalResignCombined)}
                val2025={vt2025.count} 
                perc2025={calculatePercentage(vt2025.count, summary2025.total)}
                val2026={vt2026.count}
                perc2026={calculatePercentage(vt2026.count, summary2026.total)}
                color="blue"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <KpiCard 
                title="Involuntary (IT)" 
                totalValue={itCombined}
                totalPercentage={calculatePercentage(itCombined, totalResignCombined)}
                val2025={it2025.count} 
                perc2025={calculatePercentage(it2025.count, summary2025.total)}
                val2026={it2026.count}
                perc2026={calculatePercentage(it2026.count, summary2026.total)}
                color="rose"
              />
            </div>
            <div className="w-4 hidden lg:block"></div>
            <div className="flex-1 min-w-[200px]">
              <KpiCard 
                title="Alumni FRLC" 
                totalValue={alumniCombined}
                totalPercentage={calculatePercentage(alumniCombined, totalResignCombined)}
                val2025={alumni2025.count} 
                perc2025={calculatePercentage(alumni2025.count, summary2025.total)}
                val2026={alumni2026.count}
                perc2026={calculatePercentage(alumni2026.count, summary2026.total)}
                color="emerald"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <KpiCard 
                title="Non Alumni" 
                totalValue={nonAlumniCombined}
                totalPercentage={calculatePercentage(nonAlumniCombined, totalResignCombined)}
                val2025={nonAlumni2025.count} 
                perc2025={calculatePercentage(nonAlumni2025.count, summary2025.total)}
                val2026={nonAlumni2026.count}
                perc2026={calculatePercentage(nonAlumni2026.count, summary2026.total)}
                color="amber"
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <ClusterChart data={clusterData} />
            </div>
            <div>
              <PositionChart data={positionData} />
            </div>
          </div>

          {/* Tables Row for Top Estates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EstateTable 
              title="Sebaran Top Ten Per Kebun – Th. 2025" 
              data={topEstates2025}
              globalTotals={{
                it: it2025.count,
                vt: vt2025.count,
                total: summary2025.total
              }}
            />
            <EstateTable 
              title="Sebaran Top Ten Per Kebun – Th. 2026" 
              data={topEstates2026}
              globalTotals={{
                it: it2026.count,
                vt: vt2026.count,
                total: summary2026.total
              }}
            />
          </div>

          {/* Cluster Analysis Table */}
          <div>
            <ClusterAnalysisTable 
              data={clusterData}
              total2025={summary2025.total}
              total2026={summary2026.total}
            />
          </div>

          {/* Trend Chart & AI Insight */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TurnoverTrendChart data={trendData} trendLines={trendLines} />
            </div>
            <div className="lg:col-span-1">
              <AIInsight 
                trendData={trendData} 
                metadata={{
                  itSlope: trendLines.it.slope,
                  vtSlope: trendLines.vt.slope,
                  region: region
                }}
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
