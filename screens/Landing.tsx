import React from 'react';
import { Wifi, WifiOff, ExternalLink, ChevronRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ScreenName } from '../types';

interface LandingProps {
  onNavigate: (screen: ScreenName) => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const isOnline = navigator.onLine;
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onNavigate('login');
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col items-center justify-between p-8 relative overflow-hidden bg-[#F3F6F8] font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm text-center relative z-10 pt-10">
        {/* Modern Logo Container */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-[40px] blur-xl group-hover:blur-2xl transition-all duration-700"></div>
          <div className="w-40 h-40 bg-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-emerald-500/10 border border-white/50 relative z-10 group-hover:scale-105 transition-transform duration-500 p-6">
            <img src="/ert-logo.png" alt="ERT Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          {/* Animated Ring */}
          <div className="absolute -inset-2 border border-emerald-500/20 rounded-[48px] animate-spin-slow z-0"></div>
        </div>

        <h1 className="text-5xl font-black text-slate-800 mb-4 tracking-tighter drop-shadow-sm">
          ERT <span className="text-emerald-500">PPA</span>
        </h1>

        <p className="text-slate-500 text-lg mb-12 font-medium leading-relaxed max-w-[280px]">
          Platform digital inspeksi & manajemen alat safety terintegrasi.
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={handleLogin}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-[24px] shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            Masuk Sekarang
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => alert("Membuka panduan...")}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-[24px] shadow-lg shadow-slate-200/50 border border-slate-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            Panduan Pengguna
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col items-center gap-4 w-full mt-auto relative z-10">
        {/* System Status Pill */}
        <div className={`py-2 px-4 rounded-full border shadow-sm flex items-center gap-2 transition-colors ${isOnline
          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
          : 'bg-amber-50 border-amber-100 text-amber-600'
          }`}>
          {isOnline ? (
            <><Wifi size={14} className="text-emerald-500" /> <span className="text-xs font-bold">System Online</span></>
          ) : (
            <><WifiOff size={14} className="text-amber-500" /> <span className="text-xs font-bold">Offline Mode</span></>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-default">
          <img src="/ppa-logo.png" alt="PPA Logo" className="h-6 w-auto grayscale" />
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">PT. Putra Perkasa Abadi</span>
        </div>
      </div>
    </div>
  );
};