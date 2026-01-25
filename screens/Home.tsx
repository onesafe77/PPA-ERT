import React from 'react';
import { Bell, UserCircle, ArrowRight, QrCode, FilePlus, AlertTriangle, Search, Activity, Calendar, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card } from '../components/Card';
import { SpotlightCarousel } from '../components/SpotlightCarousel';
import { MOCK_KPI, MOCK_INSPECTIONS } from '../constants';
import { ScreenName } from '../types';

interface HomeProps {
    onNavigate: (screen: ScreenName) => void;
    user: any;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, user }) => {
    // Shared Components
    const Greeting = () => (
        <div>
            <p className="text-emerald-100 text-sm font-medium mb-1 tracking-wide">
                {(() => {
                    const hour = new Date().getHours();
                    if (hour < 11) return 'Selamat Pagi,';
                    if (hour < 15) return 'Selamat Siang,';
                    if (hour < 18) return 'Selamat Sore,';
                    return 'Selamat Malam,';
                })()}
            </p>
            <h2 className="text-3xl font-bold text-white tracking-tight">{user?.name || 'User'}</h2>
            <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-[10px] text-emerald-200 font-bold uppercase tracking-wider">
                    {user?.role === 'user' ? 'ERT Personnel' : (user?.role || 'Staff')}
                </span>
            </div>
        </div>
    );

    const KPIWidget = () => (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {MOCK_KPI.map((kpi, idx) => (
                <div key={idx} className="bg-white p-4 md:p-6 rounded-[24px] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-slate-50 to-emerald-50 rounded-bl-[32px] -mr-4 -mt-4 transition-all group-hover:scale-110" />
                    <div className="relative z-10">
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{kpi.label}</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl md:text-3xl font-bold text-slate-800">{kpi.value}</span>
                        </div>
                        <div className={`mt-2 text-[10px] md:text-xs font-bold flex items-center gap-1 ${kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                            <Activity size={12} />
                            {kpi.trend === 'up' ? '+2.4%' : '-1.2%'}
                            <span className="text-slate-300 font-medium ml-1">vs kmrn</span>
                        </div>
                    </div>
                </div>
            ))}
            {/* Desktop Only Extra KPI for Balance */}
            <div className="hidden lg:block bg-indigo-50 p-6 rounded-[24px] shadow-sm border border-indigo-100 relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Total Inspeksi</p>
                    <span className="text-3xl font-bold text-indigo-900">142</span>
                    <div className="mt-2 text-xs font-bold flex items-center gap-1 text-indigo-600">
                        <Calendar size={12} />
                        Bulan Ini
                    </div>
                </div>
            </div>
        </div>
    );

    const QuickActions = () => (
        <div className="grid grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 h-full">
            <button
                onClick={() => onNavigate('inspection')}
                className="col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[28px] p-5 md:p-6 flex items-center justify-between shadow-lg shadow-slate-300 active:scale-[0.98] transition-all group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="flex flex-col items-start relative z-10">
                    <span className="text-white font-bold text-lg mb-1">Mulai Inspeksi</span>
                    <span className="text-slate-400 text-xs font-medium">Buat form P2H & GEAR baru</span>
                </div>
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40 group-hover:scale-110 transition-transform">
                    <FilePlus size={20} />
                </div>
            </button>

            <button
                onClick={() => onNavigate('qr-scan')}
                className="bg-white rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-slate-100 active:scale-[0.95] transition-all h-28 hover:border-emerald-200 hover:shadow-md"
            >
                <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-1 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <QrCode size={20} />
                </div>
                <span className="text-xs font-bold text-slate-700">Scan QR</span>
            </button>

            <button
                onClick={() => onNavigate('pica-form')}
                className="bg-red-50 rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-red-100 active:scale-[0.95] transition-all h-28 group hover:shadow-red-100"
            >
                <div className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center mb-1 shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                    <AlertTriangle size={20} />
                </div>
                <span className="text-xs font-bold text-red-700">Lapor PICA</span>
            </button>
        </div>
    );

    const RecentAlertsList = () => (
        <div className="space-y-3">
            {MOCK_INSPECTIONS.filter(i => i.severity === 'Critical' || i.status === 'NOT READY').map((item) => (
                <div
                    key={item.id}
                    onClick={() => onNavigate('history')}
                    className="bg-white rounded-[24px] p-4 flex gap-4 items-center shadow-card border border-slate-100 cursor-pointer hover:shadow-float transition-all"
                >
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 flex-shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-bold text-slate-800 mb-1">{item.title}</h5>
                        <div className="flex items-center gap-2">
                            <span className="bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded-full">{item.status}</span>
                            <span className="text-xs text-slate-400 font-medium">{item.location}</span>
                        </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
                        <ArrowRight size={14} className="text-slate-400" />
                    </div>
                </div>
            ))}
        </div>
    );

    const RecentAlertsTable = () => (
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                        <AlertTriangle size={16} />
                    </div>
                    <h3 className="font-bold text-slate-800">Alert Prioritas</h3>
                </div>
                <button onClick={() => onNavigate('history')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    Lihat Semua <ArrowRight size={12} />
                </button>
            </div>
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 font-bold">Judul Inspeksi</th>
                        <th className="px-6 py-3 font-bold">Lokasi</th>
                        <th className="px-6 py-3 font-bold">Status</th>
                        <th className="px-6 py-3 font-bold">Waktu</th>
                        <th className="px-6 py-3 font-bold text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {MOCK_INSPECTIONS.filter(i => i.severity === 'Critical' || i.status === 'NOT READY').map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4 font-bold text-slate-800">
                                {item.title}
                                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{item.type} • #{item.id}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{item.location}</td>
                            <td className="px-6 py-4">
                                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full border border-red-200">{item.status}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                                <span className="flex items-center gap-1.5 text-xs">
                                    <Clock size={12} /> {item.date}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => onNavigate('history')} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                    <ChevronRight size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="pb-32 md:pb-8 animate-fade-in bg-[#F3F6F8] h-full overflow-y-auto font-sans">
            {/* Header Area */}
            <div className="relative bg-slate-900 md:rounded-b-[0px] md:bg-slate-900 rounded-b-[40px] pt-8 pb-32 md:pb-12 px-6 md:px-10 overflow-hidden shadow-2xl md:shadow-md z-0">
                {/* Background Effects */}
                <div className="absolute top-[-50%] left-[-20%] w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px]" />
                <div className="absolute inset-0 bg-[url('/neon-bg.png')] bg-cover bg-center opacity-30 mix-blend-overlay" />

                <div className="relative z-10 flex justify-between items-start mb-6 md:mb-0">
                    <Greeting />
                    <div className="flex items-center gap-3">
                        {/* Desktop Search */}
                        <div className="hidden md:flex relative mr-4">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 flex items-center shadow-lg w-64 focus-within:w-80 transition-all">
                                <Search size={18} className="text-emerald-100/70 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Cari..."
                                    className="bg-transparent border-none text-white placeholder-emerald-100/50 text-sm w-full focus:ring-0 focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => onNavigate('notifications')}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10 relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900 shadow-sm"></span>
                        </button>
                        <button
                            onClick={() => onNavigate('profile')}
                            className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 border-2 border-slate-800"
                        >
                            <UserCircle size={24} />
                        </button>
                    </div>
                </div>

                {/* Search Bar (Mobile Only) */}
                <div className="relative z-10 md:hidden mt-6">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1 flex items-center shadow-lg">
                        <div className="w-10 h-10 flex items-center justify-center text-emerald-100/70">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari unit, laporan, atau inspeksi..."
                            className="bg-transparent border-none text-white placeholder-emerald-100/50 text-sm w-full focus:ring-0"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-6 md:px-10 -mt-24 md:-mt-8 relative z-10 space-y-8 md:space-y-6 max-w-7xl md:max-w-full md:mx-auto">

                {/* 1. Statistics Row */}
                <KPIWidget />

                {/* 2. Middle Section: Spotlight & Actions */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Spotlight (Mobile: Full, Desktop: Col Span 8) */}
                    <div className="md:col-span-12 lg:col-span-8 shadow-2xl shadow-slate-200/50 rounded-[32px] md:shadow-sm">
                        <SpotlightCarousel onNavigate={onNavigate} />
                    </div>

                    {/* Quick Actions (Mobile: Grid, Desktop: Col Span 4 Sidebar) */}
                    <div className="md:col-span-12 lg:col-span-4 h-full">
                        <div className="md:hidden">
                            <QuickActions />
                        </div>
                        <div className="hidden md:block h-full">
                            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100 h-full flex flex-col gap-4">
                                <h3 className="font-bold text-slate-800 mb-2">Aksi Cepat</h3>
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                    <button
                                        onClick={() => onNavigate('inspection')}
                                        className="col-span-2 bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors group"
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className="font-bold text-sm">Inspeksi Baru</span>
                                            <span className="text-xs text-slate-400">Form P2H & GEAR</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <FilePlus size={16} />
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => onNavigate('qr-scan')}
                                        className="bg-slate-50 text-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                                    >
                                        <QrCode size={20} />
                                        <span className="text-xs font-bold">Scan QR</span>
                                    </button>
                                    <button
                                        onClick={() => onNavigate('pica-form')}
                                        className="bg-red-50 text-red-600 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                    >
                                        <AlertTriangle size={20} />
                                        <span className="text-xs font-bold">PICA</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Section: Alerts */}
                <div>
                    <div className="md:hidden">
                        <div className="flex items-center justify-between mb-4 pl-1">
                            <h4 className="text-base font-bold text-slate-800">Perlu Tindakan</h4>
                        </div>
                        <RecentAlertsList />
                    </div>
                    <div className="hidden md:block">
                        <RecentAlertsTable />
                    </div>
                </div>
            </div>
        </div>
    );
};
