import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, Clock, Truck, FileText, CheckCircle } from 'lucide-react';
import { ScreenName } from '../types';
import { Button } from '../components/Button';

interface ScheduleScreenProps {
    onNavigate: (screen: ScreenName) => void;
    user?: any;
}

interface Schedule {
    id: number;
    title: string;
    date: string;
    type: string;
    unit: string;
    notes: string;
    status: string;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ onNavigate, user }) => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        type: 'P2H',
        unit: '',
        notes: ''
    });

    const fetchSchedules = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/schedules?userId=${user?.id}`);
            if (response.ok) {
                const data = await response.json();
                setSchedules(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const dateTime = new Date(`${formData.date}T${formData.time}`);

            const response = await fetch('http://localhost:3000/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    date: dateTime.toISOString(),
                    userId: user?.id || 1
                })
            });

            if (response.ok) {
                setShowForm(false);
                fetchSchedules();
                setFormData({ title: '', date: '', time: '', type: 'P2H', unit: '', notes: '' });
                alert('Jadwal berhasil dibuat!');
            }
        } catch (error) {
            console.error(error);
            alert('Gagal membuat jadwal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full bg-[#F3F6F8] flex flex-col font-sans animate-fade-in">
            {/* Header */}
            <div className="bg-slate-900 pt-8 pb-10 px-6 rounded-b-[40px] shadow-2xl relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[url('/neon-bg.png')] bg-cover bg-center opacity-30 mix-blend-overlay" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => onNavigate('home')}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-white tracking-tight">Jadwal Inspeksi</h1>
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 -mt-4 pt-6 space-y-4 relative z-0">
                {schedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Calendar size={48} className="mb-4 text-slate-300" />
                        <p className="font-medium">Belum ada jadwal hari ini</p>
                        <button onClick={() => setShowForm(true)} className="text-emerald-500 font-bold text-sm mt-2">Buat Jadwal Baru</button>
                    </div>
                ) : (
                    schedules.map((schedule) => (
                        <div key={schedule.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${schedule.type === 'P2H' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {schedule.type}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(schedule.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-base">{schedule.title}</h3>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                                    <Calendar size={14} className="text-slate-400" />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-50">
                                <span className="flex items-center gap-1"><Truck size={12} /> {schedule.unit}</span>
                                <span className="flex items-center gap-1"><FileText size={12} /> {schedule.status}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Schedule Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl relative animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Buat Jadwal</h2>
                            <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <XIcon />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 ml-2 mb-1">Judul Inspeksi</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 placeholder-slate-300"
                                    placeholder="Contoh: P2H Pagi Unit 01"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 ml-2 mb-1">Tanggal</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 ml-2 mb-1">Jam</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 ml-2 mb-1">Tipe</label>
                                    <select
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="P2H">P2H Unit</option>
                                        <option value="Gear">ERT Gear</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 ml-2 mb-1">Unit / Area</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 placeholder-slate-300"
                                        placeholder="Fire Truck 01"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 ml-2 mb-1">Catatan Tambahan</label>
                                <textarea
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 placeholder-slate-300 min-h-[80px]"
                                    placeholder="Instruksi khusus..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                className="!rounded-2xl !h-12 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 mt-4"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Menyimpan...' : 'Simpan Jadwal'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple X Icon component
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
