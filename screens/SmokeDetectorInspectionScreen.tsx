import React, { useState, useRef } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { ArrowLeft, ArrowRight, Save, ChevronDown, Camera, X, Check, ClipboardList, PenTool, Plus, Trash2, Bell } from 'lucide-react';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { generateSmokeDetectorPDF } from '../utils/pdfGenerator';
import { SignaturePad } from '../components/SignaturePad';
import { PhotoCapture } from '../components/PhotoCapture';

interface SmokeDetectorFormProps {
    onNavigate: (screen: ScreenName) => void;
    user?: any;
}

interface SmokeDetectorUnit {
    id: number;
    nomorDetector: string;
    fungsiKontrol: 'LAYAK' | 'TIDAK LAYAK';
    fungsiSensor: 'LAYAK' | 'TIDAK LAYAK';
    fungsiFireAlarm: 'LAYAK' | 'TIDAK LAYAK';
    keterangan: string;
}

const SMOKE_DETECTOR_SUB_LOKASI = [
    'Mess Baru',
    'Kantor Utama',
    'Warehouse A',
    'Workshop',
    'Area Produksi',
    'Gudang Material',
    'Ruang Server'
];

export const SmokeDetectorInspectionScreen: React.FC<SmokeDetectorFormProps> = ({ onNavigate, user }) => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useLocalStorage('smoke_step', 1);

    // Step 1 fields
    const [subLokasi, setSubLokasi] = useLocalStorage('smoke_subLokasi', '');
    const [pic, setPic] = useLocalStorage('smoke_pic', user?.name || '');
    const [periodeMonth, setPeriodeMonth] = useLocalStorage('smoke_month', new Date().getMonth());
    const [periodeYear, setPeriodeYear] = useLocalStorage('smoke_year', new Date().getFullYear());
    const [tanggalInspeksi, setTanggalInspeksi] = useLocalStorage('smoke_date', new Date().toISOString().split('T')[0]);

    const MONTH_NAMES = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];

    // Step 2 fields - Multi-unit
    const [units, setUnits] = useLocalStorage<SmokeDetectorUnit[]>('smoke_units', []);
    const [nextId, setNextId] = useLocalStorage('smoke_nextId', 1);
    const [nomorDetector, setNomorDetector] = useState('');
    const [fungsiKontrol, setFungsiKontrol] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [fungsiSensor, setFungsiSensor] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [fungsiFireAlarm, setFungsiFireAlarm] = useState<'LAYAK' | 'TIDAK LAYAK'>('LAYAK');
    const [keterangan, setKeterangan] = useState('');

    // Step 3 fields
    const [photos, setPhotos] = useLocalStorage<string[]>('smoke_photos', []);
    const [diketahuiOleh, setDiketahuiOleh] = useLocalStorage('smoke_signer_known', '');
    const [diPeriksaOleh, setDiPeriksaOleh] = useLocalStorage('smoke_signer_checked', '');
    const [signatureDiketahui, setSignatureDiketahui] = useLocalStorage('smoke_sig_known', '');
    const [signatureDiPeriksa, setSignatureDiPeriksa] = useLocalStorage('smoke_sig_checked', '');



    const handleAddUnit = () => {
        if (!nomorDetector) {
            alert('Mohon isi Nomor Smoke Detector');
            return;
        }
        if (units.length >= 27) {
            alert('Maksimal 27 unit per inspeksi');
            return;
        }

        const newUnit: SmokeDetectorUnit = {
            id: nextId,
            nomorDetector,
            fungsiKontrol,
            fungsiSensor,
            fungsiFireAlarm,
            keterangan
        };

        setUnits(prev => [...prev, newUnit]);
        setNextId(prev => prev + 1);

        // Reset form
        setNomorDetector('');
        setFungsiKontrol('LAYAK');
        setFungsiSensor('LAYAK');
        setFungsiFireAlarm('LAYAK');
        setKeterangan('');
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
        if (step === 2 && (!subLokasi || !pic || !tanggalInspeksi)) {
            alert('Mohon lengkapi semua field pada Langkah 1');
            return;
        }
        if (step === 3 && units.length === 0) {
            alert('Mohon tambahkan minimal 1 unit smoke detector');
            return;
        }
        if (step === 3 && photos.length < 3) {
            alert('Mohon upload minimal 3 foto');
            return;
        }
        setCurrentStep(step);
    };

    const totalLayak = units.filter(u =>
        u.fungsiKontrol === 'LAYAK' &&
        u.fungsiSensor === 'LAYAK' &&
        u.fungsiFireAlarm === 'LAYAK'
    ).length;
    const totalTidakLayak = units.length - totalLayak;

    const handleSubmit = async () => {
        if (units.length === 0) {
            alert('Mohon tambahkan minimal 1 unit smoke detector');
            return;
        }
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
            const response = await fetch('/api/smoke-detector', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: new Date(tanggalInspeksi),
                    periodeMonth,
                    periodeYear,
                    subLokasi,
                    pic,
                    photos: JSON.stringify(photos),
                    diketahuiOleh,
                    diPeriksaOleh,
                    signatureDiketahui,
                    signatureDiPeriksa,
                    units: units.map(u => ({
                        nomorDetector: u.nomorDetector,
                        fungsiKontrol: u.fungsiKontrol,
                        fungsiSensor: u.fungsiSensor,
                        fungsiFireAlarm: u.fungsiFireAlarm,
                        keterangan: u.keterangan
                    })),
                    userId: user?.id
                })
            });

            const result = await response.json();

            if (result.id) {
                alert('Inspeksi Smoke Detector berhasil disimpan!');

                // Clear storage
                localStorage.removeItem('smoke_step');
                localStorage.removeItem('smoke_subLokasi');
                localStorage.removeItem('smoke_pic');
                localStorage.removeItem('smoke_month');
                localStorage.removeItem('smoke_year');
                localStorage.removeItem('smoke_date');
                localStorage.removeItem('smoke_units');
                localStorage.removeItem('smoke_nextId');
                localStorage.removeItem('smoke_photos');
                localStorage.removeItem('smoke_signer_known');
                localStorage.removeItem('smoke_signer_checked');
                localStorage.removeItem('smoke_sig_known');
                localStorage.removeItem('smoke_sig_checked');

                // Reset state
                setCurrentStep(1);
                setUnits([]);
                setPhotos([]);
                setSubLokasi('');
                // setPic('');
                setDiketahuiOleh('');
                setDiPeriksaOleh('');
                setSignatureDiketahui('');
                setSignatureDiPeriksa('');


                // Generate PDF
                await generateSmokeDetectorPDF({
                    id: result.id,
                    subLokasi,
                    pic,
                    periodeInspeksi: `${MONTH_NAMES[periodeMonth]} ${periodeYear}`,
                    tanggalInspeksi: new Date(tanggalInspeksi).toLocaleDateString('id-ID'),
                    units: units.map(u => ({
                        nomorDetector: u.nomorDetector,
                        fungsiKontrol: u.fungsiKontrol,
                        fungsiSensor: u.fungsiSensor,
                        fungsiFireAlarm: u.fungsiFireAlarm,
                        keterangan: u.keterangan
                    })),
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep === step
                        ? 'bg-white text-purple-600'
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

            <div className="bg-gradient-to-r from-purple-500 to-violet-600 pt-6 pb-2 px-4 sticky top-0 z-20 shadow-md shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => currentStep === 1 ? onNavigate('home') : setCurrentStep(currentStep - 1)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Bell size={24} className="text-white" />
                        <h1 className="text-xl font-bold text-white">Inspeksi Smoke Detector</h1>
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
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <ClipboardList size={20} className="text-purple-600" />
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

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Sub Lokasi</label>
                                    <div className="relative">
                                        <select
                                            value={subLokasi}
                                            onChange={(e) => setSubLokasi(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-xl appearance-none bg-white pr-10"
                                        >
                                            <option value="">Pilih Sub Lokasi</option>
                                            {SMOKE_DETECTOR_SUB_LOKASI.map((loc) => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
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
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama PIC</label>
                                    <input
                                        type="text"
                                        value={pic}
                                        onChange={(e) => setPic(e.target.value)}
                                        placeholder="Masukkan nama PIC"
                                        className="w-full p-3 border border-slate-300 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        if (confirm('Apakah Anda yakin ingin mereset formulir? Semua data tersimpan akan dihapus.')) {
                                            localStorage.removeItem('smoke_step');
                                            localStorage.removeItem('smoke_subLokasi');
                                            localStorage.removeItem('smoke_pic');
                                            localStorage.removeItem('smoke_month');
                                            localStorage.removeItem('smoke_year');
                                            localStorage.removeItem('smoke_date');
                                            localStorage.removeItem('smoke_units');
                                            localStorage.removeItem('smoke_nextId');
                                            localStorage.removeItem('smoke_photos');
                                            localStorage.removeItem('smoke_signer_known');
                                            localStorage.removeItem('smoke_signer_checked');
                                            localStorage.removeItem('smoke_sig_known');
                                            localStorage.removeItem('smoke_sig_checked');
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
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                                >
                                    Lanjut ke Tambah Unit <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Multi-Unit Entry */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Bell size={20} className="text-purple-600" />
                                    </div>
                                    <h2 className="font-bold text-slate-800">Tambah Unit Smoke Detector</h2>
                                </div>
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                    {units.length}/27
                                </span>
                            </div>

                            <div className="space-y-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nomor Smoke Detector</label>
                                    <input
                                        type="text"
                                        value={nomorDetector}
                                        onChange={(e) => setNomorDetector(e.target.value)}
                                        placeholder="Contoh: SD-001"
                                        className="w-full p-3 border border-slate-300 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Fungsi Kontrol</label>
                                    <div className="flex gap-3">
                                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 border-2 rounded-xl transition-all"
                                            style={{
                                                borderColor: fungsiKontrol === 'LAYAK' ? '#10b981' : '#e2e8f0',
                                                backgroundColor: fungsiKontrol === 'LAYAK' ? '#d1fae5' : 'white'
                                            }}>
                                            <input
                                                type="radio"
                                                checked={fungsiKontrol === 'LAYAK'}
                                                onChange={() => setFungsiKontrol('LAYAK')}
                                                className="w-4 h-4"
                                            />
                                            <span className="font-bold text-sm">Layak</span>
                                        </label>
                                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 border-2 rounded-xl transition-all"
                                            style={{
                                                borderColor: fungsiKontrol === 'TIDAK LAYAK' ? '#ef4444' : '#e2e8f0',
                                                backgroundColor: fungsiKontrol === 'TIDAK LAYAK' ? '#fee2e2' : 'white'
                                            }}>
                                            <input
                                                type="radio"
                                                checked={fungsiKontrol === 'TIDAK LAYAK'}
                                                onChange={() => setFungsiKontrol('TIDAK LAYAK')}
                                                className="w-4 h-4"
                                            />
                                            <span className="font-bold text-sm">Tidak Layak</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Fungsi Sensor</label>
                                    <div className="flex gap-3">
                                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 border-2 rounded-xl transition-all"
                                            style={{
                                                borderColor: fungsiSensor === 'LAYAK' ? '#10b981' : '#e2e8f0',
                                                backgroundColor: fungsiSensor === 'LAYAK' ? '#d1fae5' : 'white'
                                            }}>
                                            <input
                                                type="radio"
                                                checked={fungsiSensor === 'LAYAK'}
                                                onChange={() => setFungsiSensor('LAYAK')}
                                                className="w-4 h-4"
                                            />
                                            <span className="font-bold text-sm">Layak</span>
                                        </label>
                                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 border-2 rounded-xl transition-all"
                                            style={{
                                                borderColor: fungsiSensor === 'TIDAK LAYAK' ? '#ef4444' : '#e2e8f0',
                                                backgroundColor: fungsiSensor === 'TIDAK LAYAK' ? '#fee2e2' : 'white'
                                            }}>
                                            <input
                                                type="radio"
                                                checked={fungsiSensor === 'TIDAK LAYAK'}
                                                onChange={() => setFungsiSensor('TIDAK LAYAK')}
                                                className="w-4 h-4"
                                            />
                                            <span className="font-bold text-sm">Tidak Layak</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Fungsi Fire Alarm</label>
                                    <div className="flex gap-3">
                                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 border-2 rounded-xl transition-all"
                                            style={{
                                                borderColor: fungsiFireAlarm === 'LAYAK' ? '#10b981' : '#e2e8f0',
                                                backgroundColor: fungsiFireAlarm === 'LAYAK' ? '#d1fae5' : 'white'
                                            }}>
                                            <input
                                                type="radio"
                                                checked={fungsiFireAlarm === 'LAYAK'}
                                                onChange={() => setFungsiFireAlarm('LAYAK')}
                                                className="w-4 h-4"
                                            />
                                            <span className="font-bold text-sm">Layak</span>
                                        </label>
                                        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 border-2 rounded-xl transition-all"
                                            style={{
                                                borderColor: fungsiFireAlarm === 'TIDAK LAYAK' ? '#ef4444' : '#e2e8f0',
                                                backgroundColor: fungsiFireAlarm === 'TIDAK LAYAK' ? '#fee2e2' : 'white'
                                            }}>
                                            <input
                                                type="radio"
                                                checked={fungsiFireAlarm === 'TIDAK LAYAK'}
                                                onChange={() => setFungsiFireAlarm('TIDAK LAYAK')}
                                                className="w-4 h-4"
                                            />
                                            <span className="font-bold text-sm">Tidak Layak</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Keterangan</label>
                                    <input
                                        type="text"
                                        value={keterangan}
                                        onChange={(e) => setKeterangan(e.target.value)}
                                        placeholder="Catatan (opsional)"
                                        className="w-full p-3 border border-slate-300 rounded-xl"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAddUnit}
                                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
                            >
                                <Plus size={20} />
                                Tambah Unit ke Daftar
                            </button>
                        </div>

                        {/* Units List */}
                        {units.length > 0 && (
                            <div className="bg-white rounded-xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800">Daftar Unit ({units.length})</h3>
                                    <div className="flex gap-2 text-xs">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-bold">Layak: {totalLayak}</span>
                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold">Tidak Layak: {totalTidakLayak}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {units.map((unit, idx) => (
                                        <div key={unit.id} className="p-3 border border-slate-200 rounded-xl flex items-start gap-3">
                                            <div className="flex-1">
                                                <div className="font-bold text-sm text-slate-800 mb-1">{idx + 1}. {unit.nomorDetector}</div>
                                                <div className="flex gap-2 text-xs mb-1">
                                                    <span className={`px-2 py-0.5 rounded ${unit.fungsiKontrol === 'LAYAK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        Kontrol: {unit.fungsiKontrol}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded ${unit.fungsiSensor === 'LAYAK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        Sensor: {unit.fungsiSensor}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded ${unit.fungsiFireAlarm === 'LAYAK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        Alarm: {unit.fungsiFireAlarm}
                                                    </span>
                                                </div>
                                                {unit.keterangan && (
                                                    <p className="text-xs text-slate-600 italic">{unit.keterangan}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveUnit(unit.id)}
                                                className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => goToStep(3)}
                                    className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                                >
                                    Lanjut ke Upload Foto <ArrowRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: Upload Foto & Tanda Tangan */}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Camera size={20} className="text-purple-600" />
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
                                    <div className="col-span-2">
                                        <PhotoCapture
                                            label="TAMBAH FOTO"
                                            onPhotoCaptured={handlePhotoCaptured}
                                        />
                                    </div>
                                )}
                            </div>

                            {photos.length < 3 && (
                                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
                                    ⚠️ Mohon upload minimal {3 - photos.length} foto lagi
                                </p>
                            )}
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <PenTool size={20} className="text-purple-600" />
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
                                    <p>Sub Lokasi: <span className="font-bold">{subLokasi || '-'}</span></p>
                                    <p>Tanggal: <span className="font-bold">{new Date(tanggalInspeksi).toLocaleDateString('id-ID')}</span></p>
                                    <p>Total Unit: <span className="font-bold">{units.length}</span></p>
                                    <p>Unit Layak: <span className="font-bold text-green-600">{totalLayak}</span></p>
                                    <p>Unit Tidak Layak: <span className="font-bold text-red-600">{totalTidakLayak}</span></p>
                                    <p>Foto: <span className="font-bold">{photos.length} terlampir</span></p>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
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
