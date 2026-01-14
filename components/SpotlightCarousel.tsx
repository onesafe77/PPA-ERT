import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, ChevronRight, Sparkles } from 'lucide-react';
import { ScreenName } from '../types';

interface SpotlightCarouselProps {
    onNavigate?: (screen: ScreenName) => void;
}

interface SpotlightItem {
    id: string;
    tag: string;
    tagColor: string;
    expiry: string;
    title: string;
    description: string;
    progress: number;
    ctaPrimary: string;
    ctaSecondary: string;
    action?: ScreenName;
    theme: {
        gradient: string;
        shadow: string;
        accent: string;
        buttonText: string;
        buttonBgHover: string;
    };
}

const SPOTLIGHT_ITEMS: SpotlightItem[] = [
    {
        id: '1',
        tag: 'Spotlight',
        tagColor: 'text-emerald-100 bg-emerald-500/20 border border-emerald-500/30',
        expiry: 'Ends in 2d',
        title: 'Zero Defect P2H',
        description: 'Target: 100% unit ready minggu ini.',
        progress: 85,
        ctaPrimary: 'Mulai P2H',
        ctaSecondary: 'Detail',
        action: 'p2h-form' as ScreenName,
        theme: {
            gradient: 'from-emerald-900 to-emerald-800',
            shadow: 'shadow-emerald-500/20',
            accent: 'bg-emerald-400',
            buttonText: 'text-emerald-900',
            buttonBgHover: 'hover:bg-emerald-50',
        }
    },
    {
        id: '2',
        tag: 'Safety',
        tagColor: 'text-blue-100 bg-blue-500/20 border border-blue-500/30',
        expiry: 'Daily Focus',
        title: 'APD Lengkap',
        description: 'Pastikan helm dan rompi terpasang.',
        progress: 60,
        ctaPrimary: 'Cek APD',
        ctaSecondary: 'Lapor',
        action: 'inspection' as ScreenName,
        theme: {
            gradient: 'from-blue-900 to-indigo-900',
            shadow: 'shadow-blue-500/20',
            accent: 'bg-blue-400',
            buttonText: 'text-blue-900',
            buttonBgHover: 'hover:bg-blue-50',
        }
    },
    {
        id: '3',
        tag: 'Event',
        tagColor: 'text-purple-100 bg-purple-500/20 border border-purple-500/30',
        expiry: 'Live Now',
        title: 'Townhall Safety',
        description: 'Diskusi bulanan via Zoom.',
        progress: 0,
        ctaPrimary: 'Join Zoom',
        ctaSecondary: 'Agenda',
        theme: {
            gradient: 'from-purple-900 to-fuchsia-900',
            shadow: 'shadow-purple-500/20',
            accent: 'bg-purple-400',
            buttonText: 'text-purple-900',
            buttonBgHover: 'hover:bg-purple-50',
        }
    },
    {
        id: '4',
        tag: 'Urgent',
        tagColor: 'text-amber-100 bg-amber-500/20 border border-amber-500/30',
        expiry: 'Priority',
        title: 'Siaga Cuaca',
        description: 'Hujan deras diprediksi sore ini.',
        progress: 100, // Full bar for alert
        ctaPrimary: 'Protokol',
        ctaSecondary: 'Dismiss',
        theme: {
            gradient: 'from-orange-900 to-red-900',
            shadow: 'shadow-orange-500/20',
            accent: 'bg-orange-400',
            buttonText: 'text-orange-900',
            buttonBgHover: 'hover:bg-orange-50',
        }
    }
];

export const SpotlightCarousel: React.FC<SpotlightCarouselProps> = ({ onNavigate }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Auto-slide logic
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 5000); // 5 seconds per slide

        return () => clearInterval(interval);
    }, [currentIndex, isPaused]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % SPOTLIGHT_ITEMS.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + SPOTLIGHT_ITEMS.length) % SPOTLIGHT_ITEMS.length);
    };

    // Touch handling for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        setIsPaused(true); // Pause while touching
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        setIsPaused(false);
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        if (distance > 50) {
            nextSlide();
        } else if (distance < -50) {
            prevSlide();
        }

        // Reset
        touchStartX.current = 0;
        touchEndX.current = 0;
    };

    const item = SPOTLIGHT_ITEMS[currentIndex];

    return (
        <div
            className={`relative overflow-hidden rounded-[40px] p-1 group cursor-pointer shadow-2xl transition-all duration-500 bg-gradient-to-br ${item.theme.gradient}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Glass Border Container */}
            <div className="relative rounded-[39px] overflow-hidden bg-slate-900/40 backdrop-blur-md p-6 h-full border border-white/10">

                {/* Background Decor */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-60 ${item.theme.accent.replace('bg-', 'bg-')}/50 transition-all duration-700`}></div>
                <div className={`absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-[80px] opacity-40 ${item.theme.accent.replace('bg-', 'bg-')}/30 transition-all duration-700`}></div>

                {/* Content */}
                <div className="relative z-10 font-sans">
                    <div className="flex justify-between items-start mb-8">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md ${item.tagColor}`}>
                            <Sparkles size={12} className="fill-current" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{item.tag}</span>
                        </div>
                        <span className="text-xs font-bold text-white/80 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">{item.expiry}</span>
                    </div>

                    <div className="space-y-3 mb-8">
                        <h3 className="text-3xl font-black text-white leading-tight tracking-tight drop-shadow-lg transition-all duration-300">
                            {item.title}
                        </h3>
                        <p className="text-white/80 text-sm font-medium leading-relaxed max-w-[85%]">
                            {item.description}
                        </p>
                    </div>

                    {/* Progress Bar (conditional) */}
                    {item.progress > 0 && (
                        <div className="w-full bg-white/10 rounded-full h-1.5 mb-8 backdrop-blur-sm overflow-hidden">
                            <div
                                className={`h-full rounded-full shadow-[0_0_15px_currentColor] transition-all duration-1000 ease-out ${item.theme.accent}`}
                                style={{ width: `${item.progress}%` }}
                            />
                        </div>
                    )}

                    <div className="flex gap-3 mt-auto">
                        <button
                            onClick={() => item.action && onNavigate && onNavigate(item.action)}
                            className="flex-1 bg-white text-slate-900 font-bold py-3.5 rounded-2xl text-sm hover:bg-slate-50 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group/btn"
                        >
                            {item.ctaPrimary}
                            <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => alert('Fitur ini sedang dalam pengembangan')}
                            className="px-6 py-3.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-sm font-bold text-white hover:bg-white/10 transition-colors active:scale-95"
                        >
                            {item.ctaSecondary}
                        </button>
                    </div>
                </div>

                {/* Carousel Indicators - Modern Bars */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-1.5 z-20">
                    {SPOTLIGHT_ITEMS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx);
                            }}
                            className={`w-1.5 rounded-full transition-all duration-500 ${idx === currentIndex
                                ? `h-8 ${item.theme.accent} shadow-[0_0_10px_currentColor]`
                                : 'h-2 bg-white/20 hover:bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
