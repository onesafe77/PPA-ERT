import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Check, X, Plus, Trash2, Download, ChevronDown, ChevronRight, Save, AlertTriangle, Heart, Mountain, Car, Waves, TreePine, HardHat, Flame, Package, ClipboardCheck, Calendar, MapPin, User, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ScreenName } from '../types';
import { MASTER_EQUIPMENT, EQUIPMENT_CATEGORIES, Equipment, getEquipmentByCategory, getUniqueEquipmentNames, getUniqueBrands } from '../data/equipmentData';
import { useLocalStorage } from '../utils/useLocalStorage';
import { LoadingOverlay } from '../components/LoadingOverlay';

interface EquipmentInspectionScreenProps {
    onNavigate: (screen: ScreenName) => void;
}

interface InspectionItem {
    id: number;
    equipmentId: string;
    name: string;
    tagNumber: string;
    brand: string;
    category: string;
    location: string;
    condition: 'LAYAK' | 'TIDAK_LAYAK' | null;
    notes: string;
}

export const EquipmentInspectionScreen: React.FC<EquipmentInspectionScreenProps> = ({ onNavigate }) => {
    // State
    const [step, setStep] = useLocalStorage<number>('equip_step', 1);
    const [selectedCategory, setSelectedCategory] = useLocalStorage<string>('equip_category', '');
    const [inspectionItems, setInspectionItems] = useLocalStorage<InspectionItem[]>('equip_items', []);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [inspectorName, setInspectorName] = useLocalStorage<string>('equip_inspector', '');
    const [approverName, setApproverName] = useLocalStorage<string>('equip_approver', '');
    const [inspectionLocation, setInspectionLocation] = useLocalStorage<string>('equip_location', '7014');
    const [inspectionPeriod, setInspectionPeriod] = useLocalStorage<string>('equip_period',
        new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    // New equipment form state
    const [newEquipment, setNewEquipment] = useState({
        name: '',
        tagNumber: '',
        brand: '',
        category: '',
        location: '7014'
    });

    const getCategoryIcon = (categoryId: string) => {
        switch (categoryId) {
            case 'FIRST AID/MFR': return <Heart size={20} />;
            case 'HART': return <Mountain size={20} />;
            case 'RAR': return <Car size={20} />;
            case 'WATER RESCUE': return <Waves size={20} />;
            case 'JUNGLE RESCUE': return <TreePine size={20} />;
            case 'CSSR': return <HardHat size={20} />;
            case 'FIRE': return <Flame size={20} />;
            default: return <Package size={20} />;
        }
    };

    const handleSelectCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        // Load equipment for this category
        const categoryEquipment = getEquipmentByCategory(categoryId);
        const items: InspectionItem[] = categoryEquipment.map((eq, idx) => ({
            id: idx + 1,
            equipmentId: eq.id,
            name: eq.name,
            tagNumber: eq.tagNumber,
            brand: eq.brand,
            category: eq.category,
            location: eq.location,
            condition: null,
            notes: ''
        }));
        setInspectionItems(items);
        setStep(2);
    };

    const handleLoadAllEquipment = () => {
        setSelectedCategory('ALL');
        const items: InspectionItem[] = MASTER_EQUIPMENT.map((eq, idx) => ({
            id: idx + 1,
            equipmentId: eq.id,
            name: eq.name,
            tagNumber: eq.tagNumber,
            brand: eq.brand,
            category: eq.category,
            location: eq.location,
            condition: null,
            notes: ''
        }));
        setInspectionItems(items);
        setStep(2);
    };

    const handleConditionChange = (itemId: number, condition: 'LAYAK' | 'TIDAK_LAYAK') => {
        setInspectionItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, condition } : item
        ));
    };

    const handleNotesChange = (itemId: number, notes: string) => {
        setInspectionItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, notes } : item
        ));
    };

    const handleAddNewEquipment = () => {
        if (!newEquipment.name || !newEquipment.tagNumber) {
            alert('Nama dan No. Lambung harus diisi!');
            return;
        }
        const newItem: InspectionItem = {
            id: inspectionItems.length + 1,
            equipmentId: `custom_${Date.now()}`,
            name: newEquipment.name,
            tagNumber: newEquipment.tagNumber,
            brand: newEquipment.brand || '-',
            category: newEquipment.category || selectedCategory,
            location: newEquipment.location,
            condition: null,
            notes: ''
        };
        setInspectionItems(prev => [...prev, newItem]);
        setNewEquipment({ name: '', tagNumber: '', brand: '', category: '', location: '7014' });
        setShowAddModal(false);
    };

    const handleRemoveItem = (itemId: number) => {
        setInspectionItems(prev => prev.filter(item => item.id !== itemId));
    };

    const toggleCategoryExpand = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleSubmit = async () => {
        if (!inspectorName) {
            alert('Nama Pemeriksa harus diisi!');
            return;
        }

        const incompleteItems = inspectionItems.filter(item => item.condition === null);
        if (incompleteItems.length > 0) {
            alert(`Masih ada ${incompleteItems.length} peralatan yang belum diperiksa!`);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                location: inspectionLocation,
                period: inspectionPeriod,
                inspectorName,
                approverName,
                category: selectedCategory,
                items: inspectionItems.map(item => ({
                    name: item.name,
                    tagNumber: item.tagNumber,
                    brand: item.brand,
                    category: item.category,
                    condition: item.condition,
                    notes: item.notes
                }))
            };

            const res = await fetch('/api/equipment-inspection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Reset form
                localStorage.removeItem('equip_step');
                localStorage.removeItem('equip_category');
                localStorage.removeItem('equip_items');
                localStorage.removeItem('equip_inspector');
                localStorage.removeItem('equip_approver');
                alert('Inspeksi peralatan berhasil disimpan!');
                onNavigate('home');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving inspection:', error);
            alert('Gagal menyimpan inspeksi. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (confirm('Yakin ingin reset semua data inspeksi?')) {
            localStorage.removeItem('equip_step');
            localStorage.removeItem('equip_category');
            localStorage.removeItem('equip_items');
            localStorage.removeItem('equip_inspector');
            localStorage.removeItem('equip_approver');
            setStep(1);
            setSelectedCategory('');
            setInspectionItems([]);
            setInspectorName('');
            setApproverName('');
        }
    };

    // Filter items based on search
    const filteredItems = inspectionItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group items by category for display
    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, InspectionItem[]>);

    // Stats
    const totalItems = inspectionItems.length;
    const checkedItems = inspectionItems.filter(i => i.condition !== null).length;
    const layakCount = inspectionItems.filter(i => i.condition === 'LAYAK').length;
    const tidakLayakCount = inspectionItems.filter(i => i.condition === 'TIDAK_LAYAK').length;

    return (
        <div className="min-h-screen bg-[#F3F6F8] pb-32">
            {isSubmitting && <LoadingOverlay isLoading={true} message="Menyimpan inspeksi..." />}

            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 pt-8 pb-6 px-6 rounded-b-[32px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-24 -mb-24 blur-xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => step > 1 ? setStep(step - 1) : onNavigate('inspection')}
                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-white">Inspeksi Peralatan Emergency</h1>
                            <p className="text-white/70 text-sm">Form inspeksi bulanan peralatan ERT</p>
                        </div>
                        <button
                            onClick={handleReset}
                            className="px-3 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-xs font-bold hover:bg-white/30 transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mt-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-white text-indigo-600' : 'bg-white/30 text-white/70'
                                    }`}>
                                    {s}
                                </div>
                                {s < 3 && <div className={`w-8 h-1 mx-1 rounded-full ${step > s ? 'bg-white' : 'bg-white/30'}`}></div>}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-white/70 mt-2 px-1">
                        <span>Pilih Kategori</span>
                        <span>Inspeksi</span>
                        <span>Review</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 -mt-4 relative z-20">
                {/* Step 1: Select Category */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Package size={20} className="text-indigo-600" />
                                Pilih Kategori Peralatan
                            </h2>
                            <p className="text-sm text-slate-500 mb-4">
                                Pilih kategori peralatan yang akan diinspeksi atau pilih "Semua Peralatan" untuk inspeksi lengkap.
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {EQUIPMENT_CATEGORIES.map((cat) => {
                                    const count = getEquipmentByCategory(cat.id).length;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleSelectCategory(cat.id)}
                                            className="bg-slate-50 hover:bg-slate-100 rounded-xl p-4 text-left transition-all border-2 border-transparent hover:border-indigo-200 group"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2"
                                                style={{ backgroundColor: cat.color }}
                                            >
                                                {getCategoryIcon(cat.id)}
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-sm">{cat.name}</h3>
                                            <p className="text-[10px] text-slate-500 line-clamp-1">{cat.description}</p>
                                            <span className="text-[10px] font-bold text-indigo-600 mt-1 block">{count} item</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleLoadAllEquipment}
                                className="w-full mt-4 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
                            >
                                <ClipboardCheck size={20} />
                                Inspeksi Semua Peralatan ({MASTER_EQUIPMENT.length} item)
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Inspection */}
                {step === 2 && (
                    <div className="space-y-4">
                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="grid grid-cols-4 gap-2">
                                <div className="text-center p-2 bg-slate-50 rounded-xl">
                                    <p className="text-lg font-bold text-slate-800">{totalItems}</p>
                                    <p className="text-[10px] text-slate-500">Total</p>
                                </div>
                                <div className="text-center p-2 bg-blue-50 rounded-xl">
                                    <p className="text-lg font-bold text-blue-600">{checkedItems}</p>
                                    <p className="text-[10px] text-blue-500">Diperiksa</p>
                                </div>
                                <div className="text-center p-2 bg-emerald-50 rounded-xl">
                                    <p className="text-lg font-bold text-emerald-600">{layakCount}</p>
                                    <p className="text-[10px] text-emerald-500">Layak</p>
                                </div>
                                <div className="text-center p-2 bg-red-50 rounded-xl">
                                    <p className="text-lg font-bold text-red-600">{tidakLayakCount}</p>
                                    <p className="text-[10px] text-red-500">Tidak Layak</p>
                                </div>
                            </div>
                        </div>

                        {/* Search & Add */}
                        <div className="flex gap-2">
                            <div className="flex-1 bg-white rounded-xl px-4 py-3 flex items-center gap-2 shadow-sm border border-slate-100">
                                <Search size={18} className="text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari peralatan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 text-sm bg-transparent border-none focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Equipment List by Category */}
                        <div className="space-y-3">
                            {Object.entries(groupedItems).map(([category, items]) => {
                                const catInfo = EQUIPMENT_CATEGORIES.find(c => c.id === category);
                                const isExpanded = expandedCategories.includes(category);

                                return (
                                    <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                        {/* Category Header */}
                                        <button
                                            onClick={() => toggleCategoryExpand(category)}
                                            className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                                    style={{ backgroundColor: catInfo?.color || '#6366f1' }}
                                                >
                                                    {getCategoryIcon(category)}
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-bold text-slate-800 text-sm">{catInfo?.name || category}</h3>
                                                    <p className="text-[10px] text-slate-500">{items.length} item</p>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                                        </button>

                                        {/* Items */}
                                        {isExpanded && (
                                            <div className="divide-y divide-slate-100">
                                                {items.map((item) => (
                                                    <div key={item.id} className="p-4">
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{item.tagNumber}</span>
                                                                    <span className="text-[10px] text-slate-400">{item.brand}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>

                                                        {/* Condition Buttons */}
                                                        <div className="flex gap-2 mb-2">
                                                            <button
                                                                onClick={() => handleConditionChange(item.id, 'LAYAK')}
                                                                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${item.condition === 'LAYAK'
                                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                                                                    }`}
                                                            >
                                                                <CheckCircle2 size={14} />
                                                                LAYAK
                                                            </button>
                                                            <button
                                                                onClick={() => handleConditionChange(item.id, 'TIDAK_LAYAK')}
                                                                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${item.condition === 'TIDAK_LAYAK'
                                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-red-50'
                                                                    }`}
                                                            >
                                                                <XCircle size={14} />
                                                                TIDAK LAYAK
                                                            </button>
                                                        </div>

                                                        {/* Notes (only show if TIDAK_LAYAK) */}
                                                        {item.condition === 'TIDAK_LAYAK' && (
                                                            <input
                                                                type="text"
                                                                placeholder="Keterangan..."
                                                                value={item.notes}
                                                                onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                                                className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={() => setStep(3)}
                            disabled={checkedItems === 0}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Lanjut ke Review
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* Step 3: Review & Submit */}
                {step === 3 && (
                    <div className="space-y-4">
                        {/* Summary Card */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <ClipboardCheck size={20} className="text-indigo-600" />
                                Ringkasan Inspeksi
                            </h2>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-emerald-600">{layakCount}</p>
                                    <p className="text-xs text-emerald-600">Layak</p>
                                </div>
                                <div className="bg-red-50 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-red-600">{tidakLayakCount}</p>
                                    <p className="text-xs text-red-600">Tidak Layak</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1">
                                        <Calendar size={12} />
                                        Periode Inspeksi
                                    </label>
                                    <input
                                        type="text"
                                        value={inspectionPeriod}
                                        onChange={(e) => setInspectionPeriod(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1">
                                        <MapPin size={12} />
                                        Area/Lokasi
                                    </label>
                                    <input
                                        type="text"
                                        value={inspectionLocation}
                                        onChange={(e) => setInspectionLocation(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1">
                                        <User size={12} />
                                        Diperiksa Oleh *
                                    </label>
                                    <input
                                        type="text"
                                        value={inspectorName}
                                        onChange={(e) => setInspectorName(e.target.value)}
                                        placeholder="Nama pemeriksa..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1">
                                        <User size={12} />
                                        Diketahui Oleh
                                    </label>
                                    <input
                                        type="text"
                                        value={approverName}
                                        onChange={(e) => setApproverName(e.target.value)}
                                        placeholder="Nama atasan (opsional)..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Not Fit Items */}
                        {tidakLayakCount > 0 && (
                            <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                                <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                                    <AlertTriangle size={18} />
                                    Peralatan Tidak Layak ({tidakLayakCount})
                                </h3>
                                <div className="space-y-2">
                                    {inspectionItems.filter(i => i.condition === 'TIDAK_LAYAK').map((item) => (
                                        <div key={item.id} className="bg-white rounded-xl p-3 border border-red-200">
                                            <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                                            <p className="text-[10px] text-slate-500">{item.tagNumber} • {item.brand}</p>
                                            {item.notes && <p className="text-xs text-red-600 mt-1">Ket: {item.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !inspectorName}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Simpan Inspeksi
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Add Equipment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-800">Tambah Peralatan Baru</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full hover:bg-slate-100">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Peralatan *</label>
                                <input
                                    type="text"
                                    value={newEquipment.name}
                                    onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Contoh: CARABINER"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    list="equipment-names"
                                />
                                <datalist id="equipment-names">
                                    {getUniqueEquipmentNames().map(name => (
                                        <option key={name} value={name} />
                                    ))}
                                </datalist>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">No. Lambung *</label>
                                <input
                                    type="text"
                                    value={newEquipment.tagNumber}
                                    onChange={(e) => setNewEquipment(prev => ({ ...prev, tagNumber: e.target.value }))}
                                    placeholder="Contoh: CB.40"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Merk</label>
                                <input
                                    type="text"
                                    value={newEquipment.brand}
                                    onChange={(e) => setNewEquipment(prev => ({ ...prev, brand: e.target.value }))}
                                    placeholder="Contoh: PETZL"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    list="brand-names"
                                />
                                <datalist id="brand-names">
                                    {getUniqueBrands().map(brand => (
                                        <option key={brand} value={brand} />
                                    ))}
                                </datalist>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Kategori</label>
                                <select
                                    value={newEquipment.category}
                                    onChange={(e) => setNewEquipment(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                >
                                    <option value="">Pilih kategori</option>
                                    {EQUIPMENT_CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Lokasi</label>
                                <input
                                    type="text"
                                    value={newEquipment.location}
                                    onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="Contoh: 7014"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAddNewEquipment}
                            className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Tambah Peralatan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
