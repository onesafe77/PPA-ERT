import React from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    isLoading,
    message = "Memuat..."
}) => {
    if (!isLoading) return null;

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md transition-all duration-500 animate-in fade-in">
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <img src="/logo.png" alt="Loading..." className="w-24 h-24 object-contain relative z-10 animate-spin" />
            </div>
            <p className="mt-8 text-app-text-primary font-medium tracking-wide animate-pulse">{message}</p>
        </div>
    );
};
