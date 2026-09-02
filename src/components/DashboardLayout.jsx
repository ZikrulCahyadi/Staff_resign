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
    <div className="flex h-screen bg-[#f8fafc] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-14 rounded flex items-center justify-center text-emerald-800 font-bold shrink-0 overflow-hidden">
              <img src={logo} alt="FR" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerText = 'FR'; e.target.parentNode.classList.add('bg-emerald-700', 'text-white') }} />
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">FR Academy</span>
          </div>
        </div>

        {/* Menu Area */}
        <div className="p-4 flex-1 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold mb-4 tracking-wider uppercase px-2">MENU UTAMA</div>
          
          <div 
            onClick={() => setActiveMenu && setActiveMenu('dashboard')}
            className={`px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
              activeMenu === 'dashboard' 
                ? 'bg-[#2e7d32] text-white shadow-sm shadow-emerald-900/20' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="font-medium text-sm">Dashboard</span>
          </div>

          <div 
            onClick={() => setActiveMenu && setActiveMenu('data')}
            className={`px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
              activeMenu === 'data' 
                ? 'bg-[#2e7d32] text-white shadow-sm shadow-emerald-900/20' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck size={18} />
            <span className="font-medium text-sm">Data Karyawan</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-100 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              DASHBOARD UTAMA
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-700 flex items-center justify-end gap-1.5">
                <Clock size={14} className="text-emerald-600" />
                {formatTime(time)}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">{formatDate(time)}</div>
            </div>

            <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
              <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-bold text-slate-800 leading-tight">Admin FR</div>
                <div className="text-[11px] text-slate-500 font-medium">Superadmin</div>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
