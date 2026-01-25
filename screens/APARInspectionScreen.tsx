import React, { useState } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { ArrowLeft, ArrowRight, Save, ChevronDown, Plus, Trash2, FileText, Check, ClipboardList, PenTool, Camera, X } from 'lucide-react';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { generateAPARPDF } from '../utils/pdfGenerator';
import { SignaturePad } from '../components/SignaturePad';
import { PhotoCapture } from '../components/PhotoCapture';

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
    const [currentStep, setCurrentStep] = useLocalStorage('apar_step', 1);

    const [location, setLocation] = useLocalStorage('apar_location', '');
    const [pic, setPic] = useLocalStorage('apar_pic', user?.name || '');
    const [periodeMonth, setPeriodeMonth] = useLocalStorage('apar_month', new Date().getMonth());
    const [periodeYear, setPeriodeYear] = useLocalStorage('apar_year', new Date().getFullYear());

    const MONTH_NAMES = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

    const [unitNumber, setUnitNumber] = useState('');
    const [capacity, setCapacity] = useState('6 Kg');
    const [tagNumber, setTagNumber] = useState('');
    const [checks, setChecks] = useState<Record<string, boolean>>({});
    const [condition, setCondition] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState('');

    const [units, setUnits] = useLocalStorage<APARUnit[]>('apar_units', []);
    const [nextId, setNextId] = useLocalStorage('apar_nextId', 1);

    const [diketahuiOleh, setDiketahuiOleh] = useLocalStorage('apar_signer_known', '');
    const [diPeriksaOleh, setDiPeriksaOleh] = useLocalStorage('apar_signer_checked', '');
    const [signatureDiketahui, setSignatureDiketahui] = useLocalStorage('apar_sig_known', '');

    const [signatureDiPeriksa, setSignatureDiPeriksa] = useLocalStorage('apar_sig_checked', '');
    const [sessionPhotos, setSessionPhotos] = useLocalStorage<string[]>('apar_photos', []);

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

    const goToStep = (step: number) => {
        if (step === 2 && (!location || !pic)) {
            alert('Mohon lengkapi Lokasi dan nama PIC');
            return;
        }
        if (step === 3 && units.length === 0) {
            alert('Mohon tambahkan minimal 1 unit APAR');
            return;
        }
        setCurrentStep(step);
    };

    const handleSubmitAll = async () => {
        if (!diketahuiOleh || !diPeriksaOleh) {
            alert('Mohon isi nama Diketahui Oleh dan Di Periksa Oleh');
            return;
        }
        if (!signatureDiketahui || !signatureDiPeriksa) {
            alert('Mohon tanda tangani kedua kolom tanda tangan');
            return;
        }

        setLoading(true);
        try {
            const results = [];
            for (const [index, unit] of units.entries()) {
                // Attach session photos to the first unit's checklistData for persistence
                const checklistPayload: any = { ...unit.checks };
                if (index === 0 && sessionPhotos.length > 0) {
                    checklistPayload.photos = sessionPhotos;
                }

                const response = await fetch('/api/apar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: new Date(),
                        location,
                        unitNumber: unit.unitNumber,
                        capacity: unit.capacity,
                        tagNumber: unit.tagNumber,
                        checklistData: JSON.stringify(checklistPayload),
                        condition: unit.condition,
                        notes: unit.notes,
                        pic: diPeriksaOleh,
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

                // Clear local storage session
                localStorage.removeItem('apar_step');
                localStorage.removeItem('apar_location');
                localStorage.removeItem('apar_pic');
                localStorage.removeItem('apar_month');
                localStorage.removeItem('apar_year');
                localStorage.removeItem('apar_units');
                localStorage.removeItem('apar_nextId');
                localStorage.removeItem('apar_signer_known');
                localStorage.removeItem('apar_signer_checked');
                localStorage.removeItem('apar_sig_known');
                localStorage.removeItem('apar_sig_checked');
                localStorage.removeItem('apar_photos');

                // Reset state
                setCurrentStep(1);
                setUnits([]);
                setSessionPhotos([]);
                setLocation('');
                // setPic('');
                setDiketahuiOleh('');
                setDiPeriksaOleh('');
                setSignatureDiketahui('');
                setSignatureDiPeriksa('');


                const unitsForPDF = units.map((u, idx) => ({
                    no: idx + 1,
                    unitNumber: u.unitNumber,
                    capacity: u.capacity,
                    tagNumber: u.tagNumber,
                    checks: u.checks,
                    condition: u.condition,
                    notes: u.notes
                }));

                await generateAPARPDF({
                    id: results[0].dbId,
                    location,
                    pic: diPeriksaOleh,
                    diketahuiOleh,
                    diPeriksaOleh,
                    signatureDiketahui,
                    signatureDiPeriksa,
                    periodeInspeksi: `${MONTH_NAMES[periodeMonth]} ${periodeYear}`,
                    createdAt: new Date().toISOString(),
                    units: unitsForPDF,
                    photos: sessionPhotos
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

    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 py-3 bg-white/10">
            {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep === step
                        ? 'bg-white text-red-600'
                        : currentStep > step
                            ? 'bg-green-500 text-white'
                            : 'bg-white/30 text-white'
                        }`}>
                        {currentStep > step ? <Check size={16} /> : step}
                    </div>
                    {step < 3 && (
                        <div className={`w-8 h-1 mx-1 rounded ${currentStep > step ? 'bg-green-500' : 'bg-white/30'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F3F6F8] font-sans pb-32 flex flex-col">
            <LoadingOverlay isLoading={loading} message="Menyimpan inspeksi..." />

            <div className="bg-red-600 pt-6 pb-2 px-4 sticky top-0 z-20 shadow-md shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => currentStep === 1 ? onNavigate('home') : setCurrentStep(currentStep - 1)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white">INSPEKSI APAR</h1>
                        <p className="text-red-100 text-xs">
                            {currentStep === 1 && 'Langkah 1: Informasi Inspeksi'}
                            {currentStep === 2 && 'Langkah 2: Tambah Unit APAR'}
                            {currentStep === 3 && 'Langkah 3: Review & Tanda Tangan'}
                        </p>
                    </div>
                    {units.length > 0 && (
                        <div className="bg-white/20 px-3 py-1 rounded-full">
                            <span className="text-white text-sm font-bold">{units.length} Unit</span>
                        </div>
                    )}
                </div>
                <StepIndicator />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">

                {currentStep === 1 && (
                    <div className="bg-white rounded-xl p-5 shadow-sm space-y-5 max-w-2xl mx-auto w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <FileText size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Informasi Inspeksi</h2>
                                <p className="text-slate-500 text-sm">Pilih lokasi dan nama petugas</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">LOKASI (AREA)</label>
                                <div className="relative">
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Pilih Lokasi --</option>
                                        {APAR_LOCATIONS.map((loc) => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">NAMA PIC (PETUGAS INSPEKSI)</label>
                                <input
                                    type="text"
                                    value={pic}
                                    onChange={(e) => setPic(e.target.value)}
                                    placeholder="Masukkan nama petugas..."
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">PERIODE INSPEKSI</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <select
                                            value={periodeMonth}
                                            onChange={(e) => setPeriodeMonth(Number(e.target.value))}
                                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none cursor-pointer"
                                        >
                                            {MONTH_NAMES.map((month, idx) => (
                                                <option key={month} value={idx}>{month}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                    <div className="relative w-28">
                                        <select
                                            value={periodeYear}
                                            onChange={(e) => setPeriodeYear(Number(e.target.value))}
                                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none cursor-pointer"
                                        >
                                            {[2024, 2025, 2026, 2027, 2028].map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    if (confirm('Apakah Anda yakin ingin mereset formulir? Semua data tersimpan akan dihapus.')) {
                                        localStorage.removeItem('apar_step');
                                        localStorage.removeItem('apar_location');
                                        localStorage.removeItem('apar_pic');
                                        localStorage.removeItem('apar_month');
                                        localStorage.removeItem('apar_year');
                                        localStorage.removeItem('apar_units');
                                        localStorage.removeItem('apar_nextId');
                                        localStorage.removeItem('apar_signer_known');
                                        localStorage.removeItem('apar_signer_checked');
                                        localStorage.removeItem('apar_sig_known');
                                        localStorage.removeItem('apar_sig_checked');
                                        localStorage.removeItem('apar_photos');
                                        window.location.reload();
                                    }
                                }}
                                className="w-1/3 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-4 rounded-xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={20} />
                                Reset
                            </button>
                            <button
                                onClick={() => goToStep(2)}
                                disabled={!location || !pic}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                Lanjut ke Tambah Unit
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-4 max-w-5xl mx-auto w-full">
                        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Plus size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800">Tambah Unit APAR</h2>
                                    <p className="text-slate-500 text-xs">Lokasi: {location}</p>
                                </div>
                                <span className="text-xs text-slate-400 ml-auto bg-slate-100 px-3 py-1 rounded-full">Unit ke-{units.length + 1}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">NO UNIT / DETAIL LOKASI</label>
                                    <input
                                        type="text"
                                        value={unitNumber}
                                        onChange={(e) => setUnitNumber(e.target.value)}
                                        placeholder="Contoh: Rest Area, BAY..."
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
                                        {['3 Kg', '4 Kg', '5 Kg', '6 Kg', '7 Kg', '8 Kg', '9 Kg', '12 Kg', '22 Kg'].map(k => (
                                            <option key={k} value={k}>{k}</option>
                                        ))}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <ClipboardList size={16} className="text-blue-600" />
                                    </div>
                                    <h2 className="font-bold text-slate-700">Daftar Unit ({units.length}/30)</h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-300">
                                                <th className="px-2 py-2 text-left font-bold text-slate-700">NO</th>
                                                <th className="px-2 py-2 text-left font-bold text-slate-700">Detail Lokasi</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Kapasitas</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Tag</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Kondisi</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Hapus</th>
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
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} />
                                Kembali
                            </button>
                            <button
                                onClick={() => goToStep(3)}
                                disabled={units.length === 0}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Lanjut Review
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-4 max-w-3xl mx-auto w-full">
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <ClipboardList size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 text-lg">Review Inspeksi</h2>
                                    <p className="text-slate-500 text-sm">{location}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Lokasi:</span>
                                        <p className="font-bold text-slate-800">{location}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Jumlah Unit:</span>
                                        <p className="font-bold text-slate-800">{units.length} Unit</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Layak:</span>
                                        <p className="font-bold text-emerald-600">{units.filter(u => u.condition === 'LAYAK').length} Unit</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Tidak Layak:</span>
                                        <p className="font-bold text-red-600">{units.filter(u => u.condition === 'TIDAK LAYAK').length} Unit</p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto mb-4">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="px-2 py-2 text-left">NO</th>
                                            <th className="px-2 py-2 text-left">Detail Lokasi</th>
                                            <th className="px-2 py-2 text-center">Kapasitas</th>
                                            <th className="px-2 py-2 text-center">Kondisi</th>
                                            <th className="px-2 py-2 text-left">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {units.map((unit, idx) => (
                                            <tr key={unit.id} className="border-b border-slate-100">
                                                <td className="px-2 py-2">{idx + 1}</td>
                                                <td className="px-2 py-2">{unit.unitNumber}</td>
                                                <td className="px-2 py-2 text-center">{unit.capacity}</td>
                                                <td className="px-2 py-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${unit.condition === 'LAYAK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {unit.condition === 'LAYAK' ? 'L' : 'TL'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-slate-500">{unit.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>



                        <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                                    <Camera size={24} className="text-cyan-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 text-lg">Dokumentasi Foto</h2>
                                    <p className="text-slate-500 text-sm">Upload foto dokumentasi (Max 5)</p>
                                </div>
                                <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{sessionPhotos.length}/5</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {sessionPhotos.map((photo, idx) => (
                                    <div key={idx} className="relative rounded-xl overflow-hidden border-2 border-slate-200 group">
                                        <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-32 object-cover" />
                                        <button
                                            onClick={() => setSessionPhotos(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold text-center py-1">
                                            Foto {idx + 1}
                                        </div>
                                    </div>
                                ))}

                                {sessionPhotos.length < 5 && (
                                    <div className="col-span-2">
                                        <PhotoCapture
                                            label="TAMBAH FOTO DOKUMENTASI"
                                            onPhotoCaptured={(base64) => {
                                                if (base64) setSessionPhotos(prev => [...prev, base64]);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <PenTool size={24} className="text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 text-lg">Tanda Tangan</h2>
                                    <p className="text-slate-500 text-sm">Tanda tangan langsung di layar</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase block mb-2">NAMA (DIKETAHUI OLEH)</label>
                                        <input
                                            type="text"
                                            value={diketahuiOleh}
                                            onChange={(e) => setDiketahuiOleh(e.target.value)}
                                            placeholder="Nama atasan/supervisor..."
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                        />
                                    </div>
                                    <SignaturePad
                                        label="TANDA TANGAN DIKETAHUI OLEH"
                                        onSignatureChange={setSignatureDiketahui}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 uppercase block mb-2">NAMA (DI PERIKSA OLEH)</label>
                                        <input
                                            type="text"
                                            value={diPeriksaOleh}
                                            onChange={(e) => setDiPeriksaOleh(e.target.value)}
                                            placeholder="Nama petugas inspeksi..."
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                        />
                                    </div>
                                    <SignaturePad
                                        label="TANDA TANGAN DI PERIKSA OLEH"
                                        onSignatureChange={setSignatureDiPeriksa}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} />
                                Kembali
                            </button>
                            <button
                                onClick={handleSubmitAll}
                                disabled={!diketahuiOleh || !diPeriksaOleh || !signatureDiketahui || !signatureDiPeriksa}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Simpan & Download PDF
                            </button>
                        </div>
                    </div>
                )
                }

            </div >
        </div >
    );
};
