import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { ArrowLeft, ArrowRight, Save, ChevronDown, Camera, X, Check, ClipboardList, PenTool, Plus, Trash2, Bell } from 'lucide-react';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { generateSmokeDetectorPDF } from '../utils/pdfGenerator';
import { SignaturePad } from '../components/SignaturePad';
import { PhotoCapture } from '../components/PhotoCapture';
import { getUniqueAreas, getLocationsWithTagByArea, LocationWithTag, formatTagNumber, parseTagNumber } from '../data/spipData';

interface SmokeDetectorFormProps {
    onNavigate: (screen: ScreenName) => void;
    user?: any;
}

interface SmokeDetectorUnit {
    id: number;
    nomorDetector: string; // Lokasi
    tagNumber: string; // SD-XX
    fungsiKontrol: 'LAYAK' | 'TIDAK LAYAK';
    fungsiSensor: 'LAYAK' | 'TIDAK LAYAK';
    fungsiFireAlarm: 'LAYAK' | 'TIDAK LAYAK';
    keterangan: string;
}

// Get unique areas for Smoke Detector
const SMOKE_DETECTOR_AREAS = getUniqueAreas('smoke');

export const SmokeDetectorInspectionScreen: React.FC<SmokeDetectorFormProps> = ({ onNavigate, user }) => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useLocalStorage('smoke_step', 1);

    // Step 1 fields
    const [area, setArea] = useLocalStorage('smoke_area', '');
    const [pic, setPic] = useLocalStorage('smoke_pic', user?.name || '');

    // Get locations with tag numbers based on selected area
    const availableLocations = useMemo((): LocationWithTag[] => {
        if (area) {
            return getLocationsWithTagByArea('smoke', area);
        }
        return [];
    }, [area]);

    const MONTH_NAMES = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

    // Step 2 fields - Multi-unit
    const [units, setUnits] = useLocalStorage<SmokeDetectorUnit[]>('smoke_units', []);
    const [nextId, setNextId] = useLocalStorage('smoke_nextId', 1);

    // Unit Input State
    const [nomorDetector, setNomorDetector] = useState(''); // This will store the Location Name
    const [isManualUnit, setIsManualUnit] = useState(false);
    const [tagNumber, setTagNumber] = useState('');

    const [fungsiKontrol, setFungsiKontrol] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [fungsiSensor, setFungsiSensor] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [fungsiFireAlarm, setFungsiFireAlarm] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [keterangan, setKeterangan] = useState('');

    // Step 3 fields
    const [photos, setPhotos] = useLocalStorage<string[]>('smoke_photos', []); // sessionPhotos
    const [diketahuiOleh, setDiketahuiOleh] = useLocalStorage('smoke_signer_known', '');
    const [diPeriksaOleh, setDiPeriksaOleh] = useLocalStorage('smoke_signer_checked', '');
    const [signatureDiketahui, setSignatureDiketahui] = useLocalStorage('smoke_sig_known', '');
    const [signatureDiPeriksa, setSignatureDiPeriksa] = useLocalStorage('smoke_sig_checked', '');

    const handleAddUnit = () => {
        if (!nomorDetector) {
            alert('Mohon isi Lokasi Smoke Detector');
            return;
        }
        if (units.length >= 27) {
            alert('Maksimal 27 unit per inspeksi');
            return;
        }

        const newUnit: SmokeDetectorUnit = {
            id: nextId,
            nomorDetector,
            tagNumber: formatTagNumber('smoke', tagNumber || String(nextId)),
            fungsiKontrol,
            fungsiSensor,
            fungsiFireAlarm,
            keterangan
        };

        setUnits(prev => [...prev, newUnit]);
        setNextId(prev => prev + 1);

        // Reset form
        setNomorDetector('');
        setIsManualUnit(false);
        setTagNumber('');
        setFungsiKontrol('LAYAK');
        setFungsiSensor('LAYAK');
        setFungsiFireAlarm('LAYAK');
        setKeterangan('');
    };

    const handleRemoveUnit = (id: number) => {
        setUnits(prev => prev.filter(u => u.id !== id));
    };

    const goToStep = (step: number) => {
        if (step === 2 && (!area || !pic)) {
            alert('Mohon isi Area dan Nama PIC');
            return;
        }
        if (step === 3 && units.length === 0) {
            alert('Mohon tambahkan minimal 1 unit Smoke Detector');
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
                // Smoke detector checklist is simpler but let's conform to pattern
                const checklistPayload: any = {
                    fungsiKontrol: unit.fungsiKontrol === 'LAYAK',
                    fungsiSensor: unit.fungsiSensor === 'LAYAK',
                    fungsiFireAlarm: unit.fungsiFireAlarm === 'LAYAK'
                };

                if (index === 0 && photos.length > 0) {
                    checklistPayload.photos = photos;
                }

                const response = await fetch('/api/smoke-detector', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: new Date(),
                        area,
                        location: unit.nomorDetector,
                        tagNumber: unit.tagNumber,
                        checks: JSON.stringify(checklistPayload), // Store simple checks

                        // We map condition to one of them or overall logic?
                        // Let's assume passed condition if all LAYAK
                        condition: (unit.fungsiKontrol === 'LAYAK' && unit.fungsiSensor === 'LAYAK' && unit.fungsiFireAlarm === 'LAYAK') ? 'LAYAK' : 'TIDAK LAYAK',

                        notes: unit.keterangan,
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
                alert(`${results.length} unit Smoke Detector berhasil disimpan!`);

                const unitsForPDF = units.map((u, idx) => ({
                    no: idx + 1,
                    location: u.nomorDetector,
                    tagNumber: u.tagNumber,
                    fungsiKontrol: u.fungsiKontrol,
                    fungsiSensor: u.fungsiSensor,
                    fungsiFireAlarm: u.fungsiFireAlarm,
                    keterangan: u.keterangan || '-'
                }));

                await generateSmokeDetectorPDF({
                    id: results[0].dbId,
                    area,
                    pic: diPeriksaOleh,
                    diketahuiOleh,
                    diPeriksaOleh,
                    signatureDiketahui,
                    signatureDiPeriksa,
                    periodeInspeksi: `${MONTH_NAMES[new Date().getMonth()]} ${new Date().getFullYear()}`,
                    createdAt: new Date().toISOString(),
                    units: unitsForPDF,
                    photosData: photos
                } as any);

                // Clear storage
                localStorage.removeItem('smoke_step');
                localStorage.removeItem('smoke_area');
                localStorage.removeItem('smoke_pic');
                // localStorage.removeItem('smoke_selectedKey'); // Removed usage
                localStorage.removeItem('smoke_units');
                localStorage.removeItem('smoke_nextId');
                localStorage.removeItem('smoke_signer_known');
                localStorage.removeItem('smoke_signer_checked');
                localStorage.removeItem('smoke_sig_known');
                localStorage.removeItem('smoke_sig_checked');
                localStorage.removeItem('smoke_photos');

                // Reset state
                setCurrentStep(1);
                setUnits([]);
                setPhotos([]);
                setArea('');
                // setPic('');
                setDiketahuiOleh('');
                setDiPeriksaOleh('');
                setSignatureDiketahui('');
                setSignatureDiPeriksa('');

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
                        ? 'bg-white text-orange-600'
                        : currentStep > step
                            ? 'bg-orange-800 text-white'
                            : 'bg-white/30 text-white'
                        }`}>
                        {currentStep > step ? <Check size={16} /> : step}
                    </div>
                    {step < 3 && (
                        <div className={`w-8 h-1 mx-1 rounded ${currentStep > step ? 'bg-orange-800' : 'bg-white/30'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F3F6F8] font-sans pb-32 flex flex-col">
            <LoadingOverlay isLoading={loading} message="Menyimpan inspeksi..." />

            <div className="bg-orange-600 pt-6 pb-2 px-4 sticky top-0 z-20 shadow-md shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => currentStep === 1 ? onNavigate('home') : setCurrentStep(currentStep - 1)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white">INSPEKSI SMOKE DETECTOR</h1>
                        <p className="text-orange-100 text-xs">
                            {currentStep === 1 && 'Langkah 1: Informasi Inspeksi'}
                            {currentStep === 2 && 'Langkah 2: Tambah Unit Smoke Detector'}
                            {currentStep === 3 && 'Langkah 3: Review & Tanda Tangan'}
                        </p>
                    </div>
                </div>
                <StepIndicator />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
                {currentStep === 1 && (
                    <div className="bg-white rounded-xl p-5 shadow-sm space-y-5 max-w-2xl mx-auto w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Bell size={24} className="text-orange-600" />
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
                                            setUnits([]);
                                            setNextId(1);
                                            // Reset unit inputs
                                            setNomorDetector('');
                                            setTagNumber('');
                                        }}
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Pilih Area --</option>
                                        {SMOKE_DETECTOR_AREAS.map((loc) => (
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
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    if (confirm('Apakah Anda yakin ingin mereset formulir?')) {
                                        localStorage.removeItem('smoke_step');
                                        localStorage.removeItem('smoke_area');
                                        localStorage.removeItem('smoke_pic');
                                        localStorage.removeItem('smoke_units');
                                        localStorage.removeItem('smoke_nextId');
                                        localStorage.removeItem('smoke_signer_known');
                                        localStorage.removeItem('smoke_signer_checked');
                                        localStorage.removeItem('smoke_sig_known');
                                        localStorage.removeItem('smoke_sig_checked');
                                        localStorage.removeItem('smoke_photos');
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
                                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
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
                                    <h2 className="font-bold text-slate-800">Tambah Unit Smoke Detector</h2>
                                    <p className="text-slate-500 text-xs">Area: {area}</p>
                                </div>
                                <span className="text-xs text-slate-400 ml-auto bg-slate-100 px-3 py-1 rounded-full">Unit ke-{units.length + 1}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">LOKASI DETEKTOR</label>
                                    <div className="relative">
                                        <select
                                            value={isManualUnit ? 'MANUAL_ENTRY' : nomorDetector}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'MANUAL_ENTRY') {
                                                    setIsManualUnit(true);
                                                    setNomorDetector('');
                                                    setTagNumber('');
                                                } else {
                                                    setIsManualUnit(false);
                                                    setNomorDetector(val);
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
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer pr-8"
                                        >
                                            <option value="">-- Pilih Lokasi --</option>
                                            {availableLocations.map(p => (
                                                <option key={`${p.location}|${p.regNumber}`} value={p.displayName}>{p.displayName}</option>
                                            ))}
                                            <option value="MANUAL_ENTRY">Lainnya (Input Manual)</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                    {isManualUnit && (
                                        <input
                                            type="text"
                                            value={nomorDetector}
                                            onChange={(e) => setNomorDetector(e.target.value)}
                                            placeholder="Masukkan Lokasi Detektor Manual..."
                                            className="w-full mt-2 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">NO TAG (cukup angka)</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-2 rounded-lg">SD-</span>
                                        <input
                                            type="number"
                                            value={tagNumber}
                                            onChange={(e) => setTagNumber(e.target.value.replace(/\D/g, ''))}
                                            placeholder={`${units.length + 1}`}
                                            className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                            min="1"
                                        />
                                    </div>
                                    {tagNumber && <span className="text-xs text-slate-500 mt-1 block">Output: {formatTagNumber('smoke', tagNumber)}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">FUNGSI KONTROL</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setFungsiKontrol('LAYAK')}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${fungsiKontrol === 'LAYAK' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-200'}`}
                                        >
                                            LAYAK
                                        </button>
                                        <button
                                            onClick={() => setFungsiKontrol('TIDAK LAYAK')}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${fungsiKontrol === 'TIDAK LAYAK' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200'}`}
                                        >
                                            TIDAK LAYAK
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">FUNGSI SENSOR</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setFungsiSensor('LAYAK')}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${fungsiSensor === 'LAYAK' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-200'}`}
                                        >
                                            LAYAK
                                        </button>
                                        <button
                                            onClick={() => setFungsiSensor('TIDAK LAYAK')}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${fungsiSensor === 'TIDAK LAYAK' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200'}`}
                                        >
                                            TIDAK LAYAK
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">FUNGSI FIRE ALARM</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setFungsiFireAlarm('LAYAK')}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${fungsiFireAlarm === 'LAYAK' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-200'}`}
                                        >
                                            LAYAK
                                        </button>
                                        <button
                                            onClick={() => setFungsiFireAlarm('TIDAK LAYAK')}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${fungsiFireAlarm === 'TIDAK LAYAK' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200'}`}
                                        >
                                            TIDAK LAYAK
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">KETERANGAN</label>
                                <input
                                    type="text"
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    placeholder="Catatan tambahan (opsional)..."
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                />
                            </div>

                            <button
                                onClick={handleAddUnit}
                                disabled={!nomorDetector}
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
                                    <h2 className="font-bold text-slate-700">Daftar Unit ({units.length}/27)</h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-300">
                                                <th className="px-2 py-2 text-left font-bold text-slate-700">NO</th>
                                                <th className="px-2 py-2 text-left font-bold text-slate-700">Lokasi</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Tag</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Kontrol</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Sensor</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Alarm</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Hapus</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {units.map((unit, idx) => (
                                                <tr key={unit.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="px-2 py-2 font-medium">{idx + 1}</td>
                                                    <td className="px-2 py-2">{unit.nomorDetector}</td>
                                                    <td className="px-2 py-2 text-center">{unit.tagNumber}</td>
                                                    <td className="px-2 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${unit.fungsiKontrol === 'LAYAK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                            {unit.fungsiKontrol === 'LAYAK' ? 'OK' : 'NO'}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${unit.fungsiSensor === 'LAYAK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                            {unit.fungsiSensor === 'LAYAK' ? 'OK' : 'NO'}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${unit.fungsiFireAlarm === 'LAYAK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                            {unit.fungsiFireAlarm === 'LAYAK' ? 'OK' : 'NO'}
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
                                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
                                </div>
                            </div>

                            <div className="overflow-x-auto mb-4">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="px-2 py-2 text-left">NO</th>
                                            <th className="px-2 py-2 text-left">Lokasi</th>
                                            <th className="px-2 py-2 text-center">Tag</th>
                                            <th className="px-2 py-2 text-center">Kontrol</th>
                                            <th className="px-2 py-2 text-center">Sensor</th>
                                            <th className="px-2 py-2 text-center">Alarm</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {units.map((unit, idx) => (
                                            <tr key={unit.id} className="border-b border-slate-100">
                                                <td className="px-2 py-2">{idx + 1}</td>
                                                <td className="px-2 py-2">{unit.nomorDetector}</td>
                                                <td className="px-2 py-2 text-center">{unit.tagNumber}</td>
                                                <td className="px-2 py-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${unit.fungsiKontrol === 'LAYAK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {unit.fungsiKontrol === 'LAYAK' ? 'OK' : 'NO'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${unit.fungsiSensor === 'LAYAK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {unit.fungsiSensor === 'LAYAK' ? 'OK' : 'NO'}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${unit.fungsiFireAlarm === 'LAYAK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {unit.fungsiFireAlarm === 'LAYAK' ? 'OK' : 'NO'}
                                                    </span>
                                                </td>
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
                                <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{photos.length}/5</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {photos.map((photo, idx) => (
                                    <div key={idx} className="relative rounded-xl overflow-hidden border-2 border-slate-200 group">
                                        <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-32 object-cover" />
                                        <button
                                            onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold text-center py-1">
                                            Foto {idx + 1}
                                        </div>
                                    </div>
                                ))}

                                {photos.length < 5 && (
                                    <div className="col-span-2">
                                        <PhotoCapture
                                            label="TAMBAH FOTO DOKUMENTASI"
                                            onPhotoCaptured={(base64) => {
                                                if (base64) setPhotos(prev => [...prev, base64]);
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

            </div>
        </div>
    );
};
