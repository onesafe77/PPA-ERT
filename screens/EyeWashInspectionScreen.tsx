import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { ArrowLeft, ArrowRight, Save, ChevronDown, Camera, X, Check, ClipboardList, PenTool, Eye, Plus, Trash2 } from 'lucide-react';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { generateEyeWashPDF } from '../utils/pdfGenerator';
import { SignaturePad } from '../components/SignaturePad';
import { PhotoCapture } from '../components/PhotoCapture';
import { getUniqueAreas, getLocationsWithTagByArea, LocationWithTag, formatTagNumber, parseTagNumber } from '../data/spipData';

interface EyeWashFormProps {
    onNavigate: (screen: ScreenName) => void;
    user?: any;
}

// Interface for multi-unit inspection
interface EyeWashUnit {
    id: number;
    location: string;
    tagNumber: string;
    checks: Record<string, boolean>;
    condition: 'LAYAK' | 'TIDAK LAYAK';
    keterangan: string;
}

// Get unique areas for Eye Wash
const EYEWASH_AREAS = getUniqueAreas('eyewash');

const EYEWASH_CHECKLIST_ITEMS = [
    'Isi',
    'Karet Penutup',
    'Kebersihan',
    'Kondisi',
    'Lubang Pembuangan Air',
    'Tempat Eye Wash',
    'KIP',
    'Braket'
];


