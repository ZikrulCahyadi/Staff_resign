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

  // Year Selection State
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const employees = await getEmployeesData();
        setData(employees || []);
        
        const uniqueRegions = [...new Set(employees.map(e => e.region).filter(Boolean))].sort();
        setRegions(uniqueRegions);

        const uniqueYears = [...new Set(employees.map(e => {
          if (!e.resign_date) return null;
          return new Date(e.resign_date).getFullYear();
        }).filter(y => y !== null && !isNaN(y)))].sort();
        
        setAvailableYears(uniqueYears);
        if (uniqueYears.length > 0) {
          setSelectedYears([...uniqueYears]);
        }
        
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
    let result = data;
    if (region !== 'All Region') {
      result = result.filter(item => item.region === region);
    }
    return result;
  }, [data, region]);

  // Aggregate Data Dynamically
  const yearlyStats = useMemo(() => {
    const stats = {};
    selectedYears.forEach(year => {
      stats[year] = {
        total: getResignationSummary(filteredData, year).total,
        vt: getVoluntarySummary(filteredData, year).count,
        it: getInvoluntarySummary(filteredData, year).count,
        alumni: getAlumniSummary(filteredData, year).count,
        nonAlumni: getNonAlumniSummary(filteredData, year).count,
      };
    });
    return stats;
  }, [filteredData, selectedYears]);

  const combinedStats = useMemo(() => {
    return selectedYears.reduce((acc, curr) => {
      const yearStat = yearlyStats[curr];
      return {
        total: acc.total + yearStat.total,
        vt: acc.vt + yearStat.vt,
        it: acc.it + yearStat.it,
        alumni: acc.alumni + yearStat.alumni,
        nonAlumni: acc.nonAlumni + yearStat.nonAlumni
      };
    }, { total: 0, vt: 0, it: 0, alumni: 0, nonAlumni: 0 });
  }, [yearlyStats, selectedYears]);

  // Charts & Tables Data
  const clusterData = useMemo(() => getClusterAnalysis(filteredData, selectedYears), [filteredData, selectedYears]);
  const positionData = useMemo(() => getPositionAnalysis(filteredData, selectedYears), [filteredData, selectedYears]);
  
  // Fetch trend data
  const trendData = useMemo(() => getMonthlyTrend(filteredData, selectedYears), [filteredData, selectedYears]);
  
  const trendLines = useMemo(() => {
    return {
      it: calculateLinearRegression(trendData, 'it'),
      vt: calculateLinearRegression(trendData, 'vt'),
    };
  }, [trendData]);

  const handleReset = () => {
    setRegion('All Region');
    setSelectedYears([...availableYears]);
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
        selectedYears={selectedYears}
        setSelectedYears={setSelectedYears}
        availableYears={availableYears}
      />

      {filteredData.length === 0 || selectedYears.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Filter className="w-8 h-8 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Tidak Ada Data</h3>
          <p className="text-slate-500">Tidak ada data resignation untuk filter yang dipilih.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          
          {/* KPI Row */}
          <div className="flex flex-wrap lg:flex-nowrap gap-2 items-center overflow-x-auto pb-2">
            <div className="flex-1 min-w-[200px]">
              <KpiCard 
                title="Total Resign" 
                totalValue={combinedStats.total}
                breakdowns={selectedYears.map(year => ({
                  year,
                  value: yearlyStats[year].total,
                  percentage: calculatePercentage(yearlyStats[year].total, combinedStats.total)
                }))}
                color="slate"
              />
            </div>
            <div className="hidden lg:flex flex-col items-center justify-center text-slate-300">
              <ArrowRight size={24} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <KpiCard 
                title="Voluntary (VT)" 
                totalValue={combinedStats.vt}
                totalPercentage={calculatePercentage(combinedStats.vt, combinedStats.total)}
                breakdowns={selectedYears.map(year => ({
                  year,
                  value: yearlyStats[year].vt,
                  percentage: calculatePercentage(yearlyStats[year].vt, yearlyStats[year].total)
                }))}
                color="blue"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <KpiCard 
                title="Involuntary (IT)" 
                totalValue={combinedStats.it}
                totalPercentage={calculatePercentage(combinedStats.it, combinedStats.total)}
                breakdowns={selectedYears.map(year => ({
                  year,
                  value: yearlyStats[year].it,
                  percentage: calculatePercentage(yearlyStats[year].it, yearlyStats[year].total)
                }))}
                color="rose"
              />
            </div>
            <div className="w-4 hidden lg:block"></div>
            <div className="flex-1 min-w-[200px]">
              <KpiCard 
                title="Alumni FRLC" 
                totalValue={combinedStats.alumni}
                totalPercentage={calculatePercentage(combinedStats.alumni, combinedStats.total)}
                breakdowns={selectedYears.map(year => ({
                  year,
                  value: yearlyStats[year].alumni,
                  percentage: calculatePercentage(yearlyStats[year].alumni, yearlyStats[year].total)
                }))}
                color="emerald"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <KpiCard 
                title="Non Alumni" 
                totalValue={combinedStats.nonAlumni}
                totalPercentage={calculatePercentage(combinedStats.nonAlumni, combinedStats.total)}
                breakdowns={selectedYears.map(year => ({
                  year,
                  value: yearlyStats[year].nonAlumni,
                  percentage: calculatePercentage(yearlyStats[year].nonAlumni, yearlyStats[year].total)
                }))}
                color="amber"
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <ClusterChart data={clusterData} selectedYears={selectedYears} />
            </div>
            <div>
              <PositionChart data={positionData} selectedYears={selectedYears} />
            </div>
          </div>

          {/* Tables Row for Top Estates */}
          <div className={`grid grid-cols-1 lg:grid-cols-${selectedYears.length > 2 ? '3' : '2'} gap-4`}>
            {selectedYears.map(year => {
              const topEstates = getTopEstates(filteredData, year);
              return (
                <EstateTable 
                  key={year}
                  title={`Sebaran Top Ten Per Kebun – Th. ${year}`} 
                  data={topEstates}
                  globalTotals={{
                    it: yearlyStats[year].it,
                    vt: yearlyStats[year].vt,
                    total: yearlyStats[year].total
                  }}
                />
              );
            })}
          </div>

          {/* Cluster Analysis Table */}
          <div>
            <ClusterAnalysisTable 
              data={clusterData}
              selectedYears={selectedYears}
              yearlyStats={yearlyStats}
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
