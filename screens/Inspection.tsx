import React, { useState, useEffect } from 'react';
import { Search, QrCode, Truck, Wrench, History, Plus, Filter, Calendar } from 'lucide-react';
import { StatusPill } from '../components/Card';
import { ScreenName } from '../types';

interface InspectionScreenProps {
    onNavigate?: (screen: ScreenName) => void;
}

export const InspectionScreen: React.FC<InspectionScreenProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'P2H & GEAR' | 'APAR' | 'Hydrant' | 'Eye Wash' | 'Smoke Detector'>('P2H & GEAR');
    const [inspections, setInspections] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInspections();
    }, []);

    const fetchInspections = async () => {
        setLoading(true);
        try {
            const [p2hRes, aparRes, hydrantRes, eyewashRes, smokeDetectorRes] = await Promise.all([
                fetch('/api/p2h'),
                fetch('/api/apar'),
                fetch('/api/hydrant'),
                fetch('/api/eyewash'),
                fetch('/api/smoke-detector')
            ]);

            const p2hData = await p2hRes.json();
            const aparData = await aparRes.json();
            const hydrantData = await hydrantRes.json();
            const eyewashData = await eyewashRes.json();
            const smokeDetectorData = await smokeDetectorRes.json();

            const combined = [
                ...p2hData.map((item: any) => ({ ...item, type: 'P2H & GEAR', title: `${item.unitNumber} - ${item.vehicleType}` })),
                ...aparData.map((item: any) => ({ ...item, type: 'APAR', title: `APAR ${item.tagNumber || ''} - ${item.capacity}` })),
                ...hydrantData.map((item: any) => ({ ...item, type: 'Hydrant', title: `Hydrant ${item.location}` })),
                ...eyewashData.map((item: any) => ({ ...item, type: 'Eye Wash', title: `Eye Wash ${item.regNumber} - ${item.location}` })),
                ...smokeDetectorData.map((item: any) => ({ ...item, type: 'Smoke Detector', title: `Smoke Detector ${item.subLokasi}` }))
            ];

            // Sort by date newest
            combined.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());

            setInspections(combined);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const getTabColor = (tab: string) => {
        if (tab === 'APAR') return 'from-red-500 to-rose-600';
        if (tab === 'Hydrant') return 'from-blue-500 to-cyan-500';
        if (tab === 'P2H & GEAR') return 'from-emerald-500 to-teal-600';
        if (tab === 'Eye Wash') return 'from-amber-500 to-yellow-600';
        if (tab === 'Smoke Detector') return 'from-purple-500 to-violet-600';
        return 'from-emerald-500 to-teal-600';
    };

    const getStatusPillColor = (status: string) => {
        if (status === 'APPROVED') return 'bg-emerald-500';
        if (status === 'NOT_READY' || status === 'TIDAK LAYAK') return 'bg-red-500';
        return 'bg-amber-500';
    };

    const filteredInspections = inspections.filter(i => i.type === activeTab).slice(0, 5);

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
                    <div className="grid grid-cols-5 p-1 bg-white/10 backdrop-blur-md rounded-[24px] border border-white/10 mb-6 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('P2H & GEAR')}
                            className={`py-3 rounded-[20px] text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === 'P2H & GEAR' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                        >
                            <Truck size={14} /> P2H & GEAR
                        </button>
                        <button
                            onClick={() => setActiveTab('APAR')}
                            className={`py-3 rounded-[20px] text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === 'APAR' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-[10px]">🔥</span> APAR
                        </button>
                        <button
                            onClick={() => setActiveTab('Hydrant')}
                            className={`py-3 rounded-[20px] text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === 'Hydrant' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-[10px]">💧</span> Hydrant
                        </button>
                        <button
                            onClick={() => setActiveTab('Eye Wash')}
                            className={`py-3 rounded-[20px] text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === 'Eye Wash' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-[10px]">👁️</span> Eye Wash
                        </button>
                        <button
                            onClick={() => setActiveTab('Smoke Detector')}
                            className={`py-3 rounded-[20px] text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === 'Smoke Detector' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="text-[10px]">🔔</span> Smoke
                        </button>
                    </div>

                    {/* Modern Search */}
                    <div className="flex gap-3">
                        <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center px-4 h-[52px] shadow-lg">
                            <Search size={20} className="text-slate-400 mr-3" />
                            <input
                                type="text"
                                placeholder={activeTab === 'P2H & GEAR' ? "Cari No. Unit..." : "Cari Kode Alat..."}
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
                    onClick={() => {
                        if (!onNavigate) return;
                        if (activeTab === 'P2H & GEAR') onNavigate('p2h-form');
                        else if (activeTab === 'APAR') onNavigate('apar-form');
                        else if (activeTab === 'Hydrant') onNavigate('hydrant-form');
                        else if (activeTab === 'Eye Wash') onNavigate('eyewash-form');
                        else if (activeTab === 'Smoke Detector') onNavigate('smoke-detector-form');
                        else onNavigate('p2h-form'); // Default
                    }}
                    className={`w-full p-1 rounded-[32px] bg-gradient-to-br ${getTabColor(activeTab)} shadow-xl shadow-slate-200 group active:scale-[0.98] transition-all`}
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
                        <button
                            onClick={() => onNavigate && onNavigate('history')}
                            className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full"
                        >
                            See All
                        </button>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-8 text-slate-400 text-xs">Memuat data...</div>
                        ) : filteredInspections.map((item) => (
                            <div key={`${item.type}-${item.id}`} className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1 h-full ${getStatusPillColor(item.status)}`} />

                                <div className="flex justify-between items-start pl-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">#{item.id}</span>
                                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                <Calendar size={10} /> {formatDate(item.date || item.createdAt)}
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
                        {!loading && filteredInspections.length === 0 && (
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