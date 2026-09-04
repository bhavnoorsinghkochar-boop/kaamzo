import React, { useState } from 'react';
import { MessageCircle, Phone, X, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from "react-i18next";

export const FloatingContactButton: React.FC = () => {
    const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { openGlobalChat, currentRole } = useApp();

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {isOpen && (
        <div className="absolute bottom-14 left-0 mb-2 w-72 bg-white dark:bg-[#242424] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#383838] p-4 text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#333333] mb-3">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
               {t("Kaamzo Support & Help")} </span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-3">
             {t("Need help finding daily wage work or hiring workers instantly? Our support team is active 24/7.")} </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                setIsOpen(false);
                openGlobalChat(null, { name: "Kaamzo Helpline", phone: "+91 95922 21100", role: "admin" }, currentRole === 'worker' ? 'worker' : 'customer');
              }}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
               {t("Chat with Helpline")} </button>
            <a
              href="tel:919592221100"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#2E2E2E] dark:hover:bg-[#383838] text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-4 h-4 text-amber-500" />
               {t("Call Toll-Free: +91 95922 21100")} </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open support and contact options"
        className="flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-amber-400 hover:bg-slate-800 dark:hover:bg-amber-300 text-white dark:text-slate-950 rounded-full shadow-2xl transition transform hover:scale-105 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <MessageCircle className="w-4 h-4 text-amber-400 dark:text-slate-950" />
        <span className="hidden sm:inline"> {t("Help & Support")} </span>
      </button>
    </div>
  );
};
