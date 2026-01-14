import React, { useState } from 'react';
import { User, Lock, ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ScreenName } from '../types';

interface LoginProps {
  onNavigate: (screen: ScreenName) => void;
  onLoginSuccess: (user: any) => void;
}

// ... imports
import { AlertCircle } from 'lucide-react';

export const Login: React.FC<LoginProps> = ({ onNavigate, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Login success:', data.user);
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Login gagal.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Gagal terhubung ke server. Pastikan backend menyala.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col p-6 relative overflow-hidden bg-[#F3F6F8] font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />

      {/* Loading & Navigation */}
      <LoadingOverlay isLoading={loading} message="Mengautentikasi..." />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('landing')}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-lg hover:bg-slate-50 transition-all border border-slate-100 active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full -mt-10">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
              Welcome <br /> <span className="text-emerald-500">Back!</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium">Masuk untuk memulai aktivitas.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3 animate-fade-in">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <span className="text-red-600 text-sm font-bold">{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ID Pegawai</label>
                <div className="bg-transparent border-b-2 border-slate-200 flex items-center px-0 h-[56px] focus-within:border-emerald-500 transition-all">
                  <User size={20} className="text-slate-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Contoh: 123456"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="bg-transparent border-none text-slate-800 placeholder-slate-400 text-sm w-full focus:ring-0 p-0 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kata Sandi</label>
                <div className="bg-transparent border-b-2 border-slate-200 flex items-center px-0 h-[56px] focus-within:border-emerald-500 transition-all relative">
                  <Lock size={20} className="text-slate-400 mr-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-none text-slate-800 placeholder-slate-400 text-sm w-full focus:ring-0 p-0 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer font-bold select-none hover:text-slate-700 transition-colors">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:border-emerald-500 checked:bg-emerald-500 transition-all shadow-sm" />
                    <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity text-white" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  Ingat saya
                </label>
                <button type="button" className="text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors">
                  Lupa password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-[24px] shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <LogIn size={20} />
              Masuk Aplikasi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};