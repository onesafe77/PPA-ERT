import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-[#F3F6F8] font-sans flex text-slate-900">
      {/* 
        On mobile: Full width, Full height.
        On desktop: Full width (no max-w-md constraint), allowing content to fill space next to sidebar.
      */}
      <div className="w-full min-h-screen relative flex flex-col">
        {children}
      </div>
    </div>
  );
};