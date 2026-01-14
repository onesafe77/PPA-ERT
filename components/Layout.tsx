import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-[#F1F5F9] flex justify-center items-center font-sans">
      <div className="w-full max-w-md h-[100dvh] md:h-[90vh] md:rounded-[40px] bg-app-bg relative overflow-hidden shadow-2xl md:border-[8px] md:border-white flex flex-col">
        {children}
      </div>
    </div>
  );
};