import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { ArrowLeft, ArrowRight, Save, ChevronDown, Plus, Trash2, ClipboardList, PenTool, Droplets, Camera, X, Check } from 'lucide-react';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { generateHydrantPDF } from '../utils/pdfGenerator';
import { SignaturePad } from '../components/SignaturePad';
import { PhotoCapture } from '../components/PhotoCapture';
import { formatTagNumber, getUniqueAreas, getLocationsWithTagByArea, LocationWithTag, parseTagNumber } from '../data/spipData';

interface HydrantFormProps {
    onNavigate: (screen: ScreenName) => void;
    user?: any;
}

interface HydrantUnit {
    id: number;
    location: string;
    tagNumber: string;
    checks: Record<string, boolean>;
    condition: 'LAYAK' | 'TIDAK LAYAK';
    notes: string;
}

const HYDRANT_CHECKLIST_ITEMS = [
    'Box Hydrant (Bersih/Kondisi Baik)',
    'Jet Nozzle (Tidak Retak/Aus)',
    'Hose Hydrant (Tidak Bocor/Rapi)',
    'Hose Rack (Tidak Patah/Berfungsi)',
    'Kunci Hydrant (Tersedia/Berfungsi)',
    'Hydrant Pillar (Tidak Bocor/Mudah Dibuka)',
    'Pipa Hydrant (Tidak Bocor/Korosif)',
    'Water Cannon (Jika Ada - Kondisi Baik)'
];

// Get unique areas for Hydrant
const HYDRANT_AREAS = getUniqueAreas('hydrant');

