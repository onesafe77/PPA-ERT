import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'critical';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading,
  fullWidth = false,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = "h-[54px] rounded-2xl font-bold transition-all flex items-center justify-center gap-2.5 text-[15px] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none tracking-normal";

  const variants = {
    primary: "bg-app-primary text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20",
    secondary: "bg-white text-app-text-primary hover:bg-slate-50 border border-slate-200 shadow-sm",
    outline: "bg-transparent border-2 border-app-primary text-app-primary hover:bg-emerald-50",
    ghost: "bg-transparent text-app-text-secondary hover:text-app-primary hover:bg-slate-100",
    critical: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};