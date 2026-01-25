import React, { useState } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { ArrowLeft, ArrowRight, Save, ChevronDown, Plus, Trash2, FileText, Check, ClipboardList, PenTool, Droplets, Camera, X } from 'lucide-react';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { generateHydrantPDF } from '../utils/pdfGenerator';
import { SignaturePad } from '../components/SignaturePad';
import { PhotoCapture } from '../components/PhotoCapture';

interface HydrantFormProps {
    onNavigate: (screen: ScreenName) => void;
    user?: any;
}

interface HydrantLineItem {
    id: number;
    lineNumber: string;
    komponenUnit: string;
    subKomponen: string;
    checks: Record<string, boolean>;
    condition: 'L' | 'TL';
    notes: string;

}

const HYDRANT_AREAS = [
    'HYDRANT EMULSION PLANT (GUDANG HANDAK)',
    'HYDRANT AREA WORKSHOP',
    'HYDRANT AREA OFFICE',
    'HYDRANT AREA WAREHOUSE',
    'HYDRANT AREA FUEL STATION',
    'HYDRANT AREA PARKING',
    'HYDRANT AREA MESS',
    'HYDRANT AREA CATERING'
];

const KOMPONEN_OPTIONS: Record<string, { subKomponen: string[], deskripsi: Record<string, string[]> }> = {
    'ISI BOX HYDRANT': {
        subKomponen: ['BOX HYDRANT', 'JET NOOZLE', 'HOSE HYDRANT', 'HOSE RACK', 'KUNCI HYDRANT PILLAR'],
        deskripsi: {
            'BOX HYDRANT': ['Kondisi Box Bersih', 'Tidak ada barang lain Selain Perlengkapan Hydrant'],
            'JET NOOZLE': ['Tidak Terdapat retakan Atau Bocor', 'Kaitan Sambungan Kopling Tidak Aus'],
            'HOSE HYDRANT': ['Tidak dalam Keadaan Bocor', 'Tersusun Rapi di Hose Rack'],
            'HOSE RACK': ['Rack Tidak Ada Yang Patah', 'Mudah di urai Jika digunakan'],
            'KUNCI HYDRANT PILLAR': ['Tersedia Kunci Hydrant', 'Kunci Hydrant Valve Berfungsi Dengan Baik']
        }
    },
    'WATER CANNON': {
        subKomponen: ['WATER CANNON'],
        deskripsi: {
            'WATER CANNON': ['Tidak Ada Keretakan, Kebocoran & Berkarat', 'Mekanisme katup Bisa dibuka, ditutup & diputar dengan lancar', 'Mekanisme Drainase Tidak Ada Sumbatan']
        }
    },
    'HYDRANT PILLAR': {
        subKomponen: ['HYDRANT PILLAR'],
        deskripsi: {
            'HYDRANT PILLAR': ['Tidak ada Retakan, Korosi atau keausan', 'Tidak dalam Keadaan Bocor', 'Mudah Digunakan dan Tidak Berkarat', 'Valve pillar Hydran di buka & di tutup dengan mudah', 'Tidak ada sumbatan']
        }
    },
    'PIPA HYDRANT': {
        subKomponen: ['PIPA HYDRANT'],
        deskripsi: {
            'PIPA HYDRANT': ['Pipa Hydrant Tidak ada kebocoran, retakan & korosif']
        }
    }
};

