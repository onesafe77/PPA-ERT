import React, { useState } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { ArrowLeft, ArrowRight, Camera, Calendar, AlertCircle, Save, X, Trash2, Plus, ClipboardList, Check, MapPin, Flag, FileText, PenTool, Flame, Droplets, Eye, Wind, Truck, Shield } from 'lucide-react';
import { PhotoCapture } from '../components/PhotoCapture';
import { ScreenName } from '../types';
import { LoadingOverlay } from '../components/LoadingOverlay';

interface PicaFormScreenProps {
    onNavigate: (screen: ScreenName) => void;
    user: any;
}

// Category definitions with icons and colors
const PICA_CATEGORIES = [
    { id: 'P2H', name: 'P2H', icon: Truck, color: 'bg-blue-500', lightColor: 'bg-blue-100', textColor: 'text-blue-600', description: 'Pemeriksaan Harian Kendaraan' },
    { id: 'Gear', name: 'Gear', icon: Shield, color: 'bg-purple-500', lightColor: 'bg-purple-100', textColor: 'text-purple-600', description: 'Alat Pelindung Diri (APD)' },
    { id: 'APAR', name: 'APAR', icon: Flame, color: 'bg-red-500', lightColor: 'bg-red-100', textColor: 'text-red-600', description: 'Alat Pemadam Api Ringan' },
    { id: 'Eye Wash', name: 'Eye Wash', icon: Eye, color: 'bg-cyan-500', lightColor: 'bg-cyan-100', textColor: 'text-cyan-600', description: 'Pencuci Mata Darurat' },
    { id: 'Hydrant', name: 'Hydrant', icon: Droplets, color: 'bg-emerald-500', lightColor: 'bg-emerald-100', textColor: 'text-emerald-600', description: 'Fire Hydrant' },
    { id: 'Smoke Detector', name: 'Smoke Detector', icon: Wind, color: 'bg-orange-500', lightColor: 'bg-orange-100', textColor: 'text-orange-600', description: 'Detektor Asap' },
];

const PRIORITY_OPTIONS = [
    { id: 'LOW', name: 'Rendah', color: 'bg-slate-500', dotColor: 'bg-slate-400' },
    { id: 'MEDIUM', name: 'Sedang', color: 'bg-yellow-500', dotColor: 'bg-yellow-400' },
    { id: 'HIGH', name: 'Tinggi', color: 'bg-orange-500', dotColor: 'bg-orange-400' },
    { id: 'CRITICAL', name: 'Kritis', color: 'bg-red-500', dotColor: 'bg-red-400' },
];

interface PicaItem {
    id: number;
    title: string;
    description: string;
    location: string;
    priority: string;
    photos: string[];
}

