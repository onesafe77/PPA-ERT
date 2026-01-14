import React, { useState } from 'react';
import { Search, QrCode, Truck, Wrench, History, Plus, Filter, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import { StatusPill } from '../components/Card';
import { MOCK_INSPECTIONS } from '../constants';

import { ScreenName } from '../types';

interface InspectionScreenProps {
    onNavigate?: (screen: ScreenName) => void;
}

export const InspectionScreen: React.FC<InspectionScreenProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'P2H' | 'Gear'>('P2H');

    return (
        <div className="pb-32 animate-fade-in flex flex-col h-full bg-[#F3F6F8] font-sans">
            {/* Heavy Neon Header */}
            <div className="relative bg-slate-900 pt-8 pb-10 px-6 rounded-b-[40px] shadow-2xl z-10 overflow-hidden shrink-0">
                {/* Background Effects */}
                <div className="absolute top-[-50%] left-[-20%] w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px]" />
                <div className="absolute inset-0 bg-[url('/neon-bg.png')] bg-cover bg-center opacity-30 mix-blend-overlay" />

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Inspeksi</h1>
                        <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10">
                            <Filter size={20} />
                        </button>
                    </div>

                    {/* Glass Tabs */}
                    <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/10 mb-6">
                        <button
                            onClick={() => setActiveTab('P2H')}
                            className={`flex-1 py-3 rounded-[20px] text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'P2H' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                        >
                            <Truck size={18} /> Unit P2H
                        </button>
                        <button
                            onClick={() => setActiveTab('Gear')}
                            className={`flex-1 py-3 rounded-[20px] text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${activeTab === 'Gear' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                        >
                            <Wrench size={18} /> ERT Gear
                        </button>
                    </div>

                    {/* Modern Search */}
                    <div className="flex gap-3">
                        <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center px-4 h-[52px] shadow-lg">
                            <Search size={20} className="text-slate-400 mr-3" />
                            <input
                                type="text"
                                placeholder={activeTab === 'P2H' ? "Cari No. Unit..." : "Cari Kode Alat..."}
                                className="bg-transparent border-none text-white placeholder-slate-400 text-sm w-full focus:ring-0 p-0"
                            />
                        </div>
                        <button className="w-[52px] h-[52px] bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                            <QrCode size={22} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 -mt-4 pt-8 space-y-6 relative z-0">

                {/* Start Inspection Card */}
                <button
                    onClick={() => onNavigate && onNavigate(activeTab === 'P2H' ? 'p2h-form' : 'p2h-form')}
                    className={`w-full p-1 rounded-[32px] bg-gradient-to-br ${activeTab === 'P2H' ? 'from-emerald-500 to-teal-600' : 'from-blue-500 to-indigo-600'} shadow-xl shadow-slate-200 group active:scale-[0.98] transition-all`}
                >
                    <div className="bg-white/10 backdrop-blur-sm rounded-[30px] p-5 flex items-center justify-between border border-white/20 h-[80px]">
                        <div className="flex flex-col items-start pl-2">
                            <span className="text-white font-bold text-lg">Mulai Inspeksi {activeTab}</span>
                            <span className="text-white/80 text-xs font-medium">Buat laporan baru sekarang</span>
                        </div>
                        <div className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                    </div>
                </button>

                {/* History Section */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <History size={16} className="text-slate-400" />
                            Baru Dilihat
                        </h2>
                        <button className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">See All</button>
                    </div>

                    <div className="space-y-3">
                        {MOCK_INSPECTIONS.filter(i => i.type === activeTab).map((item) => (
                            <div key={item.id} className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full ${item.status === 'Approved' ? 'bg-emerald-500' : item.status === 'NOT READY' ? 'bg-red-500' : 'bg-amber-500'}`} />

                                <div className="flex justify-between items-start pl-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{item.id}</span>
                                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                <Calendar size={10} /> {item.date}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                            <Truck size={12} /> {item.location}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <StatusPill status={item.status} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {MOCK_INSPECTIONS.filter(i => i.type === activeTab).length === 0 && (
                            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/50 flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                    <History size={24} />
                                </div>
                                <p className="text-slate-400 font-medium text-sm">Belum ada riwayat {activeTab}.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};