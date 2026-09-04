import React, { useState } from 'react';
import { Briefcase, HardHat, Copy, Check, ExternalLink, X, Smartphone, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from "react-i18next";

interface AppExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppExtensionModal: React.FC<AppExtensionModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
  const { setCurrentRole } = useApp();
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseUrl = window.location.origin + window.location.pathname;
  const customerAppUrl = `${baseUrl}?app=customer`;
  const workerAppUrl = `${baseUrl}?app=worker`;

  const handleCopy = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleLaunchCustomer = () => {
    setCurrentRole('customer');
    window.history.pushState({}, '', '?app=customer');
    onClose();
  };

  const handleLaunchWorker = () => {
    setCurrentRole('worker');
    window.history.pushState({}, '', '?app=worker');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#383838] w-full max-w-xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-[#2D2D2D] flex items-center justify-between bg-amber-50/50 dark:bg-[#252525]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                 {t("Dedicated App Portals & Extensions")} </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                 {t("Direct links for Customer (Employer) & Worker apps")} </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#2E2E2E] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
             {t("You can bookmark or share separate direct app extensions for customers and workers. Opening these links will instantly bypass the role selector and open directly into the respective portal.")} </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer App Card */}
            <div className="bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333333] rounded-2xl p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white"> {t("Customer App")} </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                   {t("For employers, homeowners, and contractors to post daily jobs & hire workers.")} </p>
              </div>

              <div className="space-y-2">
                <div className="bg-white dark:bg-[#1A1A1A] p-2 rounded-xl border border-slate-200 dark:border-[#333333] text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
                  {customerAppUrl}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(customerAppUrl, 'customer')}
                    className="flex-1 py-2 bg-slate-200 dark:bg-[#333333] hover:bg-slate-300 dark:hover:bg-[#3D3D3D] text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedType === 'customer' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedType === 'customer' ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={handleLaunchCustomer}
                    className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                     {t("Launch")} </button>
                </div>
              </div>
            </div>

            {/* Worker App Card */}
            <div className="bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#333333] rounded-2xl p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white"> {t("Worker App")} </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                   {t("For daily wage earners, mistris, laborers, and artisans to find work & withdraw wages.")} </p>
              </div>

              <div className="space-y-2">
                <div className="bg-white dark:bg-[#1A1A1A] p-2 rounded-xl border border-slate-200 dark:border-[#333333] text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
                  {workerAppUrl}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(workerAppUrl, 'worker')}
                    className="flex-1 py-2 bg-slate-200 dark:bg-[#333333] hover:bg-slate-300 dark:hover:bg-[#3D3D3D] text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedType === 'worker' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedType === 'worker' ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={handleLaunchWorker}
                    className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                     {t("Launch")} </button>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong> {t("Tip:")} </strong>  {t("On your phone's browser (Safari/Chrome), open the Customer or Worker link above and select")} <strong> {t("\"Add to Home Screen\"")} </strong>  {t("to create independent app icons on your home screen for each!")} </p>
          </div>

        </div>

      </div>
    </div>
  );
};