export const PicaFormScreen: React.FC<PicaFormScreenProps> = ({ onNavigate, user }) => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useLocalStorage('pica_step', 1);

    // Step 1: Category selection
    const [selectedCategory, setSelectedCategory] = useLocalStorage<string>('pica_category', '');

    // Step 2: Add items
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [itemPhotos, setItemPhotos] = useState<string[]>([]);

    // Items list
    const [picaItems, setPicaItems] = useLocalStorage<PicaItem[]>('pica_items', []);
    const [nextId, setNextId] = useLocalStorage('pica_nextId', 1);

    // Step 3: Review
    const [deadline, setDeadline] = useLocalStorage('pica_deadline', '');

    const selectedCategoryData = PICA_CATEGORIES.find(c => c.id === selectedCategory);

    const resetItemForm = () => {
        setTitle('');
        setDescription('');
        setLocation('');
        setPriority('MEDIUM');
        setItemPhotos([]);
    };

    const handleAddItem = () => {
        if (!title || !description) {
            alert('Mohon isi Judul dan Deskripsi masalah!');
            return;
        }
        if (picaItems.length >= 20) {
            alert('Maksimal 20 laporan per sesi');
            return;
        }

        const newItem: PicaItem = {
            id: nextId,
            title,
            description,
            location,
            priority,
            photos: [...itemPhotos]
        };

        setPicaItems(prev => [...prev, newItem]);
        setNextId(prev => prev + 1);
        resetItemForm();
    };

    const handleRemoveItem = (id: number) => {
        setPicaItems(prev => prev.filter(item => item.id !== id));
    };

    const goToStep = (step: number) => {
        if (step === 2 && !selectedCategory) {
            alert('Mohon pilih kategori terlebih dahulu');
            return;
        }
        if (step === 3 && picaItems.length === 0) {
            alert('Mohon tambahkan minimal 1 laporan PICA');
            return;
        }
        setCurrentStep(step);
    };

    const handleSubmitAll = async () => {
        if (!deadline) {
            alert('Mohon isi target penyelesaian!');
            return;
        }

        setLoading(true);
        try {
            const results = [];
            for (const item of picaItems) {
                const response = await fetch('/api/pica', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        category: selectedCategory,
                        title: item.title,
                        description: item.description,
                        location: item.location,
                        photos: item.photos,
                        deadline,
                        priority: item.priority,
                        userId: user?.id
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    results.push(data);
                }
            }

            if (results.length === picaItems.length) {
                alert(`${results.length} laporan PICA berhasil disimpan!`);

                // Clear storage
                localStorage.removeItem('pica_step');
                localStorage.removeItem('pica_category');
                localStorage.removeItem('pica_items');
                localStorage.removeItem('pica_nextId');
                localStorage.removeItem('pica_deadline');

                onNavigate('home');
            } else {
                alert(`Berhasil menyimpan ${results.length} dari ${picaItems.length} laporan`);
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan saat menyimpan laporan.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (confirm('Reset formulir PICA? Semua data akan dihapus.')) {
            localStorage.removeItem('pica_step');
            localStorage.removeItem('pica_category');
            localStorage.removeItem('pica_items');
            localStorage.removeItem('pica_nextId');
            localStorage.removeItem('pica_deadline');
            window.location.reload();
        }
    };

    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 py-3 bg-white/10">
            {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep === step
                            ? 'bg-white text-slate-800'
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

    const getPriorityColor = (p: string) => {
        const option = PRIORITY_OPTIONS.find(o => o.id === p);
        return option?.color || 'bg-slate-500';
    };

    const getPriorityName = (p: string) => {
        const option = PRIORITY_OPTIONS.find(o => o.id === p);
        return option?.name || p;
    };

    return (
        <div className="w-full min-h-screen bg-[#F3F6F8] font-sans pb-32 flex flex-col">
            <LoadingOverlay isLoading={loading} message="Menyimpan laporan PICA..." />

            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 pt-6 pb-2 px-4 sticky top-0 z-20 shadow-xl shrink-0">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => currentStep === 1 ? onNavigate('home') : setCurrentStep(currentStep - 1)}
                        className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-400" />
                            LAPORAN PICA
                        </h1>
                        <p className="text-slate-400 text-xs">
                            {currentStep === 1 && 'Langkah 1: Pilih Kategori'}
                            {currentStep === 2 && `Langkah 2: Tambah Laporan ${selectedCategory}`}
                            {currentStep === 3 && 'Langkah 3: Review & Simpan'}
                        </p>
                    </div>
                    {picaItems.length > 0 && (
                        <div className="bg-white/20 px-3 py-1 rounded-full">
                            <span className="text-white text-sm font-bold">{picaItems.length} Laporan</span>
                        </div>
                    )}
                </div>
                <StepIndicator />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">

                {/* STEP 1: Category Selection */}
                {currentStep === 1 && (
                    <div className="space-y-4 max-w-2xl mx-auto w-full animate-fade-in">
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <ClipboardList size={24} className="text-red-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 text-lg">Pilih Kategori</h2>
                                    <p className="text-slate-500 text-sm">Problem Identification & Corrective Action</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {PICA_CATEGORIES.map((category) => {
                                    const Icon = category.icon;
                                    const isSelected = selectedCategory === category.id;
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group ${isSelected
                                                    ? `${category.lightColor} border-current ${category.textColor} scale-[1.02] shadow-lg`
                                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${isSelected ? category.color : 'bg-slate-200'
                                                }`}>
                                                <Icon size={24} className={isSelected ? 'text-white' : 'text-slate-500'} />
                                            </div>
                                            <h3 className={`font-bold text-sm mb-1 ${isSelected ? category.textColor : 'text-slate-700'}`}>
                                                {category.name}
                                            </h3>
                                            <p className={`text-[10px] leading-tight ${isSelected ? 'opacity-80' : 'text-slate-400'}`}>
                                                {category.description}
                                            </p>
                                            {isSelected && (
                                                <div className={`absolute top-2 right-2 w-6 h-6 ${category.color} rounded-full flex items-center justify-center`}>
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleReset}
                                className="w-1/3 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-4 rounded-xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={20} />
                                Reset
                            </button>
                            <button
                                onClick={() => goToStep(2)}
                                disabled={!selectedCategory}
                                className="flex-1 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                Lanjut Tambah Laporan
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Add Items */}
                {currentStep === 2 && (
                    <div className="space-y-4 max-w-3xl mx-auto w-full animate-fade-in">
                        {/* Add New Item Form */}
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCategoryData?.lightColor || 'bg-red-100'}`}>
                                    {selectedCategoryData && <selectedCategoryData.icon size={20} className={selectedCategoryData.textColor} />}
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800">Tambah Laporan {selectedCategory}</h2>
                                    <p className="text-slate-500 text-xs">Laporan ke-{picaItems.length + 1}</p>
                                </div>
                                <span className="text-xs text-slate-400 ml-auto bg-slate-100 px-3 py-1 rounded-full">
                                    {picaItems.length}/20
                                </span>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">JUDUL MASALAH *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Contoh: Kebocoran Pipa Hydrant"
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">DESKRIPSI & KETERANGAN *</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Jelaskan detail masalah dan dampaknya..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Location */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                            <MapPin size={12} className="inline mr-1" />
                                            LOKASI
                                        </label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Contoh: Workshop Area B"
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                        />
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                            <Flag size={12} className="inline mr-1" />
                                            PRIORITAS
                                        </label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {PRIORITY_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setPriority(opt.id)}
                                                    className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${priority === opt.id
                                                            ? `${opt.color} text-white border-transparent`
                                                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {opt.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Photos */}
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Camera size={16} className="text-slate-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">BUKTI FOTO</span>
                                        <span className="text-[10px] text-slate-400 ml-auto">{itemPhotos.length}/5</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {itemPhotos.map((photo, idx) => (
                                            <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 group">
                                                <img src={photo} alt={`Preview ${idx + 1}`} className="w-full h-20 object-cover" />
                                                <button
                                                    onClick={() => setItemPhotos(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}

                                        {itemPhotos.length < 5 && (
                                            <div className={itemPhotos.length === 0 ? "col-span-3" : ""}>
                                                <PhotoCapture
                                                    key={itemPhotos.length}
                                                    label="AMBIL FOTO"
                                                    onPhotoCaptured={(base64) => {
                                                        if (base64) setItemPhotos(prev => [...prev, base64]);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAddItem}
                                disabled={!title || !description}
                                className={`w-full mt-4 font-bold py-3 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${selectedCategoryData
                                        ? `${selectedCategoryData.color} hover:opacity-90 text-white disabled:bg-slate-300`
                                        : 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-slate-300'
                                    }`}
                            >
                                <Plus size={18} />
                                Tambah ke Daftar
                            </button>
                        </div>

                        {/* Items List */}
                        {picaItems.length > 0 && (
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <ClipboardList size={16} className="text-blue-600" />
                                    </div>
                                    <h2 className="font-bold text-slate-700">Daftar Laporan ({picaItems.length}/20)</h2>
                                </div>

                                <div className="space-y-2">
                                    {picaItems.map((item, idx) => (
                                        <div key={item.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-3">
                                            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-800 text-sm truncate">{item.title}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold text-white ${getPriorityColor(item.priority)}`}>
                                                        {getPriorityName(item.priority)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                                                {item.location && (
                                                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                                        <MapPin size={10} />
                                                        {item.location}
                                                    </p>
                                                )}
                                                {item.photos.length > 0 && (
                                                    <p className="text-[10px] text-blue-500 flex items-center gap-1 mt-1">
                                                        <Camera size={10} />
                                                        {item.photos.length} foto
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
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
                                disabled={picaItems.length === 0}
                                className="flex-1 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Lanjut Review
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Review & Submit */}
                {currentStep === 3 && (
                    <div className="space-y-4 max-w-3xl mx-auto w-full animate-fade-in">
                        {/* Summary */}
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedCategoryData?.lightColor || 'bg-slate-100'}`}>
                                    {selectedCategoryData && <selectedCategoryData.icon size={24} className={selectedCategoryData.textColor} />}
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 text-lg">Review Laporan PICA</h2>
                                    <p className="text-slate-500 text-sm">Kategori: {selectedCategory}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500 text-xs">Kategori</span>
                                        <p className="font-bold text-slate-800">{selectedCategory}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-xs">Jumlah Laporan</span>
                                        <p className="font-bold text-slate-800">{picaItems.length} Laporan</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-xs">Total Foto</span>
                                        <p className="font-bold text-slate-800">{picaItems.reduce((sum, item) => sum + item.photos.length, 0)} Foto</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-xs">Prioritas Tinggi/Kritis</span>
                                        <p className="font-bold text-red-600">
                                            {picaItems.filter(i => i.priority === 'HIGH' || i.priority === 'CRITICAL').length} Laporan
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Preview */}
                            <div className="overflow-x-auto mb-4">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="px-2 py-2 text-left font-bold text-slate-700">NO</th>
                                            <th className="px-2 py-2 text-left font-bold text-slate-700">Judul</th>
                                            <th className="px-2 py-2 text-left font-bold text-slate-700">Lokasi</th>
                                            <th className="px-2 py-2 text-center font-bold text-slate-700">Prioritas</th>
                                            <th className="px-2 py-2 text-center font-bold text-slate-700">Foto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {picaItems.map((item, idx) => (
                                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="px-2 py-2 font-medium">{idx + 1}</td>
                                                <td className="px-2 py-2">{item.title}</td>
                                                <td className="px-2 py-2 text-slate-500">{item.location || '-'}</td>
                                                <td className="px-2 py-2 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold text-white ${getPriorityColor(item.priority)}`}>
                                                        {getPriorityName(item.priority)}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-2 text-center">{item.photos.length}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Calendar size={24} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800 text-lg">Target Penyelesaian</h2>
                                    <p className="text-slate-500 text-sm">Tentukan deadline untuk semua laporan</p>
                                </div>
                            </div>

                            <input
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
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
                                disabled={!deadline}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Simpan {picaItems.length} Laporan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