export const EyeWashInspectionScreen: React.FC<EyeWashFormProps> = ({ onNavigate, user }) => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useLocalStorage('eyewash_step', 1);

    // Step 1 fields
    const [area, setArea] = useLocalStorage('eyewash_area', '');
    const [inspector, setInspector] = useLocalStorage('eyewash_inspector', user?.name || '');

    const MONTH_NAMES = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

    // Step 2 fields - Single unit form
    const [location, setLocation] = useState('');
    const [isManualLocation, setIsManualLocation] = useState(false);
    const [tagNumber, setTagNumber] = useState('');
    const [checks, setChecks] = useState<Record<string, boolean>>({});
    const [condition, setCondition] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [keterangan, setKeterangan] = useState('');

    // Multi-unit state
    const [units, setUnits] = useLocalStorage<EyeWashUnit[]>('eyewash_units', []);
    const [nextId, setNextId] = useLocalStorage('eyewash_nextId', 1);

    // Step 3 fields
    const [photos, setPhotos] = useLocalStorage<string[]>('eyewash_photos', []);
    const [diketahuiOleh, setDiketahuiOleh] = useLocalStorage('eyewash_signer_known', '');
    const [diPeriksaOleh, setDiPeriksaOleh] = useLocalStorage('eyewash_signer_checked', '');
    const [signatureDiketahui, setSignatureDiketahui] = useLocalStorage('eyewash_sig_known', '');
    const [signatureDiPeriksa, setSignatureDiPeriksa] = useLocalStorage('eyewash_sig_checked', '');

    // Get locations available for the selected area
    const availableLocations = useMemo((): LocationWithTag[] => {
        if (area) {
            return getLocationsWithTagByArea('eyewash', area);
        }
        return [];
    }, [area]);

    // Computed values
    const totalLayak = useMemo(() => units.filter(u => u.condition === 'LAYAK').length, [units]);
    const totalTidakLayak = useMemo(() => units.filter(u => u.condition === 'TIDAK LAYAK').length, [units]);

    const handleCheckItem = (item: string) => {
        setChecks(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const resetUnitForm = () => {
        setLocation('');
        setIsManualLocation(false);
        setTagNumber('');
        setChecks({});
        setCondition('LAYAK');
        setKeterangan('');
    };

    const handleAddUnit = () => {
        if (!location) {
            alert('Mohon isi Lokasi Eye Wash');
            return;
        }
        if (units.length >= 30) {
            alert('Maksimal 30 unit per inspeksi');
            return;
        }

        const newUnit: EyeWashUnit = {
            id: nextId,
            location,
            tagNumber: formatTagNumber('eyewash', tagNumber || String(nextId)),
            checks: { ...checks },
            condition,
            keterangan
        };

        setUnits(prev => [...prev, newUnit]);
        setNextId(prev => prev + 1);
        resetUnitForm();
    };

    const handleRemoveUnit = (id: number) => {
        setUnits(prev => prev.filter(u => u.id !== id));
    };

    const handlePhotoCaptured = (base64: string) => {
        if (base64) {
            if (photos.length >= 5) {
                alert('Maksimal 5 foto');
                return;
            }
            setPhotos(prev => [...prev, base64]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const goToStep = (step: number) => {
        if (step === 2 && (!area || !inspector)) {
            alert('Mohon lengkapi Area dan Nama Inspektor');
            return;
        }
        if (step === 3 && units.length === 0) {
            alert('Mohon tambahkan minimal 1 unit Eye Wash');
            return;
        }
        setCurrentStep(step);
    };

    const handleSubmitAll = async () => {
        if (!diketahuiOleh || !diPeriksaOleh) {
            alert('Mohon isi nama Diketahui Oleh dan Diperiksa Oleh');
            return;
        }
        if (!signatureDiketahui || !signatureDiPeriksa) {
            alert('Mohon tanda tangani kedua kolom tanda tangan');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/eyewash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: new Date(),
                    periodeMonth: new Date().getMonth(),
                    periodeYear: new Date().getFullYear(),
                    location: area,
                    regNumber: `Multi-Unit (${units.length})`,
                    inspector,
                    checklistData: JSON.stringify({
                        units: units.map(u => ({
                            location: u.location,
                            tagNumber: u.tagNumber,
                            checks: u.checks,
                            condition: u.condition,
                            keterangan: u.keterangan
                        }))
                    }),
                    kondisiKeseluruhan: totalTidakLayak > 0 ? 'TIDAK LAYAK' : 'LAYAK',
                    keterangan: `Total Unit: ${units.length}, Layak: ${totalLayak}, Tidak Layak: ${totalTidakLayak}`,
                    photos: JSON.stringify(photos),
                    diketahuiOleh,
                    diPeriksaOleh,
                    signatureDiketahui,
                    signatureDiPeriksa,
                    userId: user?.id
                })
            });

            const result = await response.json();

            if (result.id) {
                alert('Inspeksi Eye Wash berhasil disimpan!');

                // Generate PDF
                await generateEyeWashPDF({
                    id: result.id,
                    location: area,
                    regNumber: `Multi-Unit (${units.length})`,
                    inspector,
                    periodeInspeksi: `${MONTH_NAMES[new Date().getMonth()]} ${new Date().getFullYear()}`,
                    tanggalInspeksi: new Date().toLocaleDateString('id-ID'),
                    checklistData: JSON.stringify({
                        units: units.map(u => ({
                            location: u.location,
                            tagNumber: u.tagNumber,
                            checks: u.checks,
                            condition: u.condition,
                            keterangan: u.keterangan
                        }))
                    }),
                    kondisiKeseluruhan: totalTidakLayak > 0 ? 'TIDAK LAYAK' : 'LAYAK',
                    keterangan: `Total Unit: ${units.length}, Layak: ${totalLayak}, Tidak Layak: ${totalTidakLayak}`,
                    photos,
                    diketahuiOleh,
                    diPeriksaOleh,
                    signatureDiketahui,
                    signatureDiPeriksa,
                    createdAt: new Date().toISOString()
                });

                // Clear storage
                localStorage.removeItem('eyewash_step');
                localStorage.removeItem('eyewash_area');
                localStorage.removeItem('eyewash_inspector');
                localStorage.removeItem('eyewash_units');
                localStorage.removeItem('eyewash_nextId');
                localStorage.removeItem('eyewash_photos');
                localStorage.removeItem('eyewash_signer_known');
                localStorage.removeItem('eyewash_signer_checked');
                localStorage.removeItem('eyewash_sig_known');
                localStorage.removeItem('eyewash_sig_checked');

                onNavigate('history');
            } else {
                alert('Gagal menyimpan inspeksi');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Gagal terhubung ke server');
        } finally {
            setLoading(false);
        }
    };

    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 py-3 bg-white/10">
            {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep === step
                        ? 'bg-white text-amber-600'
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

            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 pt-6 pb-2 px-4 sticky top-0 z-20 shadow-md shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => currentStep === 1 ? onNavigate('home') : setCurrentStep(currentStep - 1)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Eye size={24} className="text-white" />
                            <h1 className="text-xl font-bold text-white">Inspeksi Eye Wash</h1>
                        </div>
                        <p className="text-amber-100 text-xs">
                            {currentStep === 1 && 'Langkah 1: Informasi Inspeksi'}
                            {currentStep === 2 && 'Langkah 2: Tambah Unit Eye Wash'}
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

            <div className="flex-1 overflow-y-auto px-4 pt-4">
                {/* STEP 1: Informasi Dasar */}
                {currentStep === 1 && (
                    <div className="space-y-4 max-w-2xl mx-auto w-full">
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <ClipboardList size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800">Informasi Inspeksi</h2>
                                    <p className="text-slate-500 text-sm">Pilih area dan nama inspektor</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Project / Site</label>
                                    <input
                                        type="text"
                                        value="PPA / BIB"
                                        disabled
                                        className="w-full p-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Inspektor</label>
                                    <input
                                        type="text"
                                        value={inspector}
                                        onChange={(e) => setInspector(e.target.value)}
                                        placeholder="Masukkan nama inspektor"
                                        className="w-full p-3 border border-slate-300 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Area Inspeksi</label>
                                    <div className="relative">
                                        <select
                                            value={area}
                                            onChange={(e) => {
                                                setArea(e.target.value);
                                                // Reset lower level selections when area changes
                                                setUnits([]);
                                                setNextId(1);
                                                resetUnitForm();
                                            }}
                                            className="w-full p-3 border border-slate-300 rounded-xl appearance-none bg-white pr-10"
                                        >
                                            <option value="">Pilih Area</option>
                                            {EYEWASH_AREAS.map((a) => (
                                                <option key={a} value={a}>{a}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        if (confirm('Apakah Anda yakin ingin mereset formulir?')) {
                                            localStorage.removeItem('eyewash_step');
                                            localStorage.removeItem('eyewash_area');
                                            localStorage.removeItem('eyewash_inspector');
                                            localStorage.removeItem('eyewash_units');
                                            localStorage.removeItem('eyewash_nextId');
                                            localStorage.removeItem('eyewash_photos');
                                            localStorage.removeItem('eyewash_signer_known');
                                            localStorage.removeItem('eyewash_signer_checked');
                                            localStorage.removeItem('eyewash_sig_known');
                                            localStorage.removeItem('eyewash_sig_checked');
                                            window.location.reload();
                                        }
                                    }}
                                    className="w-1/3 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Trash2 size={20} />
                                    Reset
                                </button>
                                <button
                                    onClick={() => goToStep(2)}
                                    disabled={!area || !inspector}
                                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                                >
                                    Lanjut ke Tambah Unit <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Multi-Unit Entry */}
                {currentStep === 2 && (
                    <div className="space-y-4 max-w-5xl mx-auto w-full">
                        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Plus size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800">Tambah Unit Eye Wash</h2>
                                    <p className="text-slate-500 text-xs">Area: {area}</p>
                                </div>
                                <span className="text-xs text-slate-400 ml-auto bg-slate-100 px-3 py-1 rounded-full">Unit ke-{units.length + 1}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">LOKASI</label>
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

                                                    // Auto-fill tag number based on selected location
                                                    const foundLoc = availableLocations.find(l => l.displayName === val);
                                                    if (foundLoc) {
                                                        const numPart = parseTagNumber(foundLoc.regNumber);
                                                        setTagNumber(numPart);
                                                    } else {
                                                        setTagNumber('');
                                                    }
                                                }
                                            }}
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none pr-8"
                                        >
                                            <option value="">Pilih Lokasi</option>
                                            {availableLocations.map((loc) => (
                                                <option key={`${loc.location}|${loc.tagNumber}`} value={loc.displayName}>
                                                    {loc.displayName}
                                                </option>
                                            ))}
                                            <option value="MANUAL_ENTRY">Lainnya (Input Manual)</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>

                                    {isManualLocation && (
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full mt-2 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            placeholder="Masukkan nama lokasi baru..."
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">NO TAG (cukup angka)</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-2 rounded-lg">EW-</span>
                                        <input
                                            type="number"
                                            value={tagNumber}
                                            onChange={(e) => setTagNumber(e.target.value.replace(/\D/g, ''))}
                                            placeholder={`${units.length + 1}`}
                                            className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                            min="1"
                                        />
                                    </div>
                                    {tagNumber && <span className="text-xs text-slate-500 mt-1 block">Output: {formatTagNumber('eyewash', tagNumber)}</span>}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] text-slate-500 font-medium mb-2">ITEM PEMERIKSAAN (Centang jika OK)</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {EYEWASH_CHECKLIST_ITEMS.map((item) => (
                                        <label key={item} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={!!checks[item]}
                                                onChange={() => handleCheckItem(item)}
                                                className="w-4 h-4 accent-emerald-500"
                                            />
                                            <span className="text-xs text-slate-700">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">KONDISI</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setCondition('LAYAK')}
                                            className={`h-10 rounded-lg text-sm font-bold transition-all ${condition === 'LAYAK'
                                                ? 'bg-green-500 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            LAYAK
                                        </button>
                                        <button
                                            onClick={() => setCondition('TIDAK LAYAK')}
                                            className={`h-10 rounded-lg text-sm font-bold transition-all ${condition === 'TIDAK LAYAK'
                                                ? 'bg-red-500 text-white shadow-md'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            TIDAK LAYAK
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">KETERANGAN</label>
                                    <input
                                        type="text"
                                        value={keterangan}
                                        onChange={(e) => setKeterangan(e.target.value)}
                                        placeholder="Catatan (opsional)..."
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
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
                                                <th className="px-2 py-2 text-left font-bold text-slate-700">LOKASI</th>
                                                <th className="px-2 py-2 text-left font-bold text-slate-700">TAG</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">KONDISI</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">AKSI</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {units.map((unit, idx) => (
                                                <tr key={unit.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                    <td className="px-2 py-2">{idx + 1}</td>
                                                    <td className="px-2 py-2 font-medium">{unit.location}</td>
                                                    <td className="px-2 py-2">{unit.tagNumber}</td>
                                                    <td className="px-2 py-2 text-center">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${unit.condition === 'LAYAK'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}>
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
                                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Lanjut Review
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Review & Tanda Tangan */}
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
                                        <p className="text-slate-500">Total Unit</p>
                                        <p className="font-bold text-2xl text-slate-800">{units.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Periode</p>
                                        <p className="font-bold text-slate-800">{MONTH_NAMES[new Date().getMonth()]} {new Date().getFullYear()}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Layak</p>
                                        <p className="font-bold text-2xl text-green-600">{totalLayak}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Tidak Layak</p>
                                        <p className="font-bold text-2xl text-red-600">{totalTidakLayak}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Camera size={18} className="text-amber-600" />
                                        <span className="font-bold text-slate-700">Foto Dokumentasi</span>
                                    </div>
                                    <span className="text-xs text-slate-400">{photos.length}/5</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {photos.map((photo, idx) => (
                                        <div key={idx} className="relative rounded-lg overflow-hidden group">
                                            <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-20 object-cover" />
                                            <button
                                                onClick={() => removePhoto(idx)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {photos.length < 5 && (
                                    <PhotoCapture label="TAMBAH FOTO" onPhotoCaptured={handlePhotoCaptured} />
                                )}
                            </div>

                            {/* Signatures */}
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <PenTool size={18} className="text-amber-600" />
                                    <span className="font-bold text-slate-700">Tanda Tangan</span>
                                </div>

                                <SignaturePad
                                    label="Diketahui Oleh (Supervisor)"
                                    onSignatureChange={setSignatureDiketahui}
                                />
                                <input
                                    type="text"
                                    value={diketahuiOleh}
                                    onChange={(e) => setDiketahuiOleh(e.target.value)}
                                    placeholder="Nama Supervisor"
                                    className="w-full p-3 border border-slate-300 rounded-xl"
                                />

                                <SignaturePad
                                    label="Diperiksa Oleh (Inspector)"
                                    onSignatureChange={setSignatureDiPeriksa}
                                />
                                <input
                                    type="text"
                                    value={diPeriksaOleh}
                                    onChange={(e) => setDiPeriksaOleh(e.target.value)}
                                    placeholder="Nama Inspector"
                                    className="w-full p-3 border border-slate-300 rounded-xl"
                                />
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
                )}
            </div>
        </div>
    );
};