export const HydrantInspectionScreen: React.FC<HydrantFormProps> = ({ onNavigate, user }) => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useLocalStorage('hydrant_step', 1);
    const LINES = ['LINE 1', 'LINE 2', 'LINE 3', 'LINE 4', 'LINE 5'];
    const activeLine = currentStep >= 2 && currentStep <= 6 ? LINES[currentStep - 2] : '';

    const [areaInspeksi, setAreaInspeksi] = useLocalStorage('hydrant_area', '');
    const [pic, setPic] = useLocalStorage('hydrant_pic', user?.name || '');
    const [periodeMonth, setPeriodeMonth] = useLocalStorage('hydrant_month', new Date().getMonth());
    const [periodeYear, setPeriodeYear] = useLocalStorage('hydrant_year', new Date().getFullYear());

    const MONTH_NAMES = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

    const [lineNumber, setLineNumber] = useState('LINE 1');
    const [komponenUnit, setKomponenUnit] = useState('ISI BOX HYDRANT');
    const [subKomponen, setSubKomponen] = useState('BOX HYDRANT');
    const [unitNumber, setUnitNumber] = useState('01');
    const [checks, setChecks] = useState<Record<string, boolean>>({});
    const [condition, setCondition] = useState<'L' | 'TL'>('L');
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState('');

    const [items, setItems] = useLocalStorage<HydrantLineItem[]>('hydrant_items', []);
    const [nextId, setNextId] = useLocalStorage('hydrant_nextId', 1);

    const [diketahuiOleh, setDiketahuiOleh] = useLocalStorage('hydrant_signer_known', '');
    const [diPeriksaOleh, setDiPeriksaOleh] = useLocalStorage('hydrant_signer_checked', '');
    const [signatureDiketahui, setSignatureDiketahui] = useLocalStorage('hydrant_sig_known', '');
    const [signatureDiPeriksa, setSignatureDiPeriksa] = useLocalStorage('hydrant_sig_checked', '');
    const [sessionPhotos, setSessionPhotos] = useLocalStorage<string[]>('hydrant_photos', []);

    const currentDeskripsi = KOMPONEN_OPTIONS[komponenUnit]?.deskripsi[subKomponen] || [];

    const handleCheck = (item: string) => {
        setChecks(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const resetItemForm = () => {
        setUnitNumber(String(parseInt(unitNumber) + 1).padStart(2, '0'));
        setChecks({});
        setCondition('L');
        setNotes('');
    };

    const handleAddItem = () => {
        if (!subKomponen) {
            alert('Mohon pilih Sub Komponen');
            return;
        }

        const newItem: HydrantLineItem = {
            id: nextId,
            lineNumber: activeLine,
            komponenUnit,
            subKomponen: `${subKomponen} ${unitNumber}`,
            checks: { ...checks },
            condition,
            notes
        };

        setItems(prev => [...prev, newItem]);
        setNextId(prev => prev + 1);
        resetItemForm();
    };

    const handleRemoveItem = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const goToStep = (step: number) => {
        if (step > currentStep) {
            // Validation before moving forward
            if (currentStep === 1 && (!areaInspeksi || !pic)) {
                alert('Mohon lengkapi Area Inspeksi dan nama PIC');
                return;
            }
            // Optional: require at least one item per line? For now, allow skipping lines (maybe no hydrant there).
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
            const inspectionData = {
                date: new Date(),
                location: areaInspeksi,
                checklistData: JSON.stringify({
                    items: items.map(item => ({
                        lineNumber: item.lineNumber,
                        komponenUnit: item.komponenUnit,
                        subKomponen: item.subKomponen,
                        checks: item.checks,
                        condition: item.condition,
                        notes: item.notes
                    })),
                    photos: sessionPhotos,
                    periodeInspeksi: `${MONTH_NAMES[periodeMonth]} ${periodeYear}`,
                    diketahuiOleh,
                    diPeriksaOleh,
                    signatureDiketahui,
                    signatureDiPeriksa
                }),
                notes: '',
                pic: diPeriksaOleh,
                userId: user?.id
            };

            const response = await fetch('/api/hydrant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inspectionData),
            });
            const data = await response.json();

            if (data.id) {
                alert('Inspeksi Hydrant berhasil disimpan!');

                // Clear local storage session
                localStorage.removeItem('hydrant_step');
                localStorage.removeItem('hydrant_area');
                localStorage.removeItem('hydrant_pic');
                localStorage.removeItem('hydrant_month');
                localStorage.removeItem('hydrant_year');
                localStorage.removeItem('hydrant_items');
                localStorage.removeItem('hydrant_nextId');
                localStorage.removeItem('hydrant_signer_known');
                localStorage.removeItem('hydrant_signer_checked');
                localStorage.removeItem('hydrant_sig_known');
                localStorage.removeItem('hydrant_sig_checked');
                localStorage.removeItem('hydrant_photos');

                // Reset state manually to ensure UI updates immediately
                setCurrentStep(1);
                setItems([]);
                setSessionPhotos([]);
                setChecks({});
                setAreaInspeksi('');
                // setPic(''); // Keep PIC maybe? Or reset. Let's reset to default or keep user name.
                setDiketahuiOleh('');
                setDiPeriksaOleh('');
                setSignatureDiketahui('');
                setSignatureDiPeriksa('');


                await generateHydrantPDF({
                    id: data.id,
                    location: areaInspeksi,
                    pic: diPeriksaOleh,
                    diketahuiOleh,
                    diPeriksaOleh,
                    signatureDiketahui,
                    signatureDiPeriksa,
                    periodeInspeksi: `${MONTH_NAMES[periodeMonth]} ${periodeYear}`,
                    createdAt: new Date().toISOString(),
                    items: items.map((item, idx) => ({
                        no: idx + 1,
                        lineNumber: item.lineNumber,
                        komponenUnit: item.komponenUnit,
                        subKomponen: item.subKomponen,
                        checks: item.checks,
                        condition: item.condition,
                        notes: item.notes
                    })),
                    photos: sessionPhotos
                });

                onNavigate('history');
            } else {
                alert('Gagal menyimpan inspeksi.');
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('Gagal terhubung ke server.');
        } finally {
            setLoading(false);
        }
    };

    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-1 py-3 bg-white/10 overflow-x-auto px-4">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => {
                let label = '';
                if (step === 1) label = 'Info';
                else if (step === 7) label = 'Review';
                else label = `L${step - 1}`; // L1, L2...

                return (
                    <div key={step} className="flex items-center flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${currentStep === step
                            ? 'bg-white text-cyan-600 border-white'
                            : currentStep > step
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-transparent text-white/50 border-white/30'
                            }`}>
                            {currentStep > step ? <Check size={14} /> : label}
                        </div>
                        {step < 7 && (
                            <div className={`w-4 h-0.5 mx-0.5 rounded ${currentStep > step ? 'bg-green-500' : 'bg-white/20'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F3F6F8] font-sans pb-32 flex flex-col">
            <LoadingOverlay isLoading={loading} message="Menyimpan inspeksi..." />

            <div className="bg-cyan-600 pt-6 pb-2 px-4 sticky top-0 z-20 shadow-md shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => currentStep === 1 ? onNavigate('home') : setCurrentStep(currentStep - 1)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white">INSPEKSI HYDRANT</h1>
                        <p className="text-cyan-100 text-xs">
                            {currentStep === 1 && 'Langkah 1: Informasi Inspeksi'}
                            {currentStep >= 2 && currentStep <= 6 && `Langkah ${currentStep}: Inspeksi ${activeLine}`}
                            {currentStep === 7 && 'Langkah 7: Review & Tanda Tangan'}
                        </p>
                    </div>
                    {items.length > 0 && (
                        <div className="bg-white/20 px-3 py-1 rounded-full">
                            <span className="text-white text-sm font-bold">{items.length} Item</span>
                        </div>
                    )}
                </div>
                <StepIndicator />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">

                {currentStep === 1 && (
                    <div className="bg-white rounded-xl p-5 shadow-sm space-y-5 max-w-2xl mx-auto w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                                <Droplets size={24} className="text-cyan-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Informasi Inspeksi</h2>
                                <p className="text-slate-500 text-sm">Pilih area dan nama petugas</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">AREA INSPEKSI</label>
                                <div className="relative">
                                    <select
                                        value={areaInspeksi}
                                        onChange={(e) => setAreaInspeksi(e.target.value)}
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Pilih Area --</option>
                                        {HYDRANT_AREAS.map((area) => (
                                            <option key={area} value={area}>{area}</option>
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
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">PERIODE INSPEKSI</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <select
                                            value={periodeMonth}
                                            onChange={(e) => setPeriodeMonth(Number(e.target.value))}
                                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none cursor-pointer"
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
                                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none cursor-pointer"
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
                                        localStorage.removeItem('hydrant_step');
                                        localStorage.removeItem('hydrant_area');
                                        localStorage.removeItem('hydrant_pic');
                                        localStorage.removeItem('hydrant_month');
                                        localStorage.removeItem('hydrant_year');
                                        localStorage.removeItem('hydrant_items');
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
                                disabled={!areaInspeksi || !pic}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                Lanjut ke Tambah Item
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Dynamic Line Steps (2-6) */}
                {currentStep >= 2 && currentStep <= 6 && (
                    <div className="space-y-4 max-w-5xl mx-auto w-full">
                        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Plus size={20} className="text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800">Inspeksi {activeLine}</h2>
                                    <p className="text-slate-500 text-xs">Area: {areaInspeksi}</p>
                                </div>
                                <span className="text-xs text-slate-400 ml-auto bg-slate-100 px-3 py-1 rounded-full">Item ke-{items.length + 1}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">LINE</label>
                                    <input
                                        type="text"
                                        value={activeLine}
                                        disabled
                                        className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">KOMPONEN UNIT</label>
                                    <select
                                        value={komponenUnit}
                                        onChange={(e) => {
                                            setKomponenUnit(e.target.value);
                                            const firstSub = KOMPONEN_OPTIONS[e.target.value]?.subKomponen[0] || '';
                                            setSubKomponen(firstSub);
                                            setChecks({});
                                        }}
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                    >
                                        {Object.keys(KOMPONEN_OPTIONS).map(k => (
                                            <option key={k} value={k}>{k}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">SUB-KOMPONEN</label>
                                    <select
                                        value={subKomponen}
                                        onChange={(e) => {
                                            setSubKomponen(e.target.value);
                                            setChecks({});
                                        }}
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                    >
                                        {KOMPONEN_OPTIONS[komponenUnit]?.subKomponen.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">NO UNIT</label>
                                    <input
                                        type="text"
                                        value={unitNumber}
                                        onChange={(e) => setUnitNumber(e.target.value)}
                                        placeholder="01, 02..."
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[10px] text-slate-500 font-medium mb-2">DESKRIPSI PEMERIKSAAN (Centang jika OK)</p>
                                <div className="space-y-2">
                                    {currentDeskripsi.map((item) => (
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
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">LAYAK / TIDAK LAYAK</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setCondition('L')}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${condition === 'L' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-200'}`}
                                        >
                                            L (LAYAK)
                                        </button>
                                        <button
                                            onClick={() => setCondition('TL')}
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all ${condition === 'TL' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-400 border-slate-200'}`}
                                        >
                                            TL (TIDAK LAYAK)
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
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    // Make sure to add current item logic if needed? 
                                    // Use handleAddItem for the current form state to items list
                                    const newLineItem: HydrantLineItem = {
                                        id: nextId,
                                        lineNumber: activeLine, // Use activeLine
                                        komponenUnit,
                                        subKomponen: `${subKomponen} ${unitNumber}`,
                                        checks: { ...checks },
                                        condition,
                                        notes
                                    };

                                    // Basic validation before adding
                                    if (!subKomponen) {
                                        alert('Mohon lengkapi data item');
                                        return;
                                    }

                                    setItems(prev => [...prev, newLineItem]);
                                    setNextId(prev => prev + 1);
                                    resetItemForm();
                                }}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} />
                                Tambah Item ke {activeLine}
                            </button>
                        </div>

                        {/* List Items Specific to Current Line for clarity? Or All? Let's show All but highlight current line maybe? Or just All. */}
                        {items.length > 0 && (
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <ClipboardList size={16} className="text-blue-600" />
                                    </div>
                                    <h2 className="font-bold text-slate-700">Daftar Item ({items.length})</h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-300">
                                                <th className="px-2 py-2 text-left font-bold text-slate-700">NO</th>
                                                <th className="px-2 py-2 text-left font-bold text-slate-700">LINE</th>
                                                <th className="px-2 py-2 text-left font-bold text-slate-700">KOMPONEN</th>
                                                <th className="px-2 py-2 text-left font-bold text-slate-700">SUB-KOMPONEN</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">L/TL</th>
                                                <th className="px-2 py-2 text-center font-bold text-slate-700">Hapus</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, idx) => (
                                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="px-2 py-2 font-medium">{idx + 1}</td>
                                                    <td className="px-2 py-2">{item.lineNumber}</td>
                                                    <td className="px-2 py-2">{item.komponenUnit}</td>
                                                    <td className="px-2 py-2">{item.subKomponen}</td>
                                                    <td className="px-2 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.condition === 'L' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                            {item.condition}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-2 text-center">
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
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
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} />
                                {currentStep === 2 ? 'Info' : `Line ${currentStep - 2}`}
                            </button>
                            <button
                                onClick={() => goToStep(currentStep + 1)}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {currentStep === 6 ? 'Lanjut Review' : `Lanjut ke Line ${currentStep}`}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 7 && (
                    <div className="space-y-4 max-w-3xl mx-auto w-full">
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <ClipboardList size={24} className="text-green-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 text-lg">Review Inspeksi</h2>
                                    <p className="text-slate-500 text-sm">{areaInspeksi}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Area:</span>
                                        <p className="font-bold text-slate-800">{areaInspeksi}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Jumlah Item:</span>
                                        <p className="font-bold text-slate-800">{items.length} Item</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Layak:</span>
                                        <p className="font-bold text-emerald-600">{items.filter(i => i.condition === 'L').length} Item</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Tidak Layak:</span>
                                        <p className="font-bold text-red-600">{items.filter(i => i.condition === 'TL').length} Item</p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto mb-4">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="px-2 py-2 text-left">NO</th>
                                            <th className="px-2 py-2 text-left">LINE</th>
                                            <th className="px-2 py-2 text-left">SUB-KOMPONEN</th>
                                            <th className="px-2 py-2 text-center">L/TL</th>
                                            <th className="px-2 py-2 text-left">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={item.id} className="border-b border-slate-100">
                                                <td className="px-2 py-2">{idx + 1}</td>
                                                <td className="px-2 py-2">{item.lineNumber}</td>
                                                <td className="px-2 py-2">{item.subKomponen}</td>
                                                <td className="px-2 py-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.condition === 'L' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {item.condition}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-slate-500">{item.notes || '-'}</td>
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
                                onClick={() => setCurrentStep(6)}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} />
                                Kembali ke Line 5
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
        </div >

    );
};
