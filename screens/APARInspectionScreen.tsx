import React, { useState } from 'react';
import { ArrowLeft, Save, ChevronDown, Plus, Trash2, FileText } from 'lucide-react';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { generateAPARPDF } from '../utils/pdfGenerator';

interface APARFormProps {
    onNavigate: (screen: ScreenName) => void;
    user?: any;
}

interface APARUnit {
    id: number;
    unitNumber: string;
    capacity: string;
    tagNumber: string;
    checks: Record<string, boolean>;
    condition: 'LAYAK' | 'TIDAK LAYAK';
    notes: string;
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

    const [location, setLocation] = useState('');
    const [pic, setPic] = useState(user?.name || '');

    const [unitNumber, setUnitNumber] = useState('');
    const [capacity, setCapacity] = useState('6 Kg');
    const [tagNumber, setTagNumber] = useState('');
    const [checks, setChecks] = useState<Record<string, boolean>>({});
    const [condition, setCondition] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [notes, setNotes] = useState('');

    const [units, setUnits] = useState<APARUnit[]>([]);
    const [nextId, setNextId] = useState(1);

    const handleCheck = (item: string) => {
        setChecks(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const resetUnitForm = () => {
        setUnitNumber('');
        setCapacity('6 Kg');
        setTagNumber('');
        setChecks({});
        setCondition('LAYAK');
        setNotes('');
    };

    const handleAddUnit = () => {
        if (!unitNumber) {
            alert('Mohon isi No Unit / Detail Lokasi');
            return;
        }
        if (units.length >= 30) {
            alert('Maksimal 30 unit per inspeksi');
            return;
        }

        const newUnit: APARUnit = {
            id: nextId,
            unitNumber,
            capacity,
            tagNumber: tagNumber || String(nextId),
            checks: { ...checks },
            condition,
            notes
        };

        setUnits(prev => [...prev, newUnit]);
        setNextId(prev => prev + 1);
        resetUnitForm();
    };

    const handleRemoveUnit = (id: number) => {
        setUnits(prev => prev.filter(u => u.id !== id));
    };

    const handleSubmitAll = async () => {
        if (!location) {
            alert('Mohon pilih Lokasi terlebih dahulu');
            return;
        }
        if (!pic) {
            alert('Mohon isi nama PIC');
            return;
        }
        if (units.length === 0) {
            alert('Mohon tambahkan minimal 1 unit APAR');
            return;
        }

        setLoading(true);
        try {
            const results = [];
            for (const unit of units) {
                const response = await fetch('/api/apar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: new Date(),
                        location,
                        unitNumber: unit.unitNumber,
                        capacity: unit.capacity,
                        tagNumber: unit.tagNumber,
                        checklistData: JSON.stringify(unit.checks),
                        condition: unit.condition,
                        notes: unit.notes,
                        pic,
                        userId: user?.id
                    }),
                });
                const data = await response.json();
                if (data.id) {
                    results.push({ ...unit, dbId: data.id });
                }
            }

            if (results.length === units.length) {
                alert(`${results.length} unit APAR berhasil disimpan!`);
                
                await generateAPARPDF({
                    id: results[0].dbId,
                    location,
                    pic,
                    createdAt: new Date().toISOString(),
                    units: units.map((u, idx) => ({
                        no: idx + 1,
                        unitNumber: u.unitNumber,
                        capacity: u.capacity,
                        tagNumber: u.tagNumber,
                        checks: u.checks,
                        condition: u.condition,
                        notes: u.notes
                    }))
                } as any);

                onNavigate('history');
            } else {
                alert(`Berhasil menyimpan ${results.length} dari ${units.length} unit`);
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

            <div className="bg-red-600 pt-6 pb-4 px-4 sticky top-0 z-20 shadow-md shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white">INSPEKSI APAR</h1>
                        <p className="text-red-100 text-xs">Alat Pemadam Api Ringan</p>
                    </div>
                    {units.length > 0 && (
                        <div className="bg-white/20 px-3 py-1 rounded-full">
                            <span className="text-white text-sm font-bold">{units.length} Unit</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

                <div className="bg-white rounded-xl p-4 shadow-sm space-y-4 max-w-5xl mx-auto w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText size={16} className="text-red-600" />
                        </div>
                        <h2 className="font-bold text-slate-700">Informasi Inspeksi</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">PIC (DIPERIKSA OLEH)</label>
                            <input
                                type="text"
                                value={pic}
                                onChange={(e) => setPic(e.target.value)}
                                placeholder="Nama petugas..."
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm space-y-4 max-w-5xl mx-auto w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Plus size={16} className="text-orange-600" />
                        </div>
                        <h2 className="font-bold text-slate-700">Tambah Unit APAR</h2>
                        <span className="text-xs text-slate-400 ml-auto">Unit ke-{units.length + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">NO UNIT / DETAIL LOKASI</label>
                            <input
                                type="text"
                                value={unitNumber}
                                onChange={(e) => setUnitNumber(e.target.value)}
                                placeholder="Contoh: Rest Area, BAY, Tools..."
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
                                <option value="4 Kg">4 Kg</option>
                                <option value="5 Kg">5 Kg</option>
                                <option value="6 Kg">6 Kg</option>
                                <option value="7 Kg">7 Kg</option>
                                <option value="8 Kg">8 Kg</option>
                                <option value="9 Kg">9 Kg</option>
                                <option value="12 Kg">12 Kg</option>
                                <option value="22 Kg">22 Kg</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">NO TAG</label>
                            <input
                                type="text"
                                value={tagNumber}
                                onChange={(e) => setTagNumber(e.target.value)}
                                placeholder={`Auto: ${units.length + 1}`}
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[10px] text-slate-500 font-medium mb-2">ITEM PEMERIKSAAN (Centang jika OK)</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {APAR_ITEMS.map((item) => (
                                <label key={item} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={!!checks[item]}
                                        onChange={() => handleCheck(item)}
                                        className="w-4 h-4 accent-emerald-500"
                                    />
                                    <span className="text-sm text-slate-700">{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">KONDISI APAR</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setCondition('LAYAK')}
                                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${condition === 'LAYAK' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-200'}`}
                                >
                                    LAYAK
                                </button>
                                <button
                                    onClick={() => setCondition('TIDAK LAYAK')}
                                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${condition === 'TIDAK LAYAK' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200'}`}
                                >
                                    TIDAK LAYAK
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">KETERANGAN</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Catatan (opsional)..."
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAddUnit}
                        disabled={!unitNumber}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Tambah ke Daftar
                    </button>
                </div>

                {units.length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-sm max-w-5xl mx-auto w-full">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-bold text-slate-700">Daftar Unit ({units.length}/30)</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="px-2 py-2 text-left font-bold text-slate-600">NO</th>
                                        <th className="px-2 py-2 text-left font-bold text-slate-600">Detail Lokasi</th>
                                        <th className="px-2 py-2 text-center font-bold text-slate-600">Kapasitas</th>
                                        <th className="px-2 py-2 text-center font-bold text-slate-600">Tag</th>
                                        <th className="px-2 py-2 text-center font-bold text-slate-600">Kondisi</th>
                                        <th className="px-2 py-2 text-center font-bold text-slate-600">Hapus</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {units.map((unit, idx) => (
                                        <tr key={unit.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-2 py-2 font-medium">{idx + 1}</td>
                                            <td className="px-2 py-2">{unit.unitNumber}</td>
                                            <td className="px-2 py-2 text-center">{unit.capacity}</td>
                                            <td className="px-2 py-2 text-center">{unit.tagNumber}</td>
                                            <td className="px-2 py-2 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${unit.condition === 'LAYAK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {unit.condition === 'LAYAK' ? 'L' : 'TL'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                <button
                                                    onClick={() => handleRemoveUnit(unit.id)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={handleSubmitAll}
                            disabled={!location || !pic}
                            className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            <Save size={20} />
                            Simpan Semua & Download PDF
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
