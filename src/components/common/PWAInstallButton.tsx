import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download } from 'lucide-react';
import { useTranslation } from "react-i18next";

export const PWAInstallButton: React.FC = () => {
    const { t } = useTranslation();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-amber-400 transition ml-2"
      >
        <Download className="w-4 h-4" />
         {t("Install App")} </button>
    );
  }

  // Fallback for browsers/iframes where beforeinstallprompt doesnt fire
  return (
    <>
      <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-amber-400 transition ml-2"
        >
          <Download className="w-4 h-4" />
           {t("Install App")} </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-slate-200 text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2"> {t("Install Dihadi")} </h3>
              <p className="mt-2 text-sm text-slate-600 mb-6 font-medium">
                 {t("To install this app on your device:")} </p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-3 mb-6">
                <p className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-slate-900">1.</span> 
                  <span> {t("Open this application directly in your mobile browser (Safari/Chrome), or click the Share icon in your browser menu.")} </span>
                </p>
                <p className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-slate-900">2.</span> 
                  <span> {t("Scroll down and tap")} <strong> {t("Add to Home Screen")} </strong>.</span>
                </p>
              </div>
              
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-800 hover:bg-slate-200 transition"
              >
                 {t("Close")} </button>
            </div>
          </div>
        )}
      </>
  );
};
