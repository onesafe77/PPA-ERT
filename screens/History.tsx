import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreHorizontal, Clock, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { generateP2HPDF } from '../utils/pdfGenerator';

interface Inspection {
  id: number;
  type: 'P2H' | 'APAR' | 'HYDRANT';
  // P2H fields
  unitNumber?: string;
  vehicleType?: string;
  operatorName?: string;
  shift?: string;
  // Common fields
  location: string;
  checklistData: string;
  notes: string;
  status?: string;
  // APAR fields
  capacity?: string;
  tagNumber?: string;
  condition?: string;
  pic?: string;
  // Date fields
  date?: string;
  createdAt: string;
}

export const HistoryScreen: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      // Fetch all inspection types - handle each independently
      const fetchWithFallback = async (url: string) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return [];
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        } catch {
          return [];
        }
      };

      const [p2hData, aparData, hydrantData] = await Promise.all([
        fetchWithFallback('/api/p2h'),
        fetchWithFallback('/api/apar'),
        fetchWithFallback('/api/hydrant')
      ]);

      // Combine and add type field
      const combined: Inspection[] = [
        ...p2hData.map((item: any) => ({ ...item, type: 'P2H' as const })),
        ...aparData.map((item: any) => ({ ...item, type: 'APAR' as const })),
        ...hydrantData.map((item: any) => ({ ...item, type: 'HYDRANT' as const }))
      ];

      // Sort by id (newest first) - more reliable than dates
      combined.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        if (dateA === dateB || (isNaN(dateA) && isNaN(dateB))) {
          return b.id - a.id;
        }
        return dateB - dateA;
      });

      setInspections(combined);
    } catch (err) {
      console.error('Failed to fetch inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (inspection: Inspection) => {
    if (inspection.type === 'P2H') {
      await generateP2HPDF(inspection as any);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-500';
      case 'NOT_READY': return 'bg-red-500';
      default: return 'bg-amber-500';
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200">APPROVED</span>;
      case 'NOT_READY':
        return <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-100 text-red-600 border border-red-200">NOT READY</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-600 border border-amber-200">PENDING</span>;
    }
  };

  return (
    <div className="pb-32 md:pb-8 animate-fade-in flex flex-col h-full bg-[#F3F6F8] font-sans overflow-y-auto">
      {/* Heavy Neon Header */}
      <div className="relative bg-slate-900 pt-8 pb-10 px-6 rounded-b-[40px] shadow-2xl z-10 overflow-hidden shrink-0">
        {/* Background Effects */}
        <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px]" />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          {/* Modern Search & Filter */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center px-4 h-[52px] shadow-lg">
              <Search size={20} className="text-slate-400 mr-3" />
              <input
                type="text"
                placeholder="Cari No. Unit atau Operator..."
                className="bg-transparent border-none text-white placeholder-slate-400 text-sm w-full focus:ring-0 p-0"
              />
            </div>
            <button className="w-[52px] h-[52px] bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform border border-indigo-400">
              <Filter size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Stats Summary */}
        <div className="px-6 -mt-6 relative z-20 grid grid-cols-3 gap-3 mb-2">
          <div className="bg-white p-3 rounded-[20px] shadow-sm border border-slate-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-slate-800">{inspections.length}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-[20px] shadow-sm border border-emerald-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-emerald-600">{inspections.filter(i => i.status === 'APPROVED').length}</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Approved</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-[20px] shadow-sm border border-amber-100 flex flex-col items-center">
            <span className="text-2xl font-bold text-amber-500">{inspections.filter(i => i.status === 'PENDING').length}</span>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Pending</span>
          </div>
        </div>

        {/* Timeline List */}
        <div className="p-6 pt-2 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-1">Inspeksi Terbaru</h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={32} className="text-indigo-500 animate-spin" />
              <span className="text-slate-400 font-medium">Memuat data...</span>
            </div>
          ) : inspections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[28px] border-2 border-dashed border-slate-200">
              <FileText size={48} className="text-slate-300" />
              <span className="text-slate-400 font-medium">Belum ada data inspeksi.</span>
              <span className="text-slate-300 text-sm">Mulai inspeksi pertama Anda!</span>
            </div>
          ) : (
            <div className="relative ml-4 md:ml-0 space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 pb-4">
              {inspections.map((item) => (
                <div key={`${item.type}-${item.id}`} className="relative pl-8 md:pl-0 group cursor-pointer">
                  {/* Timeline Dot (Mobile Only) */}
                  <div className={`md:hidden absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125 ${getStatusColor(item.status || 'PENDING')}`}></div>

                  {/* Card Content */}
                  <div className="bg-white rounded-[24px] p-5 shadow-sm group-hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 items-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.type === 'P2H' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          item.type === 'APAR' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-cyan-50 text-cyan-600 border-cyan-100'
                          }`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          #{item.id}
                        </span>
                      </div>
                      {item.type === 'P2H' && (
                        <button
                          onClick={() => handleDownloadPDF(item)}
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-800 text-sm leading-snug mb-1 group-hover:text-indigo-600 transition-colors">
                      {item.type === 'P2H' && `${item.unitNumber} - ${item.vehicleType}`}
                      {item.type === 'APAR' && `APAR ${item.tagNumber || item.unitNumber || ''} - ${item.capacity || ''}`}
                      {item.type === 'HYDRANT' && `Hydrant - ${item.location}`}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      {item.type === 'P2H' && `Operator: ${item.operatorName || '-'}`}
                      {item.type === 'APAR' && `PIC: ${item.pic || '-'} | Kondisi: ${item.condition || '-'}`}
                      {item.type === 'HYDRANT' && `PIC: ${item.pic || '-'} | Shift: ${item.shift || '-'}`}
                    </p>

                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                          <Clock size={12} /> {formatDate(item.date || item.createdAt)}
                        </span>
                        {item.location && item.type === 'P2H' && (
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-500" /> {item.location}
                          </span>
                        )}
                      </div>
                      {item.status && getStatusPill(item.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};