import React from "react";
import { WorkerApp } from "./worker/WorkerApp";
import { CustomerApp } from "./customer/CustomerApp";
import { AdminDashboard } from "./admin/AdminDashboard";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export const TripleViewSimulator: React.FC = () => {
    const { t } = useTranslation();
  return (
    <div className="w-full flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {" "}
      {/* Live sync highlight note */}{" "}
      <div className="max-w-7xl mx-auto mb-6 bg-white/90 border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {" "}
        <div className="flex items-center gap-3">
          {" "}
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            {" "}
            <Sparkles className="w-5 h-5" />{" "}
          </div>{" "}
          <div>
            {" "}
            <h2 className="text-sm font-bold text-slate-900">
              {" "}
               {t("Live Real-Time Cross-App Sync")} {" "}
            </h2>{" "}
            <p className="text-xs text-slate-500">
              {" "}
               {t("Post a job in Employer App ➔ Worker App receives instant radar alert ➔ Worker accepts ➔ Share OTP ➔ Mark done ➔ Payout releases to wallet & Admin tracks live.")} {" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
          {" "}
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>{" "}
           {t("Escrow: 20% Fee Enabled")} {" "}
        </div>{" "}
      </div>{" "}
      {/* 3-Column Grid */}{" "}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {" "}
        {/* Interface A: Worker App */}{" "}
        <div className="flex flex-col gap-2">
          {" "}
          <div className="flex items-center gap-2 px-1">
            {" "}
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>{" "}
            <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
              {" "}
               {t("Interface A: Worker App")} {" "}
            </h2>{" "}
          </div>{" "}
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border-4 sm:border-[12px] border-slate-900 shadow-2xl h-[520px] sm:h-[580px] overflow-hidden flex flex-col w-full">
            <WorkerApp isEmbedded={true} />
          </div>
        </div>
        {/* Interface B: Employer App */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
               {t("Interface B: Employer App")} 
            </h2>
          </div>
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border-4 sm:border-[12px] border-slate-900 shadow-2xl h-[520px] sm:h-[580px] overflow-hidden flex flex-col w-full">
            <CustomerApp isEmbedded={true} />
          </div>
        </div>
        {/* Interface C: Admin Panel */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
            <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
               {t("Interface C: Admin Panel")} 
            </h2>
          </div>
          <div className="bg-slate-900 rounded-2xl sm:rounded-[2rem] shadow-2xl h-[520px] sm:h-[580px] overflow-hidden flex flex-col border border-slate-700 p-1 w-full">
            <AdminDashboard isEmbedded={true} />
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
