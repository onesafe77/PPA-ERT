import React, { useState } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { ArrowLeft, Save, Check, X, Trash2 } from 'lucide-react';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { SignaturePad } from '../components/SignaturePad';
import { PhotoCapture } from '../components/PhotoCapture';

interface P2HFormProps {
    onNavigate: (screen: ScreenName) => void;
    user?: any;
}

// All checklist items in one flat list
const ALL_ITEMS = [
    'Level Oil Engine', 'Baut Roda', 'Chasis',
    'Level Oil Clutch', 'Kondisi Rim', 'Air Cleaner',
    'Level Coolant', 'Keausan Tyer', 'Kondisi Battery',
    'Level Oil Hydraulic PTO', 'Kondisi Spring', 'Brake Air Tank',
    'Oil Steering', 'Pin Spring', 'Emergency Stop',
    'Level Water Wipper', 'U Bolt Spring', 'Water Separator',
    'Kebocoran All Area', 'Kondisi All Lamp', 'Kondisi /Fungsi AC',
    'Wipper', 'Adjusment Aperator Seat', 'Service Brake & Exhaust Brake',
    'Kondisi Rubber Torqrod', 'Fungsi Safety Belt & Horn', 'Fungsi Radio Komunikasi',
    // Attachment
    'Strainer', 'Discharge Hose 2,5', 'Suction Key',
    'Spot Lamp', 'Discharge Hose 1,5', 'Fire Axe',
    'Suction Hose 6x4 Meter', 'Tail Light', 'Crowbar',
    'Spare Tyer', 'Fire Pump Darley', 'Hook',
    'Gun Nozzle 2,5', 'Water Cannon', 'Y Connection',
    'Gun Nozzle 1,5', 'Water Tank', 'Apar 9 Kg',
    'Manilla Rope', 'Fireman Suit', 'Foam Tube',
    'Wheel Stopper', 'Foam Tank'
];

type CheckStatus = 'v' | 'x' | null;

interface CheckItem {
    status: CheckStatus;
    tindakan: string;
}

