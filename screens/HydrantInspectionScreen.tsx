
import React, { useState } from 'react';
import { ArrowLeft, Save, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';

interface HydrantFormProps {
    onNavigate: (screen: ScreenName) => void;
    user?: any;
}

// Structure based on images
const LINES = ['LINE 1', 'LINE 2', 'LINE 3'];

const HYDRANT_CHECKLIST = [
    {
        component: 'BOX HYDRANT',
        items: [
            'Kondisi Box Bersih',
            'Tidak ada barang lain Selain Perlengkapan Hydrant'
        ]
    },
    {
        component: 'JET NOOZLE',
        items: [
            'Tidak Terdapat retakan Atau Bocor',
            'Kaitan Sambungan Kopling Tidak Aus'
        ]
    },
    {
        component: 'HOSE HYDRANT',
        items: [
            'Tidak dalam Keadaan Bocor',
            'Tersusun Rapi di Hose Rack'
        ]
    },
    {
        component: 'HOSE RACK',
        items: [
            'Rack Tidak Ada Yang Patah',
            'Mudah di urai Jika digunakan'
        ]
    },
    {
        component: 'KUNCI HYDRANT PILLAR',
        items: [
            'Tersedia Kunci Hydrant',
            'Kunci Hydrant Valve Berfungsi Dengan Baik'
        ]
    },
    {
        component: 'WATER CANNON',
        items: [
            'Tidak Ada Keretakan, Kebocoran & Berkarat',
            'Mekanisme katup Bisa dibuka, ditutup & diputar dengan lancar',
            'Mekanisme Drainase Tidak Ada Sumbatan'
        ]
    },
    {
        component: 'HYDRANT PILLAR',
        items: [
            'Tidak ada Retakan, Korosi atau keausan',
            'Tidak dalam Keadaan Bocor',
            'Mudah Digunakan dan Tidak Berkarat',
            'Valve pillar Hydran di buka & di tutup dengan mudah',
            'Tidak ada sumbatan'
        ]
    },
    {
        component: 'PIPA HYDRANT',
        items: [
            'Pipa Hydrant Tidak ada kebocoran, retakan & korosif'
        ]
    }
];

export const HydrantInspectionScreen: React.FC<HydrantFormProps> = ({ onNavigate, user }) => {
    const [loading, setLoading] = useState(false);

    const [location, setLocation] = useState('');
    const [shift, setShift] = useState('');
    const [notes, setNotes] = useState('');
    const [pic, setPic] = useState(user?.name || '');

    const [activeLine, setActiveLine] = useState('LINE 1');
    const [checks, setChecks] = useState<Record<string, Record<string, string>>>({}); // { Line1: { "Box Hydrant - Kondisi...": "v" } }

    const handleCheck = (line: string, itemKey: string, status: string) => {
        setChecks(prev => ({
            ...prev,
            [line]: {
                ...(prev[line] || {}),
                [itemKey]: status
            }
        }));
    };

    const handleSubmit = async () => {
        if (!location) {
            alert('Mohon isi Lokasi Inspeksi');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/hydrant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: new Date(),
                    location,
                    shift,
                    checklistData: JSON.stringify(checks),
                    notes,
                    pic,
                    userId: user?.id
                }),
            });

            const data = await response.json();
            if (data.id) {
                alert('✅ Inspeksi Hydrant berhasil disimpan!');
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
        <div className="h-full overflow-y-auto bg-[#F3F6F8] font-sans pb-32">
            <LoadingOverlay isLoading={loading} message="Menyimpan inspeksi..." />

            {/* Header */}
            <div className="bg-blue-600 pt-6 pb-4 px-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">INSPEKSI HYDRANT</h1>
                        <p className="text-blue-100 text-xs">Alat Proteksi Kebakaran</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Info Fields */}
                <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">LOKASI (AREA)</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Contoh: Gudang Handak, Emulsion Plant..."
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">PERIODE / SHIFT</label>
                        <input
                            type="text"
                            value={shift}
                            onChange={(e) => setShift(e.target.value)}
                            placeholder="Januari 2026..."
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                        />
                    </div>
                </div>

                {/* Lines Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {LINES.map(line => (
                        <button
                            key={line}
                            onClick={() => setActiveLine(line)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeLine === line ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-500 border border-slate-200'}`}
                        >
                            {line}
                        </button>
                    ))}
                </div>

            </div>

            {/* Content Grid */}
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4">
                {/* Checklist Column 1 */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-800 text-white text-xs font-bold py-3 px-4 flex justify-between items-center">
                            <span>CHECKLIST {activeLine}</span>
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">L / TL</span>
                        </div>

                        <div className="divide-y divide-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0 p-2 md:divide-y-0">
                            {HYDRANT_CHECKLIST.map((section, idx) => (
                                <div key={idx} className="p-4 border-b border-slate-100 last:border-0 md:border-0">
                                    <h4 className="text-[10px] font-black text-blue-600 uppercase mb-3 tracking-wider">{section.component}</h4>
                                    <div className="space-y-3">
                                        {section.items.map((item, i) => {
                                            const uniqueKey = `${section.component}-${item}`;
                                            const currentStatus = checks[activeLine]?.[uniqueKey];

                                            return (
                                                <div key={i} className="flex items-start justify-between gap-4">
                                                    <span className="text-xs font-medium text-slate-700 leading-snug pt-1">{item}</span>
                                                    <div className="flex gap-1 shrink-0">
                                                        <button
                                                            onClick={() => handleCheck(activeLine, uniqueKey, 'L')}
                                                            className={`w-8 h-8 rounded flex items-center justify-center transition-all border ${currentStatus === 'L' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-300 border-slate-200'}`}
                                                        >
                                                            <span className="text-[10px] font-bold">L</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleCheck(activeLine, uniqueKey, 'TL')}
                                                            className={`w-8 h-8 rounded flex items-center justify-center transition-all border ${currentStatus === 'TL' ? 'bg-red-500 text-white border-red-500' : 'bg-slate-50 text-slate-300 border-slate-200'}`}
                                                        >
                                                            <span className="text-[10px] font-bold">TL</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column (Footer Info) */}
                <div className="lg:col-span-1 space-y-4 h-fit sticky top-20">
                    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">KETERANGAN</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Catatan tambahan..."
                                rows={2}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">PIC (DIPERIKSA OLEH)</label>
                            <input
                                type="text"
                                value={pic}
                                onChange={(e) => setPic(e.target.value)}
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <Save size={20} />
                        Simpan Inspeksi Hydrant
                    </button>
                </div>
            </div>
        </div>
    );
};
