import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  RotateCcw,
  FileCheck2,
  Radio,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { playSound } from "../../utils/audio";
import { useTranslation } from "react-i18next";

export interface AppProtectionGuaranteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: "post_rating" | "post_login";
  workerName?: string;
  workerTrade?: string;
  workerAadhaarMasked?: string;
  refundAmount?: number;
}
export const AppProtectionGuaranteeModal: React.FC<
  AppProtectionGuaranteeModalProps
> = ({
  isOpen,
  onClose,
  variant = "post_rating",
  workerName,
  workerTrade,
  workerAadhaarMasked = "XXXX-XXXX-9901",
  refundAmount,
}) => {
    const { t } = useTranslation();
  if (!isOpen) return null;
  const handleAcknowledge = () => {
    playSound("success");
    onClose();
  };
  const isPostRating = variant === "post_rating";
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none">
      {" "}
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {" "}
        {/* Modal Header */}{" "}
        <div className="bg-linear-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-5 flex items-center justify-between shrink-0 border-b border-amber-500/20">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              {" "}
              <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />{" "}
            </div>{" "}
            <div>
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                  {" "}
                   {t("Important Security Advisory")} {" "}
                </span>{" "}
                {isPostRating && (
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                    {" "}
                    <CheckCircle2 className="w-3 h-3" />  {t("Job Rated")} {" "}
                  </span>
                )}{" "}
              </div>{" "}
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                {" "}
                {isPostRating
                  ? `Safety Guarantee & Direct Hiring Warning`
                  : `Customer Trust & 100% Accountability Guarantee`}{" "}
              </h3>{" "}
            </div>{" "}
          </div>{" "}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl transition hover:bg-slate-800"
            title={t("Close")}
          >
            {" "}
            <X className="w-5 h-5" />{" "}
          </button>{" "}
        </div>{" "}
        {/* Modal Scrollable Body */}{" "}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-700 text-xs flex-1">
          {" "}
          {/* Card 1: The Critical Off-Platform Warning (RED/AMBER THEME) */}{" "}
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-xs">
            {" "}
            <div className="flex items-start gap-3">
              {" "}
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                {" "}
                <AlertTriangle className="w-5 h-5 text-white" />{" "}
              </div>{" "}
              <div>
                {" "}
                <h4 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                  {" "}
                   {t("⚠️ Warning: Never Hire or Work Directly Outside the App")} {" "}
                </h4>{" "}
                <p className="text-xs text-amber-900 mt-1 leading-relaxed font-medium">
                  {" "}
                   {t("If you again hire or engage with")} {" "}
                  {workerName ? (
                    <span className="font-black text-amber-950">
                      {workerName}
                    </span>
                  ) : (
                    "workers"
                  )}{" "}
                  <strong>
                     {t("directly in private without booking through our official Kaamzo App")} </strong>
                  :{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="bg-white/80 border border-amber-200 rounded-xl p-3 space-y-1.5 text-[11px] text-amber-900 ml-0 sm:ml-11">
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />{" "}
                <span>
                  <strong> {t("No Damage Liability:")} </strong>  {t("We are")} {" "}
                  <strong> {t("NOT responsible")} </strong>  {t("for any damage to you, your family, or your home/property.")} </span>{" "}
              </div>{" "}
              <div className="flex items-center gap-2">
                {" "}
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />{" "}
                <span>
                  <strong> {t("No Arrival Protection:")} </strong>  {t("If the worker arrives or fails to show up, we cannot enforce arrival or accountability.")} </span>{" "}
              </div>{" "}
              <div className="flex items-center gap-2">
                {" "}
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />{" "}
                <span>
                  <strong> {t("No Refund or Escrow:")} </strong>  {t("Any cash paid privately outside the app is completely at your own risk.")} </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Card 2: 100% Full App Protection Guarantee (EMERALD/BLUE THEME) */}{" "}
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            {" "}
            <div className="flex items-start gap-3">
              {" "}
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                {" "}
                <ShieldCheck className="w-5 h-5 text-white" />{" "}
              </div>{" "}
              <div>
                {" "}
                <h4 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                  {" "}
                   {t("🛡️ When You Book Through Our App, We Are 100% Accountable")} {" "}
                </h4>{" "}
                <p className="text-xs text-amber-900 mt-0.5 leading-relaxed font-medium">
                  {" "}
                   {t("Every booking created on the Kaamzo platform is fully covered by our comprehensive legal & financial protection shield:")} {" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            {/* Feature Checklist Grid */}{" "}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {" "}
              {/* Point 1: 100% Accountability */}{" "}
              <div className="bg-white rounded-xl p-3 border border-amber-200 space-y-1">
                {" "}
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                  {" "}
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />{" "}
                  <span> {t("Total App Accountability")} </span>{" "}
                </div>{" "}
                <p className="text-[11px] text-slate-600 leading-snug">
                  {" "}
                   {t("We are accountable for whether the worker arrives on time, completes work properly, and adheres to safety standards.")} {" "}
                </p>{" "}
              </div>{" "}
              {/* Point 2: 100% Money-Back Refund Guarantee */}{" "}
              <div className="bg-white rounded-xl p-3 border border-amber-200 space-y-1">
                {" "}
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                  {" "}
                  <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />{" "}
                  <span> {t("100% Instant Refund")} </span>{" "}
                </div>{" "}
                <p className="text-[11px] text-slate-600 leading-snug">
                  {" "}
                   {t("If the worker does not arrive or fails to start, 100% of your prepaid money is instantly refunded with zero deduction.")} {" "}
                </p>{" "}
              </div>{" "}
              {/* Point 3: Govt. Aadhaar Card Tracking */}{" "}
              <div className="bg-white rounded-xl p-3 border border-amber-200 space-y-1">
                {" "}
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                  {" "}
                  <FileCheck2 className="w-4 h-4 text-amber-600 shrink-0" />{" "}
                  <span> {t("Govt. Aadhaar Card on File")} </span>{" "}
                </div>{" "}
                <p className="text-[11px] text-slate-600 leading-snug">
                  {" "}
                   {t("We hold the worker's verified Govt. Aadhaar card on file (")} {workerAadhaarMasked} {t(") to legally track & identify them at all times.")} {" "}
                </p>{" "}
              </div>{" "}
              {/* Point 4: Live GPS Radar & Prepaid Escrow */}{" "}
              <div className="bg-white rounded-xl p-3 border border-amber-200 space-y-1">
                {" "}
                <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                  {" "}
                  <Lock className="w-4 h-4 text-purple-600 shrink-0" />{" "}
                  <span> {t("Prepaid Escrow Vault")} </span>{" "}
                </div>{" "}
                <p className="text-[11px] text-slate-600 leading-snug">
                  {" "}
                   {t("Your funds stay locked in the safe Kaamzo Escrow Vault and are only released after you confirm total job satisfaction.")} {" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Quick Summary Pill Banner */}{" "}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between gap-2 text-[11px]">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <Radio className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />{" "}
              <span className="font-medium text-slate-300">
                {" "}
                 {t("Always book via")} {" "}
                <span className="text-amber-400 font-bold"> {t("Kaamzo App")} </span>  {t("for guaranteed safety, Aadhaar tracking & refunds.")} {" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Modal Footer */}{" "}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {" "}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-200/60 text-slate-700 text-xs font-bold transition"
          >
            {" "}
             {t("Close")} {" "}
          </button>{" "}
          <button
            onClick={handleAcknowledge}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md"
          >
            {" "}
            <CheckCircle2 className="w-4 h-4 text-slate-950" />{" "}
            <span> {t("I Understand & Accept App Protection")} </span>{" "}
            <ArrowRight className="w-4 h-4" />{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
