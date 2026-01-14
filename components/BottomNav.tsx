import React from 'react';
import { Home, ClipboardList, Bot, History, User } from 'lucide-react';
import { ScreenName, NavItem } from '../types';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'inspection', label: 'Inspeksi', icon: ClipboardList, badge: '2' },
    { id: 'chat', label: 'Chat AI', icon: Bot, badge: true },
    { id: 'history', label: 'Riwayat', icon: History, badge: true },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full pb-safe z-50 pointer-events-none">
      {/* Gradient fade to hide content scrolling behind */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>

      <div className="flex justify-center pb-4 px-4 pointer-events-auto">
        <div className="glass shadow-float rounded-[32px] px-2 py-2 flex justify-between items-center w-full max-w-sm border border-white/50">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 group ${isActive ? 'bg-app-primary text-white shadow-lg shadow-blue-500/30 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {item.badge && !isActive && (
                  <span className={`absolute top-3 right-3 flex items-center justify-center ${typeof item.badge === 'string' ? 'bg-red-500 min-w-[16px] h-[16px] px-1 text-[10px]' : 'bg-red-500 w-[8px] h-[8px]'} rounded-full text-white border-2 border-white z-10`}>
                    {typeof item.badge === 'string' ? item.badge : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};