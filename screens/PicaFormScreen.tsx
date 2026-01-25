import React, { useState } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { ArrowLeft, Camera, Calendar, AlertCircle, Save, X, Trash2 } from 'lucide-react';
import { ScreenName } from '../types';

interface PicaFormScreenProps {
    onNavigate: (screen: ScreenName) => void;
    user: any;
}

export const PicaFormScreen: React.FC<PicaFormScreenProps> = ({ onNavigate, user }) => {
    const [title, setTitle] = useLocalStorage('pica_title', '');
    const [description, setDescription] = useLocalStorage('pica_description', '');
    const [deadline, setDeadline] = useLocalStorage('pica_deadline', '');
    const [image, setImage] = useLocalStorage<string | null>('pica_image', null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !deadline) {
            alert('Mohon lengkapi semua field wajib!');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/pica', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    imageData: image,
                    deadline,
                    userId: user?.id
                })
            });

            if (response.ok) {
                alert('Laporan PICA berhasil dibuat!');

                // Clear storage
                localStorage.removeItem('pica_title');
                localStorage.removeItem('pica_description');
                localStorage.removeItem('pica_deadline');
                localStorage.removeItem('pica_image');

                onNavigate('home');
            } else {
                throw new Error('Gagal submit');
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan saat menyimpan laporan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-32 animate-fade-in flex flex-col h-full bg-[#F3F6F8] font-sans">
            {/* Header */}
            <div className="bg-slate-900 pt-8 pb-6 px-6 rounded-b-[40px] shadow-2xl z-10 sticky top-0">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight">Formulir PICA</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
                <p className="text-slate-400 text-sm text-center">Problem Identification & Corrective Action</p>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* 1. Detail Masalah */}
                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="text-red-500" size={20} />
                        <h3 className="font-bold text-slate-800">Detail Masalah</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Masalah</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Contoh: Kebocoran Pipa Hydrant"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi & Keterangan</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Jelaskan detail masalah, lokasi, dan dampak..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Bukti Foto */}
                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Camera className="text-blue-500" size={20} />
                        <h3 className="font-bold text-slate-800">Bukti Foto</h3>
                    </div>

                    {image ? (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200">
                            <img src={image} alt="Preview" className="w-full h-48 object-cover" />
                            <button
                                onClick={() => setImage(null)}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                            <Camera size={32} className="text-slate-400 mb-2" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tap to Upload</span>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                    )}
                </div>

                {/* 3. Target Penyelesaian */}
                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-emerald-500" size={20} />
                        <h3 className="font-bold text-slate-800">Target Penyelesaian</h3>
                    </div>

                    <input
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (confirm('Reset formulir PICA? Data akan dihapus.')) {
                                localStorage.removeItem('pica_title');
                                localStorage.removeItem('pica_description');
                                localStorage.removeItem('pica_deadline');
                                localStorage.removeItem('pica_image');
                                window.location.reload();
                            }
                        }}
                        className="w-1/3 py-4 bg-red-100 text-red-600 rounded-[20px] font-bold text-lg shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-[20px] font-bold text-lg shadow-xl shadow-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <span>Menyimpan...</span>
                        ) : (
                            <>
                                <Save size={20} />
                                Simpan Laporan PICA
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
