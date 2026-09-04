import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { useTranslation } from "react-i18next";

export const OfflineIndicator: React.FC = () => {
    const { t } = useTranslation();
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-white shadow-xl border border-slate-700">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5 text-slate-300" />
      <span> {t("Offline Mode")} </span>
    </div>
  );
};
