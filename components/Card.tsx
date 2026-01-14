import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'glass';
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, variant = 'default' }) => {
  // Elevated in light mode means white with stronger shadow, default is white with soft border/shadow
  const bgClass = variant === 'elevated' ? 'bg-white shadow-float' : variant === 'glass' ? 'glass border border-white/50' : 'bg-white shadow-card border border-slate-100';
  
  return (
    <div 
      onClick={onClick}
      className={`${bgClass} rounded-2xl p-5 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

interface StatusPillProps {
  status: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const getStyles = (s: string) => {
    switch (s.toUpperCase()) {
      case 'READY': 
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'NOT READY': 
        return 'bg-red-50 text-red-600 border-red-100';
      case 'SUBMITTED': 
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'DRAFT': 
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default: 
        return 'bg-slate-50 text-slate-400';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStyles(status)}`}>
      {status}
    </span>
  );
};

export const SeverityBadge: React.FC<{ level: 'Low' | 'Medium' | 'High' | 'Critical' }> = ({ level }) => {
  const colors = {
    Low: 'bg-emerald-500 shadow-emerald-200',
    Medium: 'bg-amber-500 shadow-amber-200',
    High: 'bg-orange-500 shadow-orange-200',
    Critical: 'bg-red-500 shadow-red-200'
  };
  
  return (
    <div className={`flex items-center gap-2`}>
        <div className={`w-2.5 h-2.5 rounded-full ${colors[level]} shadow-lg`} />
        {level === 'Critical' && <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Critical</span>}
    </div>
  );
};