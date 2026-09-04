import React, { useState, useEffect } from "react";
import {
  Crown,
  ShieldCheck,
  Zap,
  CheckCircle2,
  X,
  Sparkles,
  TrendingUp,
  Gift,
  ArrowRight,
  Play,
  Volume2,
  VolumeX,
  CreditCard,
  Building2,
  UserCheck,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { playSound } from "../../utils/audio";
import { useTranslation } from "react-i18next";

interface SubscriptionPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: "customer" | "worker";
  allowRoleSwitch?: boolean;
}
export const SubscriptionPromoModal: React.FC<SubscriptionPromoModalProps> = ({
  isOpen,
  onClose,
  initialRole = "customer",
  allowRoleSwitch = false,
}) => {
    const { t } = useTranslation();
  const {
    currentWorker,
    currentCustomer,
    subscribeCustomerPremium,
    subscribeWorkerPremium,
  } = useApp();
  const [activeTab, setActiveTab] = useState<"customer" | "worker">(
    initialRole,
  );
  const [countdown, setCountdown] = useState<number>(3);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [showActivatedSuccess, setShowActivatedSuccess] =
    useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialRole);
      setCountdown(3);
      setCanSkip(false);
      setShowActivatedSuccess(false);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, initialRole]);
  if (!isOpen) return null;
  const handleActivateCustomerGold = async () => {
    setIsProcessing(true);
    playSound("click");
    try {
      const res = subscribeCustomerPremium(
        currentCustomer?.id || "cust-1",
        "UPI",
      );
      if (res.success) {
        setShowActivatedSuccess(true);
        setSuccessMessage(
          "₹15,000 Customer Gold Subscription Activated! Money credited to Admin Account. Worker wages will now be automatically disbursed by Admin directly into worker wallets!",
        );
        playSound("success");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  const handleActivateWorkerVip = async () => {
    setIsProcessing(true);
    playSound("click");
    try {
      const res = subscribeWorkerPremium(currentWorker?.id || "w-1", "UPI");
      if (res.success) {
        setShowActivatedSuccess(true);
        setSuccessMessage(
          "Worker VIP Pass & Instant Aadhaar Verification Activated! You are now Govt. Aadhaar Verified with 6 Zero-Commission Jobs and top radar priority!",
        );
        playSound("success");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
      {" "}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border-2 border-amber-400/60 relative flex flex-col max-h-[92vh]">
        {" "}
        {/* YouTube-Style Top Ticker & Skip Ad Bar */}{" "}
        <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <span className="flex h-2 w-2 relative">
              {" "}
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>{" "}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>{" "}
            </span>{" "}
            <div className="flex items-center gap-1.5 bg-amber-600/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
              {" "}
              <Play className="w-3 h-3 fill-amber-300" />{" "}
              <span> {t("Membership Feature Spotlight")} </span>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex items-center gap-2">
            {" "}
            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition text-xs"
              title={t("Toggle Audio")}
            >
              {" "}
              {isSoundMuted ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              )}{" "}
            </button>{" "}
            {canSkip ? (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1 rounded-xl border border-slate-700 transition"
              >
                {" "}
                <span> {t("Skip Ad")} </span> <ArrowRight className="w-3.5 h-3.5" />{" "}
              </button>
            ) : (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                {" "}
                 {t("Skip in")} {countdown} {t("s")} {" "}
              </span>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {/* Dynamic Header Tab Switcher or Locked Role Header */}{" "}
        {allowRoleSwitch ? (
          <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 flex gap-2">
            {" "}
            <button
              onClick={() => {
                setActiveTab("customer");
                playSound("click");
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 ${activeTab === "customer" ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20" : "bg-slate-800/70 text-slate-400 hover:text-white"}`}
            >
              {" "}
              <Crown className="w-3.5 h-3.5" />{" "}
              <span> {t("Customer Gold Plan (₹15,000)")} </span>{" "}
            </button>{" "}
            <button
              onClick={() => {
                setActiveTab("worker");
                playSound("click");
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 ${activeTab === "worker" ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20" : "bg-slate-800/70 text-slate-400 hover:text-white"}`}
            >
              {" "}
              <ShieldCheck className="w-3.5 h-3.5" />{" "}
              <span> {t("Worker VIP & Aadhaar (₹2,000)")} </span>{" "}
            </button>{" "}
          </div>
        ) : (
          <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              {activeTab === "customer" ? (
                <>
                  {" "}
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    {" "}
                    <Crown className="w-4 h-4" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h4 className="text-xs font-black text-white">
                       {t("Customer Exclusive Membership")} </h4>{" "}
                    <p className="text-[10px] text-amber-400">
                       {t("1 Month Free Service & Admin Automated Worker Payouts")} </p>{" "}
                  </div>{" "}
                </>
              ) : (
                <>
                  {" "}
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    {" "}
                    <ShieldCheck className="w-4 h-4" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h4 className="text-xs font-black text-white">
                       {t("Worker VIP Pass & Verification")} </h4>{" "}
                    <p className="text-[10px] text-amber-400">
                       {t("Instant Govt. Aadhaar Verified Gold Badge + 0% Commission")} </p>{" "}
                  </div>{" "}
                </>
              )}{" "}
            </div>{" "}
            <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 font-bold">
              {" "}
              {activeTab === "customer"
                ? "Customer Special"
                : "Worker Special"}{" "}
            </span>{" "}
          </div>
        )}{" "}
        {/* Scrollable Modal Content */}{" "}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {" "}
          {showActivatedSuccess ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              {" "}
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
                {" "}
                <CheckCircle2 className="w-8 h-8" />{" "}
              </div>{" "}
              <h3 className="text-xl font-black text-white">
                 {t("Membership Activated!")} </h3>{" "}
              <p className="text-xs text-amber-300 font-medium px-4">
                {" "}
                {successMessage}{" "}
              </p>{" "}
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-lg mt-4 cursor-pointer"
              >
                {" "}
                 {t("Continue to Platform")} {" "}
              </button>{" "}
            </div>
          ) : activeTab === "customer" ? (
            /* Customer Gold Membership Spotlight */ <div className="space-y-4 animate-in fade-in">
              {" "}
              {/* Highlight Hero Card */}{" "}
              <div className="bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-slate-900 border-2 border-amber-400/80 rounded-3xl p-5 relative overflow-hidden">
                {" "}
                <div className="flex items-start justify-between">
                  {" "}
                  <div className="space-y-1">
                    {" "}
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md inline-block">
                      {" "}
                       {t("⭐ YouTube-Style Channel Membership")} {" "}
                    </span>{" "}
                    <h3 className="text-2xl font-black text-amber-300 leading-tight">
                      {" "}
                       {t("Dihadi Gold Club")} {" "}
                    </h3>{" "}
                    <p className="text-xs text-slate-300">
                      {" "}
                       {t("All-inclusive 1 Month Free Service with Automated Admin Payouts")} {" "}
                    </p>{" "}
                  </div>{" "}
                  <div className="text-right">
                    {" "}
                    <div className="text-3xl font-black text-white font-mono">
                      ₹15,000
                    </div>{" "}
                    <span className="text-[10px] text-amber-400 font-bold block">
                       {t("1 Month Free Plan")} </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mt-4 pt-3 border-t border-amber-400/30 bg-amber-950/40 p-3 rounded-2xl border border-amber-500/30">
                  {" "}
                  <div className="flex items-center gap-2 text-xs text-amber-200 font-bold">
                    {" "}
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />{" "}
                    <span>
                       {t("Admin Treasury Auto-Disburses Worker Wages Directly to Worker Wallets!")} </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Key Features for Customers */}{" "}
              <div className="space-y-2 text-xs">
                {" "}
                <div className="flex items-start gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  {" "}
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{" "}
                  <div>
                    {" "}
                    <strong className="text-white">
                       {t("Admin Automated Wallet Transfers:")} </strong>{" "}
                    <p className="text-slate-400 text-[11px]">
                      {" "}
                       {t("When you hire or book a worker, the platform Admin directly transfers the worker's earnings straight into their wallet automatically.")} {" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-start gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  {" "}
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{" "}
                  <div>
                    {" "}
                    <strong className="text-white">
                       {t("1 Month 100% Free Booking (0% Surcharge):")} </strong>{" "}
                    <p className="text-slate-400 text-[11px]">
                      {" "}
                       {t("Post unlimited jobs with zero platform commission fees for 30 full days.")} {" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-start gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  {" "}
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{" "}
                  <div>
                    {" "}
                    <strong className="text-white">
                       {t("Free Verified Aadhaar KYC Dossiers:")} </strong>{" "}
                    <p className="text-slate-400 text-[11px]">
                      {" "}
                       {t("Instant access to official verified worker performance dossiers and police verification badges.")} {" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Action Button */}{" "}
              <button
                onClick={handleActivateCustomerGold}
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {" "}
                <Crown className="w-4 h-4" />{" "}
                <span>
                  {isProcessing
                    ? "Processing ₹15,000 Plan..."
                    : "Join Gold Club (₹15,000 / Month)"}
                </span>{" "}
                <ArrowRight className="w-4 h-4" />{" "}
              </button>{" "}
            </div>
          ) : (
            /* Worker VIP Pass Spotlight */ <div className="space-y-4 animate-in fade-in">
              {" "}
              {/* Highlight Hero Card */}{" "}
              <div className="bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-slate-900 border-2 border-amber-400/80 rounded-3xl p-5 relative overflow-hidden">
                {" "}
                <div className="flex items-start justify-between">
                  {" "}
                  <div className="space-y-1">
                    {" "}
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md inline-block">
                      {" "}
                       {t("⚡ FAST-TRACK VERIFICATION & VIP")} {" "}
                    </span>{" "}
                    <h3 className="text-2xl font-black text-amber-300 leading-tight">
                      {" "}
                       {t("Worker VIP Pass")} {" "}
                    </h3>{" "}
                    <p className="text-xs text-slate-300">
                      {" "}
                       {t("Instant Govt Aadhaar Verification + 6 Zero-Commission Jobs")} {" "}
                    </p>{" "}
                  </div>{" "}
                  <div className="text-right">
                    {" "}
                    <div className="text-3xl font-black text-white font-mono">
                      ₹2,000
                    </div>{" "}
                    <span className="text-[10px] text-amber-400 font-bold block">
                       {t("6 Jobs Pass")} </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mt-4 pt-3 border-t border-amber-400/30 bg-amber-950/40 p-3 rounded-2xl border border-amber-500/30">
                  {" "}
                  <div className="flex items-center gap-2 text-xs text-amber-200 font-bold">
                    {" "}
                    <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />{" "}
                    <span>
                       {t("Includes Instant Govt. Aadhaar Card Verification — Skip the Admin Approval Queue!")} </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Key Features for Workers */}{" "}
              <div className="space-y-2 text-xs">
                {" "}
                <div className="flex items-start gap-2.5 bg-amber-950/40 p-3 rounded-2xl border border-amber-500/40">
                  {" "}
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{" "}
                  <div>
                    {" "}
                    <strong className="text-amber-300">
                       {t("Instant Aadhaar KYC Verification:")} </strong>{" "}
                    <p className="text-slate-300 text-[11px]">
                      {" "}
                       {t("Your profile is instantly upgraded to \"Aadhaar Verified\" with an official verified gold badge, attracting 3x more direct customer bookings.")} {" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-start gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  {" "}
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{" "}
                  <div>
                    {" "}
                    <strong className="text-white">
                       {t("0% Platform Commission (Keep 100%):")} </strong>{" "}
                    <p className="text-slate-400 text-[11px]">
                      {" "}
                       {t("The 20% platform cut is waived for 6 jobs. If the daily wage is ₹900, you keep the full ₹900 in your wallet.")} {" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-start gap-2.5 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  {" "}
                  <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{" "}
                  <div>
                    {" "}
                    <strong className="text-white">
                       {t("Top 5 Radar Priority Ranking:")} </strong>{" "}
                    <p className="text-slate-400 text-[11px]">
                      {" "}
                       {t("Your profile appears at the top of customer search and direct auto-hiring rankings.")} {" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Action Button */}{" "}
              <button
                onClick={handleActivateWorkerVip}
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {" "}
                <ShieldCheck className="w-4 h-4" />{" "}
                <span>
                  {isProcessing
                    ? "Activating VIP Pass..."
                    : "Activate VIP Pass & Aadhaar (₹2,000)"}
                </span>{" "}
                <ArrowRight className="w-4 h-4" />{" "}
              </button>{" "}
            </div>
          )}{" "}
        </div>{" "}
        {/* Footer info */}{" "}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          {" "}
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            {" "}
            <Sparkles className="w-3.5 h-3.5" />{" "}
            <span> {t("YouTube-Style Ad Promotion")} </span>{" "}
          </div>{" "}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white underline transition"
          >
            {" "}
             {t("Close & Go to App")} {" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