export const P2HFormScreen: React.FC<P2HFormProps> = ({ onNavigate, user }) => {
    const [loading, setLoading] = useState(false);
    const [nama, setNama] = useLocalStorage('p2h_nama', user?.name || '');
    const [tanggal] = useState(new Date().toISOString().split('T')[0]);
    const [hm, setHm] = useLocalStorage('p2h_hm', '');
    const [unit, setUnit] = useLocalStorage('p2h_unit', '');
    const [shift, setShift] = useLocalStorage('p2h_shift', '');
    const [simper, setSimper] = useLocalStorage('p2h_simper', '');
    const [checks, setChecks] = useLocalStorage<Record<string, CheckItem>>('p2h_checks', {});
    const [kerusakanLain, setKerusakanLain] = useLocalStorage('p2h_kerusakanLain', '');
    const [photo, setPhoto] = useLocalStorage('p2h_photo', '');
    const [signatureUser, setSignatureUser] = useLocalStorage('p2h_signatureUser', '');
    const [signatureDriver, setSignatureDriver] = useLocalStorage('p2h_signatureDriver', '');
    const [showTindakanFor, setShowTindakanFor] = useState<string | null>(null);

    const handleCheck = (item: string, status: CheckStatus) => {
        setChecks(prev => ({
            ...prev,
            [item]: { ...prev[item], status }
        }));
    };

    const handleTindakan = (item: string, tindakan: string) => {
        setChecks(prev => ({
            ...prev,
            [item]: { ...prev[item], tindakan }
        }));
    };

    const handleSubmit = async () => {
        if (!nama || !unit || !shift) {
            alert('Mohon lengkapi NAMA, UNIT, dan SHIFT.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/p2h', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    unitNumber: unit,
                    vehicleType: 'Fire Truck',
                    operatorName: nama,
                    shift,
                    location: '',
                    checklistData: JSON.stringify({
                        hm,
                        simper,
                        checks,
                        kerusakanLain,
                        photo, // Save photo
                        signatureUser,
                        signatureDriver
                    }),
                    notes: kerusakanLain,
                    userId: user?.id
                }),
            });

            const data = await response.json();
            if (data.id) {
                alert('✅ Inspeksi P2H berhasil disimpan!');

                // Clear storage
                localStorage.removeItem('p2h_nama');
                localStorage.removeItem('p2h_hm');
                localStorage.removeItem('p2h_unit');
                localStorage.removeItem('p2h_shift');
                localStorage.removeItem('p2h_simper');
                localStorage.removeItem('p2h_checks');
                localStorage.removeItem('p2h_kerusakanLain');
                localStorage.removeItem('p2h_photo');
                localStorage.removeItem('p2h_signatureUser');
                localStorage.removeItem('p2h_signatureDriver');

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
            <div className="bg-red-600 pt-6 pb-4 px-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('inspection')}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">P2H UNIT FIRE TRUK</h1>
                        <p className="text-red-100 text-xs">Program Pemeriksaan Harian</p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="p-4 space-y-4">

                {/* Info Fields */}
                <div className="bg-white rounded-xl p-4 shadow-sm max-w-5xl mx-auto w-full">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                        <div className="lg:col-span-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">NAMA</label>
                            <input
                                type="text"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">SHIFT</label>
                            <select
                                value={shift}
                                onChange={(e) => setShift(e.target.value)}
                                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            >
                                <option value="">Pilih</option>
                                <option value="I">I</option>
                                <option value="II">II</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">UNIT</label>
                            <input
                                type="text"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                placeholder="FIRE TRUCK..."
                                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase">HM</label>
                            <input
                                type="text"
                                value={hm}
                                onChange={(e) => setHm(e.target.value)}
                                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">SIMPER</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="simper" value="YA" checked={simper === 'YA'} onChange={(e) => setSimper(e.target.value)} />
                                    <span className="text-sm">YA</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="simper" value="TIDAK" checked={simper === 'TIDAK'} onChange={(e) => setSimper(e.target.value)} />
                                    <span className="text-sm">TIDAK</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Desktop Grid Wrapper for Checklists */}
            <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Walk Around Check */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full">
                    <div className="bg-red-600 text-white text-xs font-bold py-2 px-4">
                        WALK AROUND CHECK
                    </div>
                    <p className="text-[10px] text-slate-500 px-4 py-2 bg-slate-50">
                        Pastikan kotak kolom ditandai, contoh (X) kerusakan yang ditemukan, (V) untuk Layak
                    </p>
                    <div className="divide-y divide-slate-100">
                        {ALL_ITEMS.slice(0, 27).map((item, idx) => (
                            <div key={idx} className="px-4 py-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-700 flex-1">{item}</span>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleCheck(item, 'v')}
                                            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${checks[item]?.status === 'v' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCheck(item, 'x')}
                                            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${checks[item]?.status === 'x' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                                {checks[item]?.status === 'x' && (
                                    <input
                                        type="text"
                                        value={checks[item]?.tindakan || ''}
                                        onChange={(e) => handleTindakan(item, e.target.value)}
                                        placeholder="Tindakan yang dilakukan..."
                                        className="mt-2 w-full h-8 px-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 placeholder-red-300"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attachment Check */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm h-full">
                    <div className="bg-red-600 text-white text-xs font-bold py-2 px-4">
                        PENGECHECKAN ATT ACHEMENT
                    </div>
                    <div className="divide-y divide-slate-100">
                        {ALL_ITEMS.slice(27).map((item, idx) => (
                            <div key={idx} className="px-4 py-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-700 flex-1">{item}</span>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleCheck(item, 'v')}
                                            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${checks[item]?.status === 'v' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCheck(item, 'x')}
                                            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${checks[item]?.status === 'x' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                                {checks[item]?.status === 'x' && (
                                    <input
                                        type="text"
                                        value={checks[item]?.tindakan || ''}
                                        onChange={(e) => handleTindakan(item, e.target.value)}
                                        placeholder="Tindakan yang dilakukan..."
                                        className="mt-2 w-full h-8 px-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 placeholder-red-300"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full text-center space-y-4">

                {/* Kerusakan Lain */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Kerusakan Lain:</label>
                    <textarea
                        value={kerusakanLain}
                        onChange={(e) => setKerusakanLain(e.target.value)}
                        placeholder="Tuliskan kerusakan lain jika ada..."
                        rows={2}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none"
                    />
                </div>

                {/* Foto Dokumentasi */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <PhotoCapture
                        label="FOTO DOKUMENTASI (Tambahan)"
                        onPhotoCaptured={setPhoto}
                        initialImage={photo}
                    />
                </div>

                {/* Tanda Tangan User & Driver */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <SignaturePad
                            label="Tanda Tangan User"
                            onSignatureChange={setSignatureUser}
                        />
                        <SignaturePad
                            label="Tanda Tangan Driver"
                            onSignatureChange={setSignatureDriver}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (confirm('Reset formulir P2H? Data akan dihapus.')) {
                                localStorage.removeItem('p2h_nama');
                                localStorage.removeItem('p2h_hm');
                                localStorage.removeItem('p2h_unit');
                                localStorage.removeItem('p2h_shift');
                                localStorage.removeItem('p2h_simper');
                                localStorage.removeItem('p2h_checks');
                                localStorage.removeItem('p2h_kerusakanLain');
                                localStorage.removeItem('p2h_photo');
                                localStorage.removeItem('p2h_signatureUser');
                                localStorage.removeItem('p2h_signatureDriver');
                                window.location.reload();
                            }
                        }}
                        className="w-1/3 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-4 rounded-xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={20} />
                        Reset
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <Save size={20} />
                        Simpan Inspeksi P2H
                    </button>
                </div>
            </div>
        </div >
    );
};
