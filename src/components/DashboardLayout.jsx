import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Clock, ShieldCheck, ChevronDown } from 'lucide-react';
import logo from '../assets/logoo.png';

export default function DashboardLayout({ children, activeMenu = 'dashboard', setActiveMenu }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] font-sans">
      
      {/* Top Header / Navbar */}
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10 sticky top-0 shadow-sm shadow-slate-100/50">
        
        {/* Left Section: Logo & Navigation */}
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Logo Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 sm:w-10 h-10 sm:h-12 flex items-center justify-center shrink-0">
              <img 
                src={logo} 
                alt="FR" 
                className="w-full h-full object-contain" 
                onError={(e) => { 
                  e.target.style.display = 'none'; 
                  e.target.parentNode.innerText = 'FR'; 
                  e.target.parentNode.classList.add('bg-emerald-700', 'text-white', 'rounded', 'font-bold', 'text-sm');
                }} 
              />
            </div>
            <span className="font-extrabold text-slate-800 text-lg sm:text-xl tracking-tight hidden sm:block">FR Academy</span>
          </div>

        </div>

        {/* Right Section: Time & Profile */}
        <div className="flex items-center gap-3 sm:gap-8">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-700 flex items-center justify-end gap-1.5">
              <Clock size={14} className="text-emerald-600" />
              {formatTime(time)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">{formatDate(time)}</div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-8 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1 sm:p-1.5 -mr-1 sm:-mr-1.5 rounded-xl transition-colors">
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
              A
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-bold text-slate-800 leading-tight">Admin FR</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Superadmin</div>
            </div>
            <ChevronDown size={16} className="text-slate-400 hidden sm:block ml-1" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f8fafc]">
        <div className="max-w-[1600px] mx-auto w-full">
          
          {/* Pill Tab Navigation (Segmented Control) */}
          <div className="flex flex-row w-full sm:w-fit bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner mb-4 sm:mb-6">
            <button
              onClick={() => setActiveMenu && setActiveMenu('dashboard')}
              className={`flex-1 sm:flex-none justify-center px-2 sm:px-6 py-2.5 rounded-xl text-[13px] sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                activeMenu === 'dashboard'
                  ? 'bg-[#2e7d32] text-white shadow-md shadow-emerald-900/20 scale-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 scale-95 hover:scale-100'
              }`}
            >
              <LayoutDashboard size={18} strokeWidth={activeMenu === 'dashboard' ? 2.5 : 2} className="shrink-0" />
              <span className="truncate">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveMenu && setActiveMenu('data')}
              className={`flex-1 sm:flex-none justify-center px-2 sm:px-6 py-2.5 rounded-xl text-[13px] sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                activeMenu === 'data'
                  ? 'bg-[#2e7d32] text-white shadow-md shadow-emerald-900/20 scale-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 scale-95 hover:scale-100'
              }`}
            >
              <ShieldCheck size={18} strokeWidth={activeMenu === 'data' ? 2.5 : 2} className="shrink-0" />
              <span className="truncate">Data Karyawan</span>
            </button>
          </div>

          {children}
        </div>
      </main>
      
    </div>
  );
}
