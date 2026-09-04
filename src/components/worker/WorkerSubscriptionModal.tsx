import React, { useState } from "react";
import {
  Crown,
  Sparkles,
  CheckCircle2,
  Wallet,
  QrCode,
  Smartphone,
  TrendingUp,
  ShieldCheck,
  X,
  ArrowRight,
  Zap,
  Info,
  AlertTriangle,
} from "lucide-react";
import { WorkerProfile } from "../../types";
import { playSound } from "../../utils/audio";
import { useTranslation } from "react-i18next";

interface WorkerSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerProfile;
  onSubscribe: (
    method: "WALLET" | "UPI",
  ) =>
    | Promise<{ success: boolean; message: string }>
    | { success: boolean; message: string };
  onTopUpWallet?: (amount: number) => void;
}
export const WorkerSubscriptionModal: React.FC<
  WorkerSubscriptionModalProps
> = ({ isOpen, onClose, worker, onSubscribe, onTopUpWallet }) => {
    const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<"WALLET" | "UPI">(
    "WALLET",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  if (!isOpen) return null;
  const PRICE = 2000;
  const JOBS_COUNT = 6;
  const walletBalance = worker.walletBalance || 0;
  const hasEnoughWalletBalance = walletBalance >= PRICE;
  const remainingZeroJobs = worker.zeroCommissionJobsRemaining || 0;
  const isAlreadyVip = remainingZeroJobs > 0;
  const totalSaved = worker.commissionSavedTotal || 0;
  const handleActivate = async () => {
    setIsProcessing(true);
    playSound("click");
    try {
      if (selectedMethod === "WALLET") {
        if (!hasEnoughWalletBalance) {
          setIsProcessing(false);
          return;
        }
        const res = await onSubscribe("WALLET");
        if (res.success) {
          setShowSuccessState(true);
          playSound("cash");
        }
      } else {
        /*  UPI Flow: Show QR or instant confirm  */ setShowUpiQr(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleConfirmUpiPayment = async () => {
    setIsProcessing(true);
    playSound("click");
    try {
      const res = await onSubscribe("UPI");
      if (res.success) {
        setShowUpiQr(false);
        setShowSuccessState(true);
        playSound("cash");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  const handleQuickAddWalletFunds = () => {
    const diff = PRICE - walletBalance;
    if (onTopUpWallet) {
      onTopUpWallet(diff > 0 ? diff : 2000);
      playSound("cash");
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {" "}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-white relative max-h-[92vh] flex flex-col">
        {" "}
        {/* Header Ribbon */}{" "}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 p-5 text-slate-950 flex items-center justify-between shrink-0">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="w-11 h-11 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-lg border border-amber-400/50 shrink-0">
              {" "}
              <Crown className="w-6 h-6 animate-pulse" />{" "}
            </div>{" "}
            <div>
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full">
                  {" "}
                   {t("Worker VIP Pass")} {" "}
                </span>{" "}
                {isAlreadyVip && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full">
                    {" "}
                     {t("Active (")} {remainingZeroJobs}  {t("Left)")} {" "}
                  </span>
                )}{" "}
              </div>{" "}
              <h2 className="text-xl font-black tracking-tight text-slate-950 leading-tight">
                {" "}
                 {t("0% Commission VIP Pass")} {" "}
              </h2>{" "}
            </div>{" "}
          </div>{" "}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 flex items-center justify-center transition"
          >
            {" "}
            <X className="w-5 h-5" />{" "}
          </button>{" "}
        </div>{" "}
        {/* Modal Scrollable Body */}{" "}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {" "}
          {showSuccessState ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              {" "}
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
                {" "}
                <CheckCircle2 className="w-8 h-8" />{" "}
              </div>{" "}
              <div className="space-y-1">
                {" "}
                <h3 className="text-xl font-black text-white">
                   {t("VIP Pass Activated Successfully!")} </h3>{" "}
                <p className="text-xs text-amber-300 font-medium">
                  {" "}
                  {selectedMethod === "WALLET"
                    ? "₹2,000 directly deducted from your wallet balance."
                    : "₹2,000 paid via UPI."}{" "}
                </p>{" "}
                <p className="text-xs text-slate-300 pt-2">
                  {" "}
                   {t("You have")} {" "}
                  <strong className="text-amber-400 font-bold">
                    {remainingZeroJobs + JOBS_COUNT}  {t("Zero-Commission Jobs")} </strong>{" "}
                   {t("ready! You will keep 100% of your earnings on every job.")} {" "}
                </p>{" "}
              </div>{" "}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-left space-y-2">
                {" "}
                <div className="flex items-center justify-between text-xs">
                  {" "}
                  <span className="text-slate-400">
                     {t("Zero-Fee Jobs Credit:")} </span>{" "}
                  <span className="font-black text-amber-400 font-mono">
                     {t("+6 Jobs")} </span>{" "}
                </div>{" "}
                <div className="flex items-center justify-between text-xs">
                  {" "}
                  <span className="text-slate-400"> {t("Commission Rate:")} </span>{" "}
                  <span className="font-black text-amber-400 font-mono">
                     {t("0% (Zero Fee)")} </span>{" "}
                </div>{" "}
                <div className="flex items-center justify-between text-xs border-t border-slate-700/80 pt-2">
                  {" "}
                  <span className="text-slate-400">
                     {t("New Wallet Balance:")} </span>{" "}
                  <span className="font-black text-white font-mono">
                    ₹{worker.walletBalance}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              <button
                onClick={() => {
                  setShowSuccessState(false);
                  onClose();
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-lg"
              >
                {" "}
                 {t("Start Taking Zero-Commission Jobs")} {" "}
              </button>{" "}
            </div>
          ) : showUpiQr ? (
            /* UPI QR Code Screen */ <div className="space-y-4 text-center animate-in fade-in">
              {" "}
              <div className="space-y-1">
                {" "}
                <h3 className="text-lg font-black text-white">
                   {t("Scan UPI QR to Pay ₹")} {PRICE}
                </h3>{" "}
                <p className="text-xs text-slate-400">
                  {" "}
                   {t("Scan with GPay, PhonePe, Paytm, or BHIM UPI")} {" "}
                </p>{" "}
              </div>{" "}
              <div className="bg-white p-4 rounded-2xl max-w-[200px] mx-auto shadow-xl border-2 border-amber-400 flex flex-col items-center">
                {" "}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi:
// pay?pa=dihadi.vip@okhdfcbank&pn=Dihadi%20VIP%20Pass&am=${PRICE}&cu=INR&tn=Worker%20VIP%206%20Jobs%20Pass`)}`}
                  alt={t("UPI QR")}
                  className="w-36 h-36 rounded-lg"
                />{" "}
                <span className="text-[10px] text-slate-600 font-mono font-bold mt-2">
                  {" "}
                   {t("dihadi.vip@okhdfcbank")} {" "}
                </span>{" "}
              </div>{" "}
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-xs text-left space-y-1.5">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-slate-400">
                     {t("Subscription Item:")} </span>{" "}
                  <span className="font-bold text-amber-300">
                     {t("6 Zero-Commission Jobs Pass")} </span>{" "}
                </div>{" "}
                <div className="flex items-center justify-between font-mono">
                  {" "}
                  <span className="text-slate-400"> {t("Amount Due:")} </span>{" "}
                  <span className="font-black text-white text-sm">
                    ₹{PRICE}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex gap-2">
                {" "}
                <button
                  onClick={() => setShowUpiQr(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  {" "}
                   {t("Back")} {" "}
                </button>{" "}
                <button
                  onClick={handleConfirmUpiPayment}
                  disabled={isProcessing}
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg"
                >
                  {" "}
                  <CheckCircle2 className="w-4 h-4" />{" "}
                  <span>
                    {isProcessing ? "Verifying..." : "Payment Done (Activate)"}
                  </span>{" "}
                </button>{" "}
              </div>{" "}
            </div>
          ) : (
            /* Main Offer Screen */ <>
              {" "}
              {/* Existing VIP Status banner if active */}{" "}
              {isAlreadyVip && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between">
                  {" "}
                  <div className="space-y-0.5">
                    {" "}
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      {" "}
                       {t("Active VIP Pass Status")} {" "}
                    </span>{" "}
                    <p className="text-xs font-black text-white">
                      {" "}
                      {remainingZeroJobs}  {t("of")} {JOBS_COUNT}  {t("zero-fee jobs remaining")} {" "}
                    </p>{" "}
                    {totalSaved > 0 && (
                      <p className="text-[11px] text-amber-400 font-bold">
                        {" "}
                         {t("🎉 Saved ₹")} {totalSaved}  {t("in platform commission so far!")} {" "}
                      </p>
                    )}{" "}
                  </div>{" "}
                  <span className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black">
                    {" "}
                     {t("Active")} {" "}
                  </span>{" "}
                </div>
              )}{" "}
              {/* Price & Value Proposition Header Card */}{" "}
              <div className="bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700 rounded-3xl p-4 sm:p-5 relative overflow-hidden">
                {" "}
                <div className="flex items-baseline justify-between">
                  {" "}
                  <div>
                    {" "}
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      {" "}
                       {t("Special Worker Package")} {" "}
                    </span>{" "}
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      {" "}
                      <span className="text-3xl font-black text-white font-mono">
                        ₹{PRICE}
                      </span>{" "}
                      <span className="text-xs text-slate-400 font-medium">
                         {t("one-time pass")} </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="text-right">
                    {" "}
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black">
                      {" "}
                       {t("6 Jobs Pass")} {" "}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="mt-4 pt-3 border-t border-slate-700/80 grid grid-cols-2 gap-3 text-center">
                  {" "}
                  <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
                    {" "}
                    <span className="text-[10px] text-slate-400 block">
                       {t("Normal Commission")} </span>{" "}
                    <span className="text-sm font-bold text-amber-400">
                       {t("20% Platform Fee")} </span>{" "}
                    <span className="text-[9px] text-slate-500 block">
                       {t("(-₹170/day)")} </span>{" "}
                  </div>{" "}
                  <div className="bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/30">
                    {" "}
                    <span className="text-[10px] text-amber-400 font-bold block">
                       {t("With VIP Pass")} </span>{" "}
                    <span className="text-sm font-black text-amber-400">
                       {t("0% Commission")} </span>{" "}
                    <span className="text-[9px] text-amber-300 block font-bold">
                       {t("(Keep 100% Wage)")} </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Key Benefits List */}{" "}
              <div className="space-y-2.5">
                {" "}
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  {" "}
                   {t("What You Get with VIP Pass:")} {" "}
                </h4>{" "}
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {" "}
                  <div className="flex items-start gap-2.5 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/40">
                    {" "}
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{" "}
                    <div>
                      {" "}
                      <strong className="text-amber-300">
                         {t("⚡ Instant Aadhaar Card Verification:")} </strong>{" "}
                      <p className="text-slate-300 text-[11px]">
                        {" "}
                         {t("Get immediate verified gold badge on your profile without waiting in the manual approval queue!")} {" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex items-start gap-2.5 bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                    {" "}
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{" "}
                    <div>
                      {" "}
                      <strong className="text-white">
                         {t("6 Jobs Without Commission:")} </strong>{" "}
                      <p className="text-slate-400 text-[11px]">
                        {" "}
                         {t("The 20% platform cut is waived to 0%. If wage is ₹900, you get full ₹900 directly into your wallet!")} {" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex items-start gap-2.5 bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                    {" "}
                    <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{" "}
                    <div>
                      {" "}
                      <strong className="text-white">
                         {t("Save Up to ₹1,800 - ₹3,000+:")} </strong>{" "}
                      <p className="text-slate-400 text-[11px]">
                        {" "}
                         {t("The pass easily pays for itself within the first few jobs.")} {" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex items-start gap-2.5 bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                    {" "}
                    <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{" "}
                    <div>
                      {" "}
                      <strong className="text-white">
                         {t("Top 5 Radar Priority:")} </strong>{" "}
                      <p className="text-slate-400 text-[11px]">
                        {" "}
                         {t("VIP badge workers appear with top priority ranking in client search results and auto-hiring.")} {" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Payment Method Selector */}{" "}
              <div className="space-y-3 pt-1">
                {" "}
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  {" "}
                   {t("Choose Payment Method:")} {" "}
                </h4>{" "}
                {/* Option 1: Direct Cut from Wallet */}{" "}
                <div
                  onClick={() => setSelectedMethod("WALLET")}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${selectedMethod === "WALLET" ? "bg-amber-500/10 border-amber-500 text-white" : "bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800"}`}
                >
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${selectedMethod === "WALLET" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}
                    >
                      {" "}
                      <Wallet className="w-5 h-5" />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <div className="flex items-center gap-1.5">
                        {" "}
                        <span className="text-xs font-black">
                           {t("Direct Cut from Wallet")} </span>{" "}
                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded">
                          {" "}
                           {t("Recommended")} {" "}
                        </span>{" "}
                      </div>{" "}
                      <p className="text-[11px] text-slate-400">
                        {" "}
                         {t("Current Wallet:")} {" "}
                        <strong className="text-amber-400 font-mono">
                          ₹{walletBalance}
                        </strong>{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="text-right">
                    {" "}
                    <span className="text-xs font-mono font-black">
                      ₹{PRICE}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Low Wallet Balance Helper */}{" "}
                {selectedMethod === "WALLET" && !hasEnoughWalletBalance && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs space-y-2 animate-in fade-in">
                    {" "}
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      {" "}
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />{" "}
                      <span>
                         {t("Insufficient Wallet Balance (₹")} {walletBalance})
                      </span>{" "}
                    </div>{" "}
                    <p className="text-[11px] text-slate-300">
                      {" "}
                       {t("You need ₹")} {PRICE - walletBalance}  {t("more in your wallet to activate directly.")} {" "}
                    </p>{" "}
                    <div className="flex gap-2">
                      {" "}
                      <button
                        onClick={handleQuickAddWalletFunds}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg transition"
                      >
                        {" "}
                         {t("+ Add ₹")} {PRICE - walletBalance}  {t("to Wallet")} {" "}
                      </button>{" "}
                      <button
                        onClick={() => setSelectedMethod("UPI")}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition"
                      >
                        {" "}
                         {t("Switch to UPI")} {" "}
                      </button>{" "}
                    </div>{" "}
                  </div>
                )}{" "}
                {/* Option 2: UPI / QR Payment */}{" "}
                <div
                  onClick={() => setSelectedMethod("UPI")}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${selectedMethod === "UPI" ? "bg-amber-500/10 border-amber-500 text-white" : "bg-slate-850 border-slate-800 text-slate-300 hover:bg-slate-800"}`}
                >
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${selectedMethod === "UPI" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}
                    >
                      {" "}
                      <QrCode className="w-5 h-5" />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <span className="text-xs font-black">
                         {t("Pay via UPI QR / GPay / PhonePe")} </span>{" "}
                      <p className="text-[11px] text-slate-400">
                        {" "}
                         {t("Scan QR or pay with any UPI App")} {" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="text-right">
                    {" "}
                    <span className="text-xs font-mono font-black">
                      ₹{PRICE}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Action Button */}{" "}
              <div className="pt-2">
                {" "}
                <button
                  onClick={handleActivate}
                  disabled={
                    isProcessing ||
                    (selectedMethod === "WALLET" && !hasEnoughWalletBalance)
                  }
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {" "}
                  <Crown className="w-4 h-4" />{" "}
                  <span>
                    {" "}
                    {isProcessing
                      ? "Processing..."
                      : selectedMethod === "WALLET"
                        ? `Pay ₹${PRICE} from Wallet & Get 6 Free Jobs`
                        : `Pay ₹${PRICE} via UPI & Activate Pass`}{" "}
                  </span>{" "}
                  <ArrowRight className="w-4 h-4" />{" "}
                </button>{" "}
              </div>{" "}
            </>
          )}{" "}
        </div>{" "}
        {/* Footer info note */}{" "}
        <div className="bg-slate-950 p-3 text-center border-t border-slate-800/80 text-[10px] text-slate-500 shrink-0">
          {" "}
           {t("🔒 Transparent 0% Commission Policy • Instant automatic activation • No hidden charges")} {" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
