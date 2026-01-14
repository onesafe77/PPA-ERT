import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-bold text-app-text-primary ml-1">{label}</label>}
      <div className="relative">
        <input 
          className={`w-full h-[54px] bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-5 text-app-text-primary placeholder-slate-400 focus:outline-none focus:border-app-primary focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 ${icon ? 'pl-12' : ''} ${className}`}
          {...props}
        />
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>}
    </div>
  );
};