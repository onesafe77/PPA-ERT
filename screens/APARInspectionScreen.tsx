import React, { useState } from 'react';
import { ArrowLeft, Save, ChevronDown } from 'lucide-react';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';

interface APARFormProps {
    onNavigate: (screen: ScreenName) => void;
    user?: any;
}

const APAR_ITEMS = ['Handle', 'Lock Pin', 'Seal Segel', 'Tabung', 'Hose Nozzle', 'Braket'];

const APAR_LOCATIONS = [
    'MAIN OFFICE',
    'AREA ASSEMBLY',
    'AREA CATERING',
    'AREA GOH BAY TRACK & WHEEL',
    'BUSS BAGONG',
    'GUDANG OLI',
    'MANPOWER',
    'MASTRATECH',
    'OFFICE ERT BARU',
    'OFFICE GA MESS BARU',
    'OFFICE SHE',
    'OFFICE SS6',
    'PIT STOP FMC UT KGU',
    'PIT STOP KGU SELATAN',
    'PIT STOP KGU TENGAH',
    'PIT STOP KGU UTARA',
    'ROOM A2',
    'SWIMMING POOL',
    'VIEW POINT',
    'VIEWPOINT KGU-SELATAN',
    'WAREHOUSE UT',
    'WORKSHOP BINA PERTIWI',
    'WORKSHOP BOSTON',
    'WORKSHOP EKA DHARMA & PWB',
    'WORKSHOP FMC UT',
    'WORKSHOP HIGH VOLTAGE',
    'WORKSHOP MULTINDO',
    'WORKSHOP SENTOSA TEKHNIK',
    'WORKSHOP UNITED DIESEL',
    'WTP'
];

export const APARInspectionScreen: React.FC<APARFormProps> = ({ onNavigate, user }) => {
    const [loading, setLoading] = useState(false);

    // Header Info
    const [location, setLocation] = useState('');
    const [unitNumber, setUnitNumber] = useState('');
    const [capacity, setCapacity] = useState('6 Kg');
    const [tagNumber, setTagNumber] = useState('');

    // Checks & Status
    const [checks, setChecks] = useState<Record<string, boolean>>({});
    const [condition, setCondition] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [notes, setNotes] = useState('');
    const [pic, setPic] = useState(user?.name || '');

    const handleCheck = (item: string) => {
        setChecks(prev => ({
            ...prev,
            [item]: !prev[item] // toggle true/false
        }));
    };

    const handleSubmit = async () => {
        if (!location || !unitNumber) {
            alert('Mohon lengkapi Lokasi dan No Unit/Lokasi Detail');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/apar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: new Date(),
                    location,
                    unitNumber,
                    capacity,
                    tagNumber,
                    checklistData: JSON.stringify(checks),
                    condition,
                    notes,
                    pic,
                    userId: user?.id
                }),
            });

            const data = await response.json();
            if (data.id) {
                alert('✅ Inspeksi APAR berhasil disimpan!');
                onNavigate('history');
            } else {
                alert('Gagal menyimpan: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('Gagal terhubung ke server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#F3F6F8] font-sans pb-32 flex flex-col">
            <LoadingOverlay isLoading={loading} message="Menyimpan inspeksi..." />

            {/* Header */}
            <div className="bg-red-600 pt-6 pb-4 px-4 sticky top-0 z-20 shadow-md shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">INSPEKSI APAR</h1>
                        <p className="text-red-100 text-xs">Alat Pemadam Api Ringan</p>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

                {/* Info Fields */}
                <div className="bg-white rounded-xl p-4 shadow-sm space-y-4 max-w-5xl mx-auto w-full">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">LOKASI (AREA)</label>
                        <div className="relative">
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">-- Pilih Lokasi --</option>
                                {APAR_LOCATIONS.map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">NO UNIT / DETAIL LOKASI</label>
                            <input
                                type="text"
                                value={unitNumber}
                                onChange={(e) => setUnitNumber(e.target.value)}
                                placeholder="Contoh: Dapur KPS"
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">KAPASITAS</label>
                            <select
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            >
                                <option value="3 Kg">3 Kg</option>
                                <option value="6 Kg">6 Kg</option>
                                <option value="9 Kg">9 Kg</option>
                                <option value="12 Kg">12 Kg</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">NO TAG</label>
                        <input
                            type="text"
                            value={tagNumber}
                            onChange={(e) => setTagNumber(e.target.value)}
                            placeholder="Nomor Tag..."
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                    </div>
                </div>

                {/* Grid Layout for Checklist & Footer */}
                <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Checklist */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-red-600 text-white text-xs font-bold py-3 px-4 flex justify-between items-center">
                                <span>ITEM PEMERIKSAAN</span>
                                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">BAIK / ADA</span>
                            </div>
                            <div className="p-2 bg-slate-50 border-b border-slate-100">
                                <p className="text-[10px] text-slate-500 px-2">
                                    Ceklis item jika kondisi OK.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0 p-2 divide-y md:divide-y-0 text-slate-700">
                                {APAR_ITEMS.map((item, idx) => (
                                    <div key={idx} className="px-3 py-3 flex items-center justify-between border-b border-slate-100 last:border-0 md:border-0 hover:bg-slate-50 rounded-lg transition-colors">
                                        <span className="text-sm font-medium">{item}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={!!checks[item]}
                                                onChange={() => handleCheck(item)}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Final Status & Submit */}
                    <div className="lg:col-span-1 space-y-4 h-fit sticky top-24">
                        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">KONDISI AKHIR</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setCondition('LAYAK')}
                                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${condition === 'LAYAK' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-[1.02]' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                        LAYAK
                                    </button>
                                    <button
                                        onClick={() => setCondition('TIDAK LAYAK')}
                                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${condition === 'TIDAK LAYAK' ? 'bg-red-500 text-white border-red-500 shadow-md scale-[1.02]' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
                                    >
                                        TIDAK LAYAK
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">KETERANGAN</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Catatan tambahan..."
                                    rows={3}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">PIC (DIPERIKSA OLEH)</label>
                                <input
                                    type="text"
                                    value={pic}
                                    onChange={(e) => setPic(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
                        >
                            <Save size={20} />
                            Simpan Inspeksi
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
