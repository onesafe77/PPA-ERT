import React from 'react';
import { Home, ClipboardCheck, History, Calendar, MessageSquare, User, LogOut } from 'lucide-react';
import { ScreenName } from '../types';

interface DesktopSidebarProps {
    currentScreen: ScreenName;
    onNavigate: (screen: ScreenName) => void;
    user?: any;
    onLogout: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentScreen, onNavigate, user, onLogout }) => {
    const menuItems = [
        { id: 'home' as ScreenName, icon: Home, label: 'Beranda' },
        { id: 'inspection' as ScreenName, icon: ClipboardCheck, label: 'Inspeksi' },
        { id: 'history' as ScreenName, icon: History, label: 'Riwayat' },
        { id: 'schedule' as ScreenName, icon: Calendar, label: 'Jadwal' },
        { id: 'chat' as ScreenName, icon: MessageSquare, label: 'AI Chat' },
    ];

    return (
        <div className="hidden md:flex md:flex-col w-64 bg-slate-900 h-screen fixed left-0 top-0 z-50">
            {/* Logo & User Section */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        E
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg">ERT PPA</h1>
                        <p className="text-slate-400 text-xs">Safety System</p>
                    </div>
                </div>

                {user && (
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <User size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-bold truncate">{user.name}</p>
                                <p className="text-slate-400 text-xs truncate">{user.employeeId}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentScreen === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-bold text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={20} />
                    <span className="font-bold text-sm">Keluar</span>
                </button>
            </div>
        </div>
    );
};
