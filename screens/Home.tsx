import React from 'react';
import { Bell, UserCircle, ArrowRight, QrCode, FilePlus, AlertTriangle, Search, Activity, Calendar } from 'lucide-react';
import { Card } from '../components/Card';
import { SpotlightCarousel } from '../components/SpotlightCarousel';
import { MOCK_KPI, MOCK_INSPECTIONS } from '../constants';
import { ScreenName } from '../types';

interface HomeProps {
    onNavigate: (screen: ScreenName) => void;
    user: any;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, user }) => {
    return (
        <div className="pb-32 animate-fade-in bg-[#F3F6F8] h-full overflow-y-auto font-sans">
            {/* Modern Header with Neon Aesthetic */}
            <div className="relative bg-slate-900 rounded-b-[40px] pt-8 pb-32 px-6 overflow-hidden shadow-2xl z-0">
                {/* Background Effects */}
                <div className="absolute top-[-50%] left-[-20%] w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px]" />
                <div className="absolute inset-0 bg-[url('/neon-bg.png')] bg-cover bg-center opacity-30 mix-blend-overlay" />

                <div className="relative z-10 flex justify-between items-start mb-6">
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
                    <div className="flex items-center gap-3">
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

                {/* Floating Search Bar */}
                <div className="relative z-10">
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

            <div className="px-6 -mt-24 relative z-10 space-y-8">
                {/* A. Spotlight Campaign (Carousel) */}
                <div className="shadow-2xl shadow-slate-200/50 rounded-[32px]">
                    <SpotlightCarousel onNavigate={onNavigate} />
                </div>

                {/* B. KPI Cards (Modern) */}
                <div>
                    <div className="flex items-center justify-between mb-4 pl-1">
                        <h4 className="text-base font-bold text-slate-800">Overview Hari Ini</h4>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Updated 5m ago</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {MOCK_KPI.slice(0, 2).map((kpi, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-50 to-emerald-50 rounded-bl-[32px] -mr-4 -mt-4 transition-all group-hover:scale-110" />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{kpi.label}</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-bold text-slate-800">{kpi.value}</span>
                                    </div>
                                    <div className={`mt-2 text-[10px] font-bold flex items-center gap-1 ${kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        <Activity size={10} />
                                        {kpi.trend === 'up' ? '+2.4%' : '-1.2%'}
                                        <span className="text-slate-300 font-medium ml-1">vs kmrn</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* C. Quick Actions & CTA */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => onNavigate('inspection')}
                        className="col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[28px] p-5 flex items-center justify-between shadow-lg shadow-slate-300 active:scale-[0.98] transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="flex flex-col items-start relative z-10">
                            <span className="text-white font-bold text-lg mb-1">Mulai Inspeksi</span>
                            <span className="text-slate-400 text-xs font-medium">Buat form P2H baru</span>
                        </div>
                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40 group-hover:scale-110 transition-transform">
                            <FilePlus size={20} />
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate('qr-scan')}
                        className="bg-white rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-slate-100 active:scale-[0.95] transition-all h-28"
                    >
                        <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-1">
                            <QrCode size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Scan QR</span>
                    </button>
                    <button
                        onClick={() => onNavigate('schedule')}
                        className="bg-white rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-slate-100 active:scale-[0.95] transition-all h-28"
                    >
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-1">
                            <Calendar size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Jadwal</span>
                    </button>
                </div>

                {/* D. Priority Alerts */}
                <div className="pb-4">
                    <h4 className="text-base font-bold text-slate-800 mb-4 pl-1">Perlu Tindakan</h4>
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
                </div>
            </div>
        </div>
    );
};