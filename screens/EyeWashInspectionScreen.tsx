import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, Save, ChevronDown, Camera, X, Check, ClipboardList, PenTool, Eye } from 'lucide-react';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { generateEyeWashPDF } from '../utils/pdfGenerator';
import { SignaturePad } from '../components/SignaturePad';

interface EyeWashFormProps {
    onNavigate: (screen: ScreenName) => void;
    user?: any;
}

const EYEWASH_LOCATIONS = [
    'Gudang Amunium Nitrat',
    'Workshop MNK',
    'Pit Stop GRMN',
    'Pit Stop GRMS',
    'Workshop Kusan',
    'Logistik Kusan',
    'Pabrikasi Kusan',
    'Workshopre Kusan',
    'Pit Stop Kusan Bawah',
    'Pit Stop Tyre KB',
    'Pit Stop Tengah KB'
];

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
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1 fields
    const [location, setLocation] = useState('');
    const [regNumber, setRegNumber] = useState('');
    const [inspector, setInspector] = useState(user?.name || '');
    const [periodeMonth, setPeriodeMonth] = useState(new Date().getMonth());
    const [periodeYear, setPeriodeYear] = useState(new Date().getFullYear());
    const [tanggalInspeksi, setTanggalInspeksi] = useState(
        new Date().toISOString().split('T')[0]
    );

    const MONTH_NAMES = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

    // Step 2 fields
    const [checks, setChecks] = useState<Record<string, boolean>>({});
    const [kondisiKeseluruhan, setKondisiKeseluruhan] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [keterangan, setKeterangan] = useState('');

    // Step 3 fields
    const [photos, setPhotos] = useState<string[]>([]);
    const [diketahuiOleh, setDiketahuiOleh] = useState('');
    const [diPeriksaOleh, setDiPeriksaOleh] = useState('');
    const [signatureDiketahui, setSignatureDiketahui] = useState('');
    const [signatureDiPeriksa, setSignatureDiPeriksa] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCheckItem = (item: string, value: boolean) => {
        setChecks(prev => ({ ...prev, [item]: value }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if (photos.length + files.length > 5) {
            alert('Maksimal 5 foto');
            return;
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotos(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const goToStep = (step: number) => {
        if (step === 2 && (!location || !regNumber || !inspector || !tanggalInspeksi)) {
            alert('Mohon lengkapi semua field pada Langkah 1');
            return;
        }
        if (step === 3 && photos.length < 3) {
            alert('Mohon upload minimal 3 foto');
            return;
        }
        setCurrentStep(step);
    };

    const handleSubmit = async () => {
        if (photos.length < 3) {
            alert('Mohon upload minimal 3 foto');
            return;
        }
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
                    date: new Date(tanggalInspeksi),
                    periodeMonth,
                    periodeYear,
                    location,
                    regNumber,
                    inspector,
                    checklistData: JSON.stringify(checks),
                    kondisiKeseluruhan,
                    keterangan,
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
                    location,
                    regNumber,
                    inspector,
                    periodeInspeksi: `${MONTH_NAMES[periodeMonth]} ${periodeYear}`,
                    tanggalInspeksi: new Date(tanggalInspeksi).toLocaleDateString('id-ID'),
                    checklistData: JSON.stringify(checks),
                    kondisiKeseluruhan,
                    keterangan,
                    photos,
                    diketahuiOleh,
                    diPeriksaOleh,
                    signatureDiketahui,
                    signatureDiPeriksa,
                    createdAt: new Date().toISOString()
                });

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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        currentStep === step
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
                    <div className="flex items-center gap-2">
                        <Eye size={24} className="text-white" />
                        <h1 className="text-xl font-bold text-white">Inspeksi Eye Wash</h1>
                    </div>
                </div>
                <StepIndicator />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4">
                {/* STEP 1: Informasi Dasar */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <ClipboardList size={20} className="text-amber-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">Informasi Dasar</h2>
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

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Periode Bulan</label>
                                        <div className="relative">
                                            <select
                                                value={periodeMonth}
                                                onChange={(e) => setPeriodeMonth(parseInt(e.target.value))}
                                                className="w-full p-3 border border-slate-300 rounded-xl appearance-none bg-white pr-10"
                                            >
                                                {MONTH_NAMES.map((month, idx) => (
                                                    <option key={idx} value={idx}>{month}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Tahun</label>
                                        <div className="relative">
                                            <select
                                                value={periodeYear}
                                                onChange={(e) => setPeriodeYear(parseInt(e.target.value))}
                                                className="w-full p-3 border border-slate-300 rounded-xl appearance-none bg-white pr-10"
                                            >
                                                {[2024, 2025, 2026, 2027].map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Inspeksi</label>
                                    <input
                                        type="date"
                                        value={tanggalInspeksi}
                                        onChange={(e) => setTanggalInspeksi(e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-xl"
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
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Lokasi</label>
                                    <div className="relative">
                                        <select
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-xl appearance-none bg-white pr-10"
                                        >
                                            <option value="">Pilih Lokasi</option>
                                            {EYEWASH_LOCATIONS.map((loc) => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">No. REG Eye Wash</label>
                                    <input
                                        type="text"
                                        value={regNumber}
                                        onChange={(e) => setRegNumber(e.target.value)}
                                        placeholder="Masukkan nomor registrasi"
                                        className="w-full p-3 border border-slate-300 rounded-xl"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => goToStep(2)}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                            >
                                Lanjut ke Pemeriksaan <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Pemeriksaan */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Check size={20} className="text-amber-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">Item Pemeriksaan</h2>
                            </div>

                            <div className="space-y-4">
                                {EYEWASH_CHECKLIST_ITEMS.map((item, idx) => (
                                    <div key={item} className="p-4 border border-slate-200 rounded-xl">
                                        <div className="font-bold text-slate-700 mb-3">{idx + 1}. {item}</div>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`check-${item}`}
                                                    checked={checks[item] === true}
                                                    onChange={() => handleCheckItem(item, true)}
                                                    className="w-5 h-5 text-green-600"
                                                />
                                                <span className="text-sm font-medium text-green-600">Layak</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`check-${item}`}
                                                    checked={checks[item] === false}
                                                    onChange={() => handleCheckItem(item, false)}
                                                    className="w-5 h-5 text-red-600"
                                                />
                                                <span className="text-sm font-medium text-red-600">Tidak Layak</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}

                                <div className="border-t-2 border-slate-200 pt-4 mt-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Kondisi Eye Wash Keseluruhan</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer px-6 py-3 border-2 rounded-xl transition-all"
                                            style={{
                                                borderColor: kondisiKeseluruhan === 'LAYAK' ? '#10b981' : '#e2e8f0',
                                                backgroundColor: kondisiKeseluruhan === 'LAYAK' ? '#d1fae5' : 'white'
                                            }}>
                                            <input
                                                type="radio"
                                                checked={kondisiKeseluruhan === 'LAYAK'}
                                                onChange={() => setKondisiKeseluruhan('LAYAK')}
                                                className="w-5 h-5 text-green-600"
                                            />
                                            <span className="font-bold text-green-700">Layak</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer px-6 py-3 border-2 rounded-xl transition-all"
                                            style={{
                                                borderColor: kondisiKeseluruhan === 'TIDAK LAYAK' ? '#ef4444' : '#e2e8f0',
                                                backgroundColor: kondisiKeseluruhan === 'TIDAK LAYAK' ? '#fee2e2' : 'white'
                                            }}>
                                            <input
                                                type="radio"
                                                checked={kondisiKeseluruhan === 'TIDAK LAYAK'}
                                                onChange={() => setKondisiKeseluruhan('TIDAK LAYAK')}
                                                className="w-5 h-5 text-red-600"
                                            />
                                            <span className="font-bold text-red-700">Tidak Layak</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Keterangan</label>
                                    <textarea
                                        value={keterangan}
                                        onChange={(e) => setKeterangan(e.target.value)}
                                        placeholder="Tulis catatan jika perlu..."
                                        rows={4}
                                        className="w-full p-3 border border-slate-300 rounded-xl resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => goToStep(3)}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                            >
                                Lanjut ke Upload Foto <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Upload Foto & Tanda Tangan */}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <Camera size={20} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-800">Upload Foto</h2>
                                        <p className="text-xs text-slate-500">Minimal 3 foto, maksimal 5 foto</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                    {photos.length}/5
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {photos.map((photo, idx) => (
                                    <div key={idx} className="relative rounded-xl overflow-hidden border-2 border-slate-200 group">
                                        <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-32 object-cover" />
                                        <button
                                            onClick={() => removePhoto(idx)}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold text-center py-1">
                                            Foto {idx + 1}
                                        </div>
                                    </div>
                                ))}

                                {photos.length < 5 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                                    >
                                        <Camera size={24} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-400">Tambah Foto</span>
                                    </button>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />

                            {photos.length < 3 && (
                                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
                                    ⚠️ Mohon upload minimal {3 - photos.length} foto lagi
                                </p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <PenTool size={20} className="text-amber-600" />
                                </div>
                                <h2 className="font-bold text-slate-800">Tanda Tangan</h2>
                            </div>

                            <div className="space-y-4">
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

                            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                                <h3 className="font-bold text-slate-700 mb-2">Review Data</h3>
                                <div className="text-sm text-slate-600 space-y-1">
                                    <p>Lokasi: <span className="font-bold">{location || '-'}</span></p>
                                    <p>No. REG: <span className="font-bold">{regNumber || '-'}</span></p>
                                    <p>Tanggal: <span className="font-bold">{new Date(tanggalInspeksi).toLocaleDateString('id-ID')}</span></p>
                                    <p>Status: <span className={`font-bold ${kondisiKeseluruhan === 'LAYAK' ? 'text-green-600' : 'text-red-600'}`}>{kondisiKeseluruhan}</span></p>
                                    <p>Foto: <span className="font-bold">{photos.length} terlampir</span></p>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                            >
                                <Save size={20} />
                                Simpan & Download PDF
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