export const HydrantInspectionScreen: React.FC<HydrantFormProps> = ({ onNavigate, user }) => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useLocalStorage('hydrant_step', 1);

    // Step 1: Info
    const [area, setArea] = useLocalStorage('hydrant_area', '');
    const [pic, setPic] = useLocalStorage('hydrant_pic', user?.name || '');

    const MONTH_NAMES = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

    // Step 2: Unit Form State
    const [location, setLocation] = useState('');
    const [isManualLocation, setIsManualLocation] = useState(false);
    const [tagNumber, setTagNumber] = useState('');
    const [checks, setChecks] = useState<Record<string, boolean>>({});
    const [condition, setCondition] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [notes, setNotes] = useState('');

    // Multi-unit Data
    const [units, setUnits] = useLocalStorage<HydrantUnit[]>('hydrant_units', []);
    const [nextId, setNextId] = useLocalStorage('hydrant_nextId', 1);

    // Step 3: Review & Sign
    const [diketahuiOleh, setDiketahuiOleh] = useLocalStorage('hydrant_signer_known', '');
    const [diPeriksaOleh, setDiPeriksaOleh] = useLocalStorage('hydrant_signer_checked', '');
    const [signatureDiketahui, setSignatureDiketahui] = useLocalStorage('hydrant_sig_known', '');
    const [signatureDiPeriksa, setSignatureDiPeriksa] = useLocalStorage('hydrant_sig_checked', '');
    const [sessionPhotos, setSessionPhotos] = useLocalStorage<string[]>('hydrant_photos', []);

    // Get locations available for the selected area
    const availableLocations = useMemo((): LocationWithTag[] => {
        if (area) {
            return getLocationsWithTagByArea('hydrant', area);
        }
        return [];
    }, [area]);

    const handleCheck = (item: string) => {
        setChecks(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const resetUnitForm = () => {
        setLocation('');
        setIsManualLocation(false);
        setTagNumber('');
        setChecks({});
        setCondition('LAYAK');
        setNotes('');
    };

    const handleAddUnit = () => {
        if (!location) {
            alert('Mohon isi Lokasi Hydrant');
            return;
        }
        if (units.length >= 30) {
            alert('Maksimal 30 unit per inspeksi');
            return;
        }

        const newUnit: HydrantUnit = {
            id: nextId,
            location,
            tagNumber: formatTagNumber('hydrant', tagNumber || String(nextId)),
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
        if (step === 2 && (!area || !pic)) {
            alert('Mohon lengkapi Area dan Nama PIC');
            return;
        }
        if (step === 3 && units.length === 0) {
            alert('Mohon tambahkan minimal 1 unit Hydrant');
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

                const response = await fetch('/api/hydrant', { // Assuming endpoint is generic or same logic
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: new Date(),
                        location: area, // Area as main location context
                        subKomponen: unit.location, // Specific location stored in subKomponen or we need a new field? 
                        // Note: Existing schema might expect specific fields. 
                        // Let's check schema: hydrantInspections usually has location, unitNumber, etc.
                        // Assuming valid schema usage:
                        unitNumber: unit.tagNumber,
                        checklistData: JSON.stringify(checklistPayload), // All checks
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
                alert(`${results.length} unit Hydrant berhasil disimpan!`);

                // Create PDF Data
                const unitsForPDF = units.map((u, idx) => ({
                    no: idx + 1,
                    location: u.location,
                    tagNumber: u.tagNumber,
                    checks: u.checks,
                    condition: u.condition,
                    notes: u.notes
                }));

                await generateHydrantPDF({
                    id: results[0].dbId,
                    location: area,
                    pic: diPeriksaOleh,
                    diketahuiOleh,
                    diPeriksaOleh,
                    signatureDiketahui,
                    signatureDiPeriksa,
                    periodeInspeksi: `${MONTH_NAMES[new Date().getMonth()]} ${new Date().getFullYear()}`,
                    createdAt: new Date().toISOString(),
                    units: unitsForPDF,
                    photos: sessionPhotos
                } as any);

                // Clear storage
                localStorage.removeItem('hydrant_step');
                localStorage.removeItem('hydrant_area');
                localStorage.removeItem('hydrant_pic');
                localStorage.removeItem('hydrant_units');
                localStorage.removeItem('hydrant_nextId');
                localStorage.removeItem('hydrant_signer_known');
                localStorage.removeItem('hydrant_signer_checked');
                localStorage.removeItem('hydrant_sig_known');
                localStorage.removeItem('hydrant_sig_checked');
                localStorage.removeItem('hydrant_photos');

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
                        ? 'bg-white text-emerald-600'
                        : currentStep > step
                            ? 'bg-emerald-800 text-white'
                            : 'bg-white/30 text-white'
                        }`}>
                        {currentStep > step ? <Check size={16} /> : step}
                    </div>
                    {step < 3 && (
                        <div className={`w-8 h-1 mx-1 rounded ${currentStep > step ? 'bg-emerald-800' : 'bg-white/30'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F3F6F8] font-sans pb-32 flex flex-col">
            <LoadingOverlay isLoading={loading} message="Menyimpan inspeksi..." />

            <div className="bg-emerald-600 pt-6 pb-2 px-4 sticky top-0 z-20 shadow-md shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => currentStep === 1 ? onNavigate('home') : setCurrentStep(currentStep - 1)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white">INSPEKSI HYDRANT</h1>
                        <p className="text-emerald-100 text-xs">
                            {currentStep === 1 && 'Langkah 1: Informasi Inspeksi'}
                            {currentStep === 2 && 'Langkah 2: Tambah Unit Hydrant'}
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
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <FileText size={24} className="text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Informasi Inspeksi</h2>
                                <p className="text-slate-500 text-sm">Pilih lokasi dan nama petugas</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">AREA INSPEKSI</label>
                                <div className="relative">
                                    <select
                                        value={area}
                                        onChange={(e) => {
                                            setArea(e.target.value);
                                            // Reset lower data
                                            setUnits([]);
                                            setNextId(1);
                                            resetUnitForm();
                                        }}
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Pilih Area --</option>
                                        {HYDRANT_AREAS.map((loc) => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">NAMA PIC (PETUGAS)</label>
                                <input
                                    type="text"
                                    value={pic}
                                    onChange={(e) => setPic(e.target.value)}
                                    placeholder="Masukkan nama petugas..."
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    if (confirm('Apakah Anda yakin ingin mereset formulir? Semua data tersimpan akan dihapus.')) {
                                        localStorage.removeItem('hydrant_step');
                                        localStorage.removeItem('hydrant_area');
                                        localStorage.removeItem('hydrant_pic');
                                        localStorage.removeItem('hydrant_units');
                                        localStorage.removeItem('hydrant_nextId');
                                        localStorage.removeItem('hydrant_signer_known');
                                        localStorage.removeItem('hydrant_signer_checked');
                                        localStorage.removeItem('hydrant_sig_known');
                                        localStorage.removeItem('hydrant_sig_checked');
                                        localStorage.removeItem('hydrant_photos');
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
                                disabled={!area || !pic}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
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
                                    <h2 className="font-bold text-slate-800">Tambah Unit Hydrant</h2>
                                    <p className="text-slate-500 text-xs">Area: {area}</p>
                                </div>
                                <span className="text-xs text-slate-400 ml-auto bg-slate-100 px-3 py-1 rounded-full">Unit ke-{units.length + 1}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">LOKASI TITIK HYDRANT</label>
                                    <div className="relative">
                                        <select
                                            value={isManualLocation ? 'MANUAL_ENTRY' : location}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'MANUAL_ENTRY') {
                                                    setIsManualLocation(true);
                                                    setLocation('');
                                                    setTagNumber('');
                                                } else {
                                                    setIsManualLocation(false);
                                                    setLocation(val);
                                                    // Auto fill tag
                                                    const foundLoc = availableLocations.find(l => l.displayName === val);
                                                    if (foundLoc) {
                                                        const numPart = parseTagNumber(foundLoc.regNumber);
                                                        setTagNumber(numPart);
                                                    } else {
                                                        setTagNumber('');
                                                    }
                                                }
                                            }}
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer pr-8"
                                        >
                                            <option value="">-- Pilih Lokasi --</option>
                                            {availableLocations.map(p => (
                                                <option key={`${p.location}|${p.regNumber}`} value={p.displayName}>{p.displayName}</option>
                                            ))}
                                            <option value="MANUAL_ENTRY">Lainnya (Input Manual)</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                    {isManualLocation && (
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Masukkan Lokasi Hydrant Manual..."
                                            className="w-full mt-2 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">NO TAG / NO LAMBUNG (cukup angka)</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-2 rounded-lg">HYD-</span>
                                        <input
                                            type="number"
                                            value={tagNumber}
                                            onChange={(e) => setTagNumber(e.target.value.replace(/\D/g, ''))}
                                            placeholder={`${units.length + 1}`}
                                            className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            min="1"
                                        />
                                    </div>
                                    {tagNumber && <span className="text-xs text-slate-500 mt-1 block">Output: {formatTagNumber('hydrant', tagNumber)}</span>}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] text-slate-500 font-medium mb-2">ITEM PEMERIKSAAN (Centang jika OK)</p>
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                                    {HYDRANT_CHECKLIST_ITEMS.map((item) => (
                                        <label key={item} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={!!checks[item]}
                                                onChange={() => handleCheck(item)}
                                                className="w-4 h-4 accent-emerald-500"
                                            />
                                            <span className="text-xs text-slate-700">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">KONDISI HYDRANT</label>
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
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>


                            <button
                                onClick={handleAddUnit}
                                disabled={!location}
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
                                                <th className="px-2 py-2 text-left font-bold text-slate-700">Lokasi</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Tag</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Kondisi</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Hapus</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {units.map((unit, idx) => (
                                                <tr key={unit.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="px-2 py-2 font-medium">{idx + 1}</td>
                                                    <td className="px-2 py-2">{unit.location}</td>
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
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
                                    <p className="text-slate-500 text-sm">{area}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Area:</span>
                                        <p className="font-bold text-slate-800">{area}</p>
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
                                            <th className="px-2 py-2 text-left">Lokasi</th>
                                            <th className="px-2 py-2 text-center">Tag</th>
                                            <th className="px-2 py-2 text-center">Kondisi</th>
                                            <th className="px-2 py-2 text-left">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {units.map((unit, idx) => (
                                            <tr key={unit.id} className="border-b border-slate-100">
                                                <td className="px-2 py-2">{idx + 1}</td>
                                                <td className="px-2 py-2">{unit.location}</td>
                                                <td className="px-2 py-2 text-center">{unit.tagNumber}</td>
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
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
