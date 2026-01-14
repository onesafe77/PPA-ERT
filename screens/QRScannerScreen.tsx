import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeft, X } from 'lucide-react';
import { ScreenName } from '../types';

interface QRScannerScreenProps {
    onNavigate: (screen: ScreenName) => void;
}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ onNavigate }) => {
    const [scanResult, setScanResult] = useState<string | null>(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render((result) => {
            scanner.clear();
            setScanResult(result);
        }, (error) => {
            // console.warn(error);
        });

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, []);

    const handleBack = () => {
        onNavigate('home');
    };

    return (
        <div className="h-full bg-slate-900 text-white flex flex-col font-sans">
            {/* Header */}
            <div className="p-6 pt-12 flex items-center justify-between z-10">
                <button
                    onClick={handleBack}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold tracking-tight">Scan QR Code</h1>
                <div className="w-10" />
            </div>

            {/* Scanner Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-[-50%] left-[-20%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />

                {scanResult ? (
                    <div className="bg-white text-slate-900 p-8 rounded-[32px] max-w-xs w-full shadow-2xl animate-fade-in text-center mx-4">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2">QR Code Detected!</h2>
                        <p className="text-slate-500 break-all mb-6 font-mono text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">{scanResult}</p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    alert(`Membuka detail unit: ${scanResult}`);
                                    onNavigate('inspection');
                                }}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                Proses Unit
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all"
                            >
                                Scan Lagi
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-sm px-4">
                        <div id="reader" className="overflow-hidden rounded-3xl border-2 border-slate-700 bg-black/50 shadow-2xl"></div>
                        <p className="text-center text-slate-400 mt-6 text-sm font-medium">Arahkan kamera ke QR Code unit</p>
                    </div>
                )}
            </div>
            <style>{`
                #reader__scan_region {
                    background: transparent !important;
                }
                #reader__dashboard_section_csr button {
                    display: none;
                }
            `}</style>
        </div>
    );
};
