import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useTranslation } from "react-i18next";

export const CookieBanner: React.FC = () => {
    const { t } = useTranslation();
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('kaamzo_cookie_consent');
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('kaamzo_cookie_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div 
      role="region" 
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 dark:bg-[#161616]/95 backdrop-blur-md border-t border-slate-800 text-white px-4 py-3.5 shadow-2xl animate-in slide-in-from-bottom-4"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <p>
             {t("We use essential cookies and local storage to keep your daily wage connections secure, fast, and reliable. By using Kaamzo, you agree to our privacy standards.")} </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
             {t("Accept & Continue")} </button>
          <button
            onClick={handleAccept}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            aria-label="Close cookie banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
