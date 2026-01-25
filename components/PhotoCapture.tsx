import React, { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';

interface PhotoCaptureProps {
    label?: string;
    onPhotoCaptured: (base64: string) => void;
    initialImage?: string;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
    label = "Ambil Foto",
    onPhotoCaptured,
    initialImage = ''
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string>(initialImage);

    React.useEffect(() => {
        setPreview(initialImage);
    }, [initialImage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreview(base64String);
                onPhotoCaptured(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClear = () => {
        setPreview('');
        onPhotoCaptured('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerCamera = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            {label && <label className="text-xs font-bold text-slate-500 uppercase block mb-2">{label}</label>}

            {!preview ? (
                <button
                    onClick={triggerCamera}
                    className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-[0.98]"
                >
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <Camera size={20} />
                    </div>
                    <span className="text-xs font-bold">Ambil / Upload Foto</span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </button>
            ) : (
                <div className="relative w-full h-48 bg-slate-900 rounded-xl overflow-hidden group">
                    <img
                        src={preview}
                        alt="Captured"
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            onClick={handleClear}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-red-600 transition-colors"
                        >
                            <X size={16} />
                            Hapus Foto
                        </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                        PREVIEW
                    </div>
                </div>
            )}
        </div>
    );
};
