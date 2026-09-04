import React from 'react';
import { useTranslation } from "react-i18next";

export const SkipToContent: React.FC = () => {
    const { t } = useTranslation();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-amber-400 focus:text-slate-950 focus:font-bold focus:rounded-xl focus:shadow-xl"
    >
       {t("Skip to main content")} </a>
  );
};
