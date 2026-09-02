import React, { useState, useRef, useEffect } from 'react';
import { Filter, RefreshCcw, Calendar, Check } from 'lucide-react';

export default function DashboardHeader({ region, setRegion, regions, onReset, selectedYears, setSelectedYears, availableYears }) {
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleYearToggle = (year) => {
    if (selectedYears.includes(year)) {
      if (selectedYears.length > 1) {
        setSelectedYears(selectedYears.filter(y => y !== year));
      }
    } else {
      setSelectedYears([...selectedYears, year].sort());
    }
  };

  const isAllSelected = selectedYears.length === availableYears.length;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm mb-6 border border-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Resignation Staff</h1>
        <p className="text-slate-500 font-medium">
          Perbandingan Data {selectedYears.length === availableYears.length ? 'Semua Tahun' : selectedYears.join(' vs ')}
        </p>
      </div>

      <div className="mt-4 md:mt-0 flex flex-wrap gap-3 items-center">
        {/* Year Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
            className="flex items-center justify-between gap-2 pl-3 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl hover:bg-slate-100 transition-colors w-40"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="truncate">{isAllSelected ? 'Semua Tahun' : `${selectedYears.length} Tahun`}</span>
            </div>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          {yearDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
              <div className="p-2 border-b border-slate-100">
                <button 
                  onClick={() => setSelectedYears([...availableYears])}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors flex justify-between items-center"
                >
                  Semua Tahun
                  {isAllSelected && <Check className="h-4 w-4" />}
                </button>
              </div>
              <div className="p-2 max-h-60 overflow-y-auto">
                {availableYears.map(year => {
                  const isSelected = selectedYears.includes(year);
                  return (
                    <button
                      key={year}
                      onClick={() => handleYearToggle(year)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-3 ${
                        isSelected ? 'bg-slate-50 text-slate-800 font-medium' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-slate-400" />
          </div>
          <select
            className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full outline-none transition-all hover:bg-slate-100 cursor-pointer appearance-none"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="All Region">All Region</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-xl transition-all shadow-sm group"
        >
          <RefreshCcw className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          Reset Filter
        </button>
      </div>
    </div>
  );
}
