import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Clock, CheckCircle2, FileText, Loader2, X, ChevronRight, ListFilter, ArrowDownUp, AlertTriangle, MapPin, Calendar, Flag, Flame, Truck, Shield, Eye, Droplets, Wind } from 'lucide-react';
import { generateP2HPDF, generateAPARPDF, generateHydrantPDF } from '../utils/pdfGenerator';

interface Inspection {
  id: number;
  type: 'P2H' | 'APAR' | 'HYDRANT' | 'SMOKE_DETECTOR' | 'EYEWASH';
  unitNumber?: string;
  vehicleType?: string;
  operatorName?: string;
  shift?: string;
  location: string;
  checklistData: string;
  notes: string;
  status?: string;
  capacity?: string;
  tagNumber?: string;
  condition?: string;
  pic?: string;
  date?: string;
  createdAt: string;
  photo?: string;
  photos?: string;
}

interface PicaReport {
  id: number;
  category: string;
  title: string;
  description: string;
  location?: string;
  deadline?: string;
  status: string;
  priority: string;
  photos?: string;
  createdAt: string;
}

type ActiveTab = 'inspeksi' | 'pica';

export const HistoryScreen: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [picaReports, setPicaReports] = useState<PicaReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'P2H' | 'APAR' | 'HYDRANT' | 'SMOKE_DETECTOR' | 'EYEWASH'>('ALL');
  const [picaFilterCategory, setPicaFilterCategory] = useState<string>('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('inspeksi');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
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

      const [p2hData, aparData, hydrantData, smokeData, eyeWashData, picaData] = await Promise.all([
        fetchWithFallback('/api/p2h'),
        fetchWithFallback('/api/apar'),
        fetchWithFallback('/api/hydrant'),
        fetchWithFallback('/api/smoke-detector'),
        fetchWithFallback('/api/eyewash'),
        fetchWithFallback('/api/pica')
      ]);

      // Combine inspections
      const combined: Inspection[] = [
        ...p2hData.map((item: any) => ({ ...item, type: 'P2H' as const })),
        ...aparData.map((item: any) => ({ ...item, type: 'APAR' as const })),
        ...hydrantData.map((item: any) => ({ ...item, type: 'HYDRANT' as const })),
        ...smokeData.map((item: any) => ({ ...item, type: 'SMOKE_DETECTOR' as const })),
        ...eyeWashData.map((item: any) => ({ ...item, type: 'EYEWASH' as const }))
      ];

      combined.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        if (dateA === dateB || (isNaN(dateA) && isNaN(dateB))) {
          return b.id - a.id;
        }
        return dateB - dateA;
      });

      setInspections(combined);
      setPicaReports(picaData.sort((a: PicaReport, b: PicaReport) => b.id - a.id));
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (inspection: Inspection) => {
    if (inspection.type === 'P2H') {
      await generateP2HPDF(inspection as any);
    } else if (inspection.type === 'APAR') {
      await generateAPARPDF(inspection as any);
    } else if (inspection.type === 'HYDRANT') {
      try {
        const checklistParsed = JSON.parse(inspection.checklistData || '{}');
        await generateHydrantPDF({
          id: inspection.id,
          location: inspection.location,
          pic: inspection.pic || '',
          diketahuiOleh: checklistParsed.diketahuiOleh || '',
          diPeriksaOleh: checklistParsed.diPeriksaOleh || inspection.pic || '',
          signatureDiketahui: checklistParsed.signatureDiketahui || '',
          signatureDiPeriksa: checklistParsed.signatureDiPeriksa || '',
          periodeInspeksi: checklistParsed.periodeInspeksi || '',
          createdAt: inspection.date || inspection.createdAt,
          items: checklistParsed.items || []
        });
      } catch (err) {
        console.error('Error generating Hydrant PDF:', err);
        alert('Gagal mengunduh PDF Hydrant');
      }
    } else {
      alert('PDF belum tersedia untuk tipe inspeksi ini');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
      return 'Tanggal tidak tersedia';
    }
    return date.toLocaleDateString('id-ID', {
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

  const getPhotoPreview = (item: any) => {
    if (item.photos) {
      try {
        const parsed = JSON.parse(item.photos);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (e) { }
    }
    if (item.photo) return item.photo;
    if (item.imageData) return item.imageData;
    try {
      const checklist = JSON.parse(item.checklistData || '{}');
      if (checklist.photos && Array.isArray(checklist.photos) && checklist.photos.length > 0) {
        return checklist.photos[0];
      }
      if (checklist.photo) return checklist.photo;
    } catch (e) { }
    return null;
  };

  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getAllPhotos = (item: any): string[] => {
    const photos: string[] = [];
    if (item.items && Array.isArray(item.items)) {
      item.items.forEach((child: any) => {
        if (child.photo) photos.push(child.photo);
        try {
          const c = JSON.parse(child.checklistData || '{}');
          if (c.photos && Array.isArray(c.photos)) photos.push(...c.photos);
          if (c.photo) photos.push(c.photo);
        } catch (e) { }
      });
    }
    if (item.photos) {
      try {
        const parsed = JSON.parse(item.photos);
        if (Array.isArray(parsed)) photos.push(...parsed);
      } catch (e) { }
    }
    if (item.photo) photos.push(item.photo);
    if (item.imageData) photos.push(item.imageData);
    try {
      const checklist = JSON.parse(item.checklistData || '{}');
      if (checklist.photos && Array.isArray(checklist.photos)) {
        photos.push(...checklist.photos);
      }
      if (checklist.photo) photos.push(checklist.photo);
      if (checklist.items && Array.isArray(checklist.items)) {
        checklist.items.forEach((i: any) => {
          if (i.photo) photos.push(i.photo);
        });
      }
    } catch (e) { }
    return Array.from(new Set(photos)).filter(p => !!p);
  };

  const handleItemClick = (item: any) => {
    setSelectedSession(item);
    setShowDetailModal(true);
  };

  const handlePhotoClick = (item: any) => {
    const photos = getAllPhotos(item);
    if (photos.length > 0) {
      setSelectedPhotos(photos);
      setShowPhotoModal(true);
    }
  };

  const PhotoThumbnail = ({ photos, onClick }: { photos: string[], onClick?: () => void }) => {
    if (!photos || photos.length === 0) return (
      <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 border-2 border-slate-200 border-dashed">
        <FileText size={16} />
      </div>
    );
    const mainPhoto = photos[0];
    const count = photos.length;
    return (
      <div onClick={onClick} className="relative group cursor-pointer">
        {count > 1 && (
          <div className="absolute top-0 right-0 w-14 h-14 bg-slate-200 rounded-lg transform rotate-6 border border-white shadow-sm translate-x-1 -translate-y-1"></div>
        )}
        <div className="relative w-14 h-14 bg-white p-1 rounded-lg shadow-md border border-slate-200 hover:scale-105 transition-transform z-10">
          <div className="w-full h-full relative overflow-hidden rounded">
            <img src={mainPhoto} alt="Preview" className="w-full h-full object-cover" />
          </div>
          {count > 1 && (
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
              +{count - 1}
            </div>
          )}
        </div>
      </div>
    );
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-slate-400';
    }
  };

  const getPriorityName = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'Kritis';
      case 'HIGH': return 'Tinggi';
      case 'MEDIUM': return 'Sedang';
      default: return 'Rendah';
    }
  };

  const getPicaStatusPill = (status: string) => {
    switch (status) {
      case 'CLOSED':
        return <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200">SELESAI</span>;
      case 'IN_PROGRESS':
        return <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-100 text-blue-600 border border-blue-200">PROSES</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-600 border border-amber-200">OPEN</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'P2H': return <Truck size={16} />;
      case 'Gear': return <Shield size={16} />;
      case 'APAR': return <Flame size={16} />;
      case 'Eye Wash': return <Eye size={16} />;
      case 'Hydrant': return <Droplets size={16} />;
      case 'Smoke Detector': return <Wind size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'P2H': return 'bg-blue-500';
      case 'Gear': return 'bg-purple-500';
      case 'APAR': return 'bg-red-500';
      case 'Eye Wash': return 'bg-cyan-500';
      case 'Hydrant': return 'bg-emerald-500';
      case 'Smoke Detector': return 'bg-orange-500';
      default: return 'bg-slate-500';
    }
  };

  // Grouped inspections
  const groupedInspections = React.useMemo(() => {
    const filtered = inspections.filter(item => {
      const matchesType = filterType === 'ALL' || item.type === filterType;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' ||
        (item.unitNumber?.toLowerCase().includes(searchLower)) ||
        (item.operatorName?.toLowerCase().includes(searchLower)) ||
        (item.location?.toLowerCase().includes(searchLower)) ||
        (item.pic?.toLowerCase().includes(searchLower)) ||
        (item.tagNumber?.toLowerCase().includes(searchLower));
      return matchesType && matchesSearch;
    });

    const grouped: any[] = [];
    const aparSessions: Record<string, Inspection & { items: Inspection[] }> = {};

    filtered.forEach(item => {
      if (item.type === 'APAR') {
        const dateKey = item.date ? item.date.substring(0, 10) : 'unknown';
        const sessionKey = `${item.location}-${dateKey}-${item.pic || 'unknown'}`;
        if (!aparSessions[sessionKey]) {
          aparSessions[sessionKey] = {
            ...item,
            id: item.id,
            checklistData: JSON.stringify({ items: [] }),
            items: []
          };
          grouped.push(aparSessions[sessionKey]);
        }
        if (aparSessions[sessionKey].items) {
          aparSessions[sessionKey].items.push(item);
        }
      } else {
        grouped.push(item);
      }
    });

    return grouped.sort((a, b) => b.id - a.id);
  }, [inspections, filterType, searchQuery]);

  // Filtered PICA
  const filteredPica = React.useMemo(() => {
    return picaReports.filter(item => {
      const matchesCategory = picaFilterCategory === 'ALL' || item.category === picaFilterCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' ||
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        (item.location?.toLowerCase().includes(searchLower));
      return matchesCategory && matchesSearch;
    });
  }, [picaReports, picaFilterCategory, searchQuery]);

  // Tab Component
  const TabSwitcher = () => (
    <div className="flex gap-2 p-1 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
      <button
        onClick={() => setActiveTab('inspeksi')}
        className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'inspeksi'
            ? 'bg-white text-slate-800 shadow-lg'
            : 'text-white/80 hover:bg-white/10'
          }`}
      >
        <FileText size={16} className="inline mr-2" />
        Inspeksi ({groupedInspections.length})
      </button>
      <button
        onClick={() => setActiveTab('pica')}
        className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'pica'
            ? 'bg-white text-slate-800 shadow-lg'
            : 'text-white/80 hover:bg-white/10'
          }`}
      >
        <AlertTriangle size={16} className="inline mr-2" />
        PICA ({picaReports.length})
      </button>
    </div>
  );

  // PICA List View
  const PicaListView = () => (
    <div className="space-y-3">
      {filteredPica.map((item) => {
        const photos = item.photos ? JSON.parse(item.photos || '[]') : [];
        return (
          <div
            key={item.id}
            className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all"
          >
            <div className="flex gap-4">
              {/* Category Icon */}
              <div className={`w-12 h-12 ${getCategoryColor(item.category)} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                {getCategoryIcon(item.category)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h3>
                    <span className="text-[10px] font-bold text-slate-400">{item.category} • #{item.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`}></span>
                    <span className="text-[10px] font-bold text-slate-500">{getPriorityName(item.priority)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} />
                        {item.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(item.createdAt)}
                    </span>
                    {item.deadline && (
                      <span className="flex items-center gap-1 text-red-500">
                        <Calendar size={10} />
                        DL: {formatDate(item.deadline)}
                      </span>
                    )}
                  </div>
                  {getPicaStatusPill(item.status)}
                </div>
              </div>

              {/* Photo */}
              {photos.length > 0 && (
                <div className="flex-shrink-0" onClick={() => { setSelectedPhotos(photos); setShowPhotoModal(true); }}>
                  <PhotoThumbnail photos={photos} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Inspeksi List View (Mobile)
  const InspeksiMobileListView = () => (
    <div className="space-y-4 pb-4">
      {groupedInspections.map((item) => {
        const isSession = item.items && item.items.length > 0;
        const itemCount = item.items?.length || 0;
        return (
          <div
            key={`${item.type}-${item.id}`}
            className="relative pl-8 md:pl-0 group cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125 ${getStatusColor(item.status || 'PENDING')}`}></div>
            <div className="bg-white rounded-[24px] p-5 shadow-sm group-hover:shadow-md transition-all border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 items-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.type === 'P2H' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      item.type === 'APAR' ? 'bg-red-50 text-red-600 border-red-100' :
                        item.type === 'HYDRANT' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                          item.type === 'SMOKE_DETECTOR' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">#{item.id}</span>
                </div>
                <div className="mr-auto ml-2" onClick={(e) => e.stopPropagation()}>
                  <PhotoThumbnail photos={getAllPhotos(item)} onClick={() => handlePhotoClick(item)} />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownloadPDF(item); }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.type === 'P2H' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' :
                      item.type === 'APAR' ? 'bg-red-50 text-red-600 hover:bg-red-100' :
                        item.type === 'HYDRANT' ? 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100' :
                          'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  title="Download PDF"
                >
                  <Download size={16} />
                </button>
              </div>
              <h3 className="font-bold text-slate-800 text-sm leading-snug mb-1">
                {item.type === 'P2H' && `${item.unitNumber} - ${item.vehicleType}`}
                {item.type === 'APAR' && `Inspeksi APAR Area ${item.location}`}
                {item.type === 'HYDRANT' && `Hydrant - ${item.location}`}
                {item.type === 'SMOKE_DETECTOR' && `Smoke Detector - ${item.location || '-'}`}
                {item.type === 'EYEWASH' && `Eye Wash - ${item.location}`}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {item.type === 'P2H' && `Operator: ${item.operatorName || '-'}`}
                {item.type === 'APAR' && `Total ${itemCount} Unit Diperiksa`}
                {item.type === 'HYDRANT' && `PIC: ${item.pic || '-'} | Shift: ${item.shift || '-'}`}
                {(item.type === 'SMOKE_DETECTOR' || item.type === 'EYEWASH') && `PIC: ${item.pic || '-'}`}
              </p>
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Clock size={12} /> {formatDate(item.createdAt || item.date)}
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
        );
      })}
    </div>
  );

  return (
    <div className="pb-32 md:pb-8 animate-fade-in flex flex-col h-full bg-[#F3F6F8] font-sans overflow-y-auto">
      {/* Header */}
      <div className="relative bg-slate-900 pt-8 pb-10 px-6 rounded-b-[40px] md:rounded-b-none shadow-2xl z-10 overflow-hidden shrink-0">
        <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px]" />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="flex md:flex-row flex-col justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Riwayat</h1>
              <p className="text-slate-400 text-sm">Kelola data inspeksi dan laporan PICA.</p>
            </div>

            {/* Search */}
            <div className="flex gap-3 w-full md:w-auto">
              <div className="flex-1 md:w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center px-4 h-[52px] shadow-lg">
                <Search size={20} className="text-slate-400 mr-3" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-white placeholder-slate-400 text-sm w-full focus:ring-0 focus:outline-none p-0"
                />
              </div>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`w-[52px] h-[52px] ${(activeTab === 'inspeksi' ? filterType : picaFilterCategory) !== 'ALL' ? 'bg-emerald-500 border-emerald-400' : 'bg-indigo-500 border-indigo-400'} text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform border`}
              >
                <Filter size={22} />
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <TabSwitcher />

          {/* Filter Menu */}
          {showFilterMenu && (
            <div className="mt-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex flex-wrap gap-2">
              {activeTab === 'inspeksi' ? (
                ['ALL', 'P2H', 'APAR', 'HYDRANT', 'SMOKE_DETECTOR', 'EYEWASH'].map((type) => (
                  <button
                    key={type}
                    onClick={() => { setFilterType(type as any); setShowFilterMenu(false); }}
                    className={`flex-1 min-w-[80px] px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === type ? 'bg-white text-indigo-600 shadow-md' : 'text-white/80 hover:bg-white/10'
                      }`}
                  >
                    {type === 'ALL' ? 'Semua' : type.replace('_', ' ')}
                  </button>
                ))
              ) : (
                ['ALL', 'P2H', 'Gear', 'APAR', 'Eye Wash', 'Hydrant', 'Smoke Detector'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setPicaFilterCategory(cat); setShowFilterMenu(false); }}
                    className={`flex-1 min-w-[80px] px-4 py-2 rounded-xl text-xs font-bold transition-all ${picaFilterCategory === cat ? 'bg-white text-indigo-600 shadow-md' : 'text-white/80 hover:bg-white/10'
                      }`}
                  >
                    {cat === 'ALL' ? 'Semua' : cat}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-6 md:px-10 -mt-4 md:mt-6 relative z-20 pb-8">
        {/* Stats */}
        <div className="hidden md:flex gap-4 mb-6">
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">
                {activeTab === 'inspeksi' ? 'Total Inspeksi' : 'Total PICA'}
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {activeTab === 'inspeksi' ? groupedInspections.length : filteredPica.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              {activeTab === 'inspeksi' ? <FileText size={20} /> : <AlertTriangle size={20} />}
            </div>
          </div>
          {activeTab === 'pica' && (
            <>
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Prioritas Tinggi/Kritis</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredPica.filter(p => p.priority === 'HIGH' || p.priority === 'CRITICAL').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                  <Flag size={20} />
                </div>
              </div>
              <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Selesai</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {filteredPica.filter(p => p.status === 'CLOSED').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="text-indigo-500 animate-spin" />
            <span className="text-slate-400 font-medium">Memuat data...</span>
          </div>
        ) : activeTab === 'inspeksi' ? (
          groupedInspections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[28px] border-2 border-dashed border-slate-200">
              <FileText size={48} className="text-slate-300" />
              <span className="text-slate-400 font-medium">Belum ada data inspeksi.</span>
              <button onClick={() => { setFilterType('ALL'); setSearchQuery('') }} className="text-indigo-600 font-bold text-sm hover:underline">Reset Filter</button>
            </div>
          ) : (
            <InspeksiMobileListView />
          )
        ) : (
          filteredPica.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[28px] border-2 border-dashed border-slate-200">
              <AlertTriangle size={48} className="text-slate-300" />
              <span className="text-slate-400 font-medium">Belum ada laporan PICA.</span>
              <button onClick={() => { setPicaFilterCategory('ALL'); setSearchQuery('') }} className="text-indigo-600 font-bold text-sm hover:underline">Reset Filter</button>
            </div>
          ) : (
            <PicaListView />
          )
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowPhotoModal(false)}
        >
          <button
            onClick={() => setShowPhotoModal(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X size={24} />
          </button>
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-4">
              {selectedPhotos.map((photo, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
                  <img src={photo} alt={`Detail ${idx + 1}`} className="w-full h-auto object-contain" />
                  <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-full text-white text-sm font-medium backdrop-blur-md">
                    Foto {idx + 1} dari {selectedPhotos.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSession && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-[#F3F6F8] w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-6 ${selectedSession.type === 'APAR' ? 'bg-red-600' : selectedSession.type === 'P2H' ? 'bg-blue-600' : 'bg-slate-800'} text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold mb-1">Rincian Inspeksi {selectedSession.type?.replace('_', ' ')}</h2>
                  <p className="text-white/80 text-sm">{selectedSession.location} • {formatDate(selectedSession.date || selectedSession.createdAt)}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedSession.type === 'APAR' && selectedSession.items && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-700 mb-2">Daftar Unit APAR ({selectedSession.items.length} Unit)</h3>
                  {selectedSession.items.map((unit: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800">{unit.tagNumber || unit.unitNumber || `Unit #${idx + 1}`}</span>
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{unit.capacity || '-'}</span>
                        </div>
                        <p className="text-xs text-slate-500">Kondisi: {unit.condition || '-'}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold ${unit.condition === 'LAYAK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {unit.condition || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedSession.type === 'P2H' && (
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><label className="text-xs text-slate-400">Unit</label><p className="font-bold">{selectedSession.unitNumber}</p></div>
                    <div><label className="text-xs text-slate-400">Operator</label><p className="font-bold">{selectedSession.operatorName}</p></div>
                  </div>
                  <p className="text-sm text-slate-600">Rincian checklist harian tersedia lengkap di dokumen PDF.</p>
                </div>
              )}
              <div className="mt-6">
                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600"><FileText size={16} /></div>
                  Dokumentasi Inspeksi
                </h3>
                {getAllPhotos(selectedSession).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {getAllPhotos(selectedSession).map((photo, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group cursor-pointer"
                        onClick={() => { setSelectedPhotos(getAllPhotos(selectedSession)); setShowPhotoModal(true); }}
                      >
                        <img src={photo} alt={`Evidence ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-slate-400">
                    <p className="text-sm">Tidak ada foto dokumentasi terlampir.</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleDownloadPDF(selectedSession)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                >
                  <Download size={18} /> Download Laporan PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};