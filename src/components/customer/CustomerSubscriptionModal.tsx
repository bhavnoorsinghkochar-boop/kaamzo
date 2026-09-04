import React, { useState } from "react";
import {
  Crown,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  X,
  ArrowRight,
  Gift,
  FileText,
  PhoneCall,
  QrCode,
  CreditCard,
  Building2,
  Calendar,
} from "lucide-react";
import { CustomerProfile } from "../../types";
import { playSound } from "../../utils/audio";
import { useTranslation } from "react-i18next";

interface CustomerSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProfile;
  onSubscribe: (
    method: "UPI" | "CARD" | "NET_BANKING",
  ) =>
    | Promise<{ success: boolean; message: string }>
    | { success: boolean; message: string };
}
export const CustomerSubscriptionModal: React.FC<
  CustomerSubscriptionModalProps
> = ({ isOpen, onClose, customer, onSubscribe }) => {
    const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<
    "UPI" | "CARD" | "NET_BANKING"
  >("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  if (!isOpen) return null;
  const PRICE = 15000;
  const isAlreadyPremium = customer.isPremiumCustomer;
  const expiryDateFormatted = customer.premiumCustomerExpiresAt
    ? new Date(customer.premiumCustomerExpiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const handleActivate = async () => {
    setIsProcessing(true);
    playSound("click");
    try {
      if (selectedMethod === "UPI") {
        setShowUpiQr(true);
      } else {
        const res = await onSubscribe(selectedMethod);
        if (res.success) {
          setShowSuccessState(true);
          playSound("success");
        }
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
        playSound("success");
      }
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {" "}
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-300 relative max-h-[92vh] flex flex-col">
        {" "}
        {/* Header Ribbon */}{" "}
        <div className="relative bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-5 text-slate-950 flex items-center justify-between shrink-0">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="w-11 h-11 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-lg border border-amber-300 shrink-0">
              {" "}
              <Crown className="w-6 h-6 animate-pulse" />{" "}
            </div>{" "}
            <div>
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full">
                  {" "}
                   {t("Customer Gold Club")} {" "}
                </span>{" "}
                {isAlreadyPremium && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-700 text-white px-2 py-0.5 rounded-full">
                    {" "}
                     {t("Active Member")} {" "}
                  </span>
                )}{" "}
              </div>{" "}
              <h2 className="text-xl font-black tracking-tight text-slate-950 leading-tight">
                {" "}
                 {t("Dihadi Gold Membership (₹15,000)")} {" "}
              </h2>{" "}
            </div>{" "}
          </div>{" "}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 flex items-center justify-center transition"
          >
            {" "}
            <X className="w-5 h-5" />{" "}
          </button>{" "}
        </div>{" "}
        {/* Scrollable Content Body */}{" "}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-slate-900">
          {" "}
          {showSuccessState ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              {" "}
              <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-600 mx-auto flex items-center justify-center shadow-lg">
                {" "}
                <CheckCircle2 className="w-8 h-8" />{" "}
              </div>{" "}
              <div className="space-y-1">
                {" "}
                <h3 className="text-xl font-black text-slate-900">
                   {t("Welcome to Dihadi Gold Club!")} </h3>{" "}
                <p className="text-xs text-amber-700 font-bold">
                  {" "}
                  ₹{PRICE.toLocaleString("en-IN")}  {t("Subscription Initiated & Received in Admin Account")} {" "}
                </p>{" "}
                <p className="text-xs text-slate-600 pt-1">
                  {" "}
                   {t("When you hire workers, the")} {" "}
                  <strong>
                     {t("Admin will automatically disburse worker wages directly to their wallet")} </strong>{" "}
                   {t("with ₹0 platform surcharge for the next 30 days!")} {" "}
                </p>{" "}
              </div>{" "}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-slate-600">
                     {t("Admin Account Balance Received:")} </span>{" "}
                  <span className="font-black text-amber-700 font-mono">
                    ₹{PRICE.toLocaleString("en-IN")}
                  </span>{" "}
                </div>{" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-slate-600">
                     {t("Worker Wage Auto-Disbursement:")} </span>{" "}
                  <span className="font-bold text-amber-700">
                     {t("⚡ Auto-Paid by Admin to Worker Wallet")} </span>{" "}
                </div>{" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-slate-600">
                     {t("Free Service Duration:")} </span>{" "}
                  <span className="font-black text-amber-800">
                     {t("1 Month (30 Days)")} </span>{" "}
                </div>{" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-slate-600">
                     {t("Platform Surcharge:")} </span>{" "}
                  <span className="font-black text-amber-600">
                     {t("₹0 (100% Free)")} </span>{" "}
                </div>{" "}
              </div>{" "}
              <button
                onClick={() => {
                  setShowSuccessState(false);
                  onClose();
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl transition shadow-md"
              >
                {" "}
                 {t("Hire Workers with 1 Month Free Service")} {" "}
              </button>{" "}
            </div>
          ) : showUpiQr ? (
            /* UPI QR Modal Screen */ <div className="space-y-4 text-center animate-in fade-in">
              {" "}
              <div className="space-y-1">
                {" "}
                <h3 className="text-lg font-black text-slate-900">
                   {t("Scan UPI QR to Pay ₹")} {PRICE.toLocaleString("en-IN")}
                </h3>{" "}
                <p className="text-xs text-slate-500">
                  {" "}
                   {t("Payment routes directly to Dihadi Admin Escrow Account")} {" "}
                </p>{" "}
              </div>{" "}
              <div className="bg-white p-4 rounded-2xl max-w-[200px] mx-auto shadow-lg border-2 border-amber-400 flex flex-col items-center">
                {" "}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi:
// pay?pa=dihadi.admin@okhdfcbank&pn=Dihadi%20Admin%20Treasury&am=${PRICE}&cu=INR&tn=Customer%20Gold%2015000%20Subscription`)}`}
                  alt={t("UPI QR")}
                  className="w-36 h-36 rounded-lg"
                />{" "}
                <span className="text-[10px] text-slate-600 font-mono font-bold mt-2">
                  {" "}
                   {t("dihadi.admin@okhdfcbank")} {" "}
                </span>{" "}
              </div>{" "}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-left space-y-1.5">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-slate-500">
                     {t("Destination Account:")} </span>{" "}
                  <span className="font-bold text-amber-700">
                     {t("Dihadi Admin Treasury")} </span>{" "}
                </div>{" "}
                <div className="flex items-center justify-between font-mono">
                  {" "}
                  <span className="text-slate-500">
                     {t("Subscription Amount:")} </span>{" "}
                  <span className="font-black text-slate-900 text-sm">
                    ₹{PRICE.toLocaleString("en-IN")}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex gap-2">
                {" "}
                <button
                  onClick={() => setShowUpiQr(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  {" "}
                   {t("Back")} {" "}
                </button>{" "}
                <button
                  onClick={handleConfirmUpiPayment}
                  disabled={isProcessing}
                  className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
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
            /* Main Customer Plan Screen */ <>
              {" "}
              {/* Active Plan Banner if already subscribed */}{" "}
              {isAlreadyPremium && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-center justify-between">
                  {" "}
                  <div className="space-y-0.5">
                    {" "}
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      {" "}
                       {t("Active Gold Membership")} {" "}
                    </span>{" "}
                    <p className="text-xs font-black text-slate-900">
                      {" "}
                       {t("1 Month Free Service Active")} {" "}
                      {expiryDateFormatted &&
                        `(Until ${expiryDateFormatted})`}{" "}
                    </p>{" "}
                    <p className="text-[11px] text-amber-800 font-medium">
                      {" "}
                       {t("✨ Worker wages auto-disbursed by Admin directly to worker wallets!")} {" "}
                    </p>{" "}
                  </div>{" "}
                  <span className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-black">
                    {" "}
                     {t("Active")} {" "}
                  </span>{" "}
                </div>
              )}{" "}
              {/* Price Offer Card */}{" "}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/20 to-amber-500/10 border-2 border-amber-400 rounded-3xl p-5 relative overflow-hidden">
                {" "}
                <div className="flex items-baseline justify-between">
                  {" "}
                  <div>
                    {" "}
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                      {" "}
                       {t("Customer Gold Subscription")} {" "}
                    </span>{" "}
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      {" "}
                      <span className="text-3xl font-black text-slate-950 font-mono">
                        ₹{PRICE.toLocaleString("en-IN")}
                      </span>{" "}
                      <span className="text-xs text-slate-600 font-medium">
                         {t("/ 1 Month Free Service")} </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-xs font-black shadow-xs">
                    {" "}
                     {t("⭐ ₹15,000 Plan")} {" "}
                  </span>{" "}
                </div>{" "}
                <div className="mt-3 pt-3 border-t border-amber-300/80 flex items-center gap-2 text-xs text-amber-950 font-bold">
                  {" "}
                  <Gift className="w-4 h-4 text-amber-600 shrink-0" />{" "}
                  <span>
                     {t("Money credited directly to Admin Account • Admin auto-pays worker wages to their wallet!")} </span>{" "}
                </div>{" "}
              </div>{" "}
              {/* Key Benefits */}{" "}
              <div className="space-y-2.5">
                {" "}
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {" "}
                   {t("Exclusive Gold Member Privileges:")} {" "}
                </h4>{" "}
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {" "}
                  <div className="flex items-start gap-2.5 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                    {" "}
                    <Building2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />{" "}
                    <div>
                      {" "}
                      <strong className="text-slate-900">
                         {t("Admin Auto-Pays Worker Wallets:")} </strong>{" "}
                      <p className="text-slate-600 text-[11px]">
                        {" "}
                         {t("When you hire a worker, the platform Admin automatically transfers the worker's earnings straight to their wallet from the admin treasury.")} {" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {" "}
                    <Gift className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />{" "}
                    <div>
                      {" "}
                      <strong className="text-slate-900">
                         {t("1 Month Free Service (Zero Booking Fees):")} </strong>{" "}
                      <p className="text-slate-500 text-[11px]">
                        {" "}
                         {t("Post unlimited jobs and hire masons, plumbers, electricians with ₹0 platform surcharge.")} {" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {" "}
                    <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />{" "}
                    <div>
                      {" "}
                      <strong className="text-slate-900">
                         {t("Priority 10km GPS Radar Broadcast:")} </strong>{" "}
                      <p className="text-slate-500 text-[11px]">
                        {" "}
                         {t("Your job alert is highlighted at the top of nearby worker feeds with priority sirens.")} {" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {" "}
                    <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />{" "}
                    <div>
                      {" "}
                      <strong className="text-slate-900">
                         {t("Free Verified KYC Dossier Reports:")} </strong>{" "}
                      <p className="text-slate-500 text-[11px]">
                        {" "}
                         {t("Download official verified background and Aadhaar KYC performance PDF dossiers for free.")} {" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {" "}
                    <PhoneCall className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />{" "}
                    <div>
                      {" "}
                      <strong className="text-slate-900">
                         {t("Dedicated Priority Helpline:")} </strong>{" "}
                      <p className="text-slate-500 text-[11px]">
                        {" "}
                         {t("Direct phone line to our emergency supervisor for quick worker replacement or dispute help.")} {" "}
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Payment Methods */}{" "}
              <div className="space-y-3 pt-1">
                {" "}
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {" "}
                   {t("Select Payment Method:")} {" "}
                </h4>{" "}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {" "}
                  <div
                    onClick={() => setSelectedMethod("UPI")}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2.5 ${selectedMethod === "UPI" ? "bg-amber-50 border-amber-500 text-slate-950 font-bold" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {" "}
                    <QrCode className="w-4 h-4 text-amber-600 shrink-0" />{" "}
                    <div>
                      {" "}
                      <div className="font-black text-[11px]">
                         {t("UPI / QR Code")} </div>{" "}
                      <div className="text-[9px] text-slate-400">
                         {t("GPay, PhonePe, Paytm")} </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div
                    onClick={() => setSelectedMethod("CARD")}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2.5 ${selectedMethod === "CARD" ? "bg-amber-50 border-amber-500 text-slate-950 font-bold" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {" "}
                    <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />{" "}
                    <div>
                      {" "}
                      <div className="font-black text-[11px]">
                         {t("Debit / Card")} </div>{" "}
                      <div className="text-[9px] text-slate-400">
                         {t("Instant Online Pay")} </div>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Upgrade CTA */}{" "}
              <div className="pt-2">
                {" "}
                <button
                  onClick={handleActivate}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {" "}
                  <Crown className="w-4 h-4" />{" "}
                  <span>
                    {" "}
                    {isProcessing
                      ? "Activating..."
                      : `Activate 1 Month Gold Plan for ₹${PRICE.toLocaleString("en-IN")}`}{" "}
                  </span>{" "}
                  <ArrowRight className="w-4 h-4" />{" "}
                </button>{" "}
              </div>{" "}
            </>
          )}{" "}
        </div>{" "}
        {/* Footer info */}{" "}
        <div className="bg-slate-50 p-3 text-center border-t border-slate-200 text-[10px] text-slate-500 shrink-0">
          {" "}
           {t("🛡️ Safe & Secure Payment • Payment deposited into Admin Account • Auto-Wallet Payouts Enabled")} {" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
