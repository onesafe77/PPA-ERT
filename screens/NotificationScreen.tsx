import React from 'react';
import { ArrowLeft, Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ScreenName } from '../types';

interface NotificationScreenProps {
    onNavigate: (screen: ScreenName) => void;
}

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: 'Jadwal P2H Pagi',
        message: 'Jangan lupa isi form P2H unit Fire Truck 01 sebelum jam 08:00.',
        time: 'Baru saja',
        type: 'info',
        read: false
    },
    {
        id: 2,
        title: 'Unit NOT READY',
        message: 'Laporan P2H Ambulance 02 ditandai sebagai Critical.',
        time: '2 jam lalu',
        type: 'alert',
        read: false
    },
    {
        id: 3,
        title: 'Inspection Approved',
        message: 'Inspeksi Gear Set A telah disetujui oleh Supervisor.',
        time: 'Kemarin',
        type: 'success',
        read: true
    }
];

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onNavigate }) => {
    return (
        <div className="h-full bg-[#F3F6F8] flex flex-col font-sans animate-fade-in">
            {/* Header */}
            <div className="bg-slate-900 pt-8 pb-10 px-6 rounded-b-[40px] shadow-2xl relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[url('/neon-bg.png')] bg-cover bg-center opacity-30 mix-blend-overlay" />

                <div className="relative z-10 flex items-center justify-between">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-white tracking-tight">Notifikasi</h1>
                    <div className="w-10" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 -mt-4 pt-6 space-y-4 relative z-0">
                {MOCK_NOTIFICATIONS.map((notif) => (
                    <div key={notif.id} className={`bg-white p-4 rounded-[24px] shadow-sm border ${notif.read ? 'border-slate-100 opacity-70' : 'border-emerald-100/50 shadow-emerald-100'} relative overflow-hidden`}>
                        <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                ${notif.type === 'alert' ? 'bg-red-50 text-red-500' :
                                    notif.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                                        'bg-blue-50 text-blue-500'}`}
                            >
                                {notif.type === 'alert' ? <AlertTriangle size={20} /> :
                                    notif.type === 'success' ? <CheckCircle size={20} /> :
                                        <Info size={20} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`text-sm font-bold ${notif.read ? 'text-slate-600' : 'text-slate-800'}`}>{notif.title}</h3>
                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                        <Clock size={10} /> {notif.time}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.message}</p>
                            </div>
                        </div>
                        {!notif.read && (
                            <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full shadow-sm ring-2 ring-white" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
