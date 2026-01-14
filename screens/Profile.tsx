import React from 'react';
import { LogOut, Bell, Info, Shield, WifiOff, ChevronRight, User, Settings, Lock, HelpCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { ScreenName } from '../types';

interface ProfileProps {
  onNavigate: (screen: ScreenName) => void;
}

export const ProfileScreen: React.FC<ProfileProps & { user?: any }> = ({ onNavigate, user }) => {
  const settingsGroups = [
    {
      title: 'Akun & Keamanan',
      items: [
        { icon: User, label: 'Edit Profil', sub: 'Update foto & data diri' },
        { icon: Lock, label: 'Kata Sandi', sub: 'Ubah password' },
      ]
    },
    {
      title: 'Preferensi',
      items: [
        { icon: Bell, label: 'Notifikasi', sub: 'On', badge: 'Active' },
        { icon: WifiOff, label: 'Offline Sync', sub: 'Last sync: 10m ago' },
      ]
    },
    {
      title: 'Lainnya',
      items: [
        { icon: HelpCircle, label: 'Bantuan', sub: 'FAQ & Support' },
        { icon: Info, label: 'Tentang Aplikasi', sub: 'v3.0.1 Enterprise' },
      ]
    }
  ];

  return (
    <div
      className="pb-32 animate-fade-in h-full overflow-y-auto relative bg-[#F3F6F8]"
    >
      {/* Header Background with Neon Effect */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-slate-900 overflow-hidden rounded-b-[40px] z-0">
        <div className="absolute top-[-50%] left-[-20%] w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-[url('/neon-bg.png')] bg-cover bg-center opacity-30 mix-blend-overlay" />
      </div>

      <div className="relative z-10 p-6 pt-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>
          <button
            onClick={() => alert('Fitur Settings sedang dalam pengembangan')}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Modern Profile Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] mb-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-emerald-500/30" />

          <div className="flex items-center gap-6 relative z-10">
            <div className="relative">
              <div className="w-24 h-24 rounded-[30px] bg-gradient-to-br from-white to-slate-200 p-[2px] shadow-lg">
                <div className="w-full h-full rounded-[28px] bg-white flex items-center justify-center overflow-hidden">
                  {/* Avatar or Initials */}
                  <span className="text-3xl font-bold text-slate-800 bg-emerald-50 w-full h-full flex items-center justify-center">AR</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-slate-900 w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                <Shield size={14} className="text-white fill-current" />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">{user?.name || 'User'}</h2>
              <p className="text-sm text-emerald-100 font-medium mb-3">{user?.role === 'user' ? 'ERT Personnel' : (user?.role || 'Safety Officer')}</p>

              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-[10px] font-bold text-emerald-300 uppercase tracking-wide">
                  Certified
                </span>
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-lg text-[10px] font-bold text-blue-300 uppercase tracking-wide">
                  Lvl 4
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="text-center">
              <span className="block text-xl font-bold text-emerald-400">42</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Inspections</span>
            </div>
            <div className="text-center border-l border-white/10 border-r">
              <span className="block text-xl font-bold text-emerald-400">98%</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Compliance</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-emerald-400">12</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Reports</span>
            </div>
          </div>
        </div>

        {/* Menu Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">{group.title}</h3>
              <div className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-slate-100">
                {group.items.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => alert(`Fitur ${item.label} sedang dalam pengembangan`)}
                      className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group ${idx !== group.items.length - 1 ? 'border-b border-slate-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <Icon size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{item.label}</span>
                          <span className="text-xs text-slate-400 font-medium">{item.sub}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg">
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 mb-6">
          <Button
            variant="ghost"
            fullWidth
            className="text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 !h-14 !rounded-[24px] shadow-sm border border-red-100"
            icon={<LogOut size={18} />}
            onClick={() => onNavigate('landing')}
          >
            Keluar Akun
          </Button>
          <p className="text-center text-[10px] text-slate-400 mt-6 font-bold tracking-wide uppercase">
            ERT Gear System v3.0 // 2024
          </p>
        </div>
      </div>
    </div>
  );
};