import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getT } from "../../utils/translations";
import { GoogleSSOButton } from "../common/GoogleSSOButton";
import {
  Shield,
  Check,
  X,
  FileText,
  ArrowLeft,
  LogOut,
  Lock,
  Sparkles,
  Users,
  Building2,
  TrendingUp,
  User,
  AlertCircle,
  HardHat,
  ShieldCheck,
  ShieldAlert,
  Search,
  Briefcase,
  Coins,
  Wallet,
  Crown,
  ArrowDownRight,
  ArrowUpRight,
  MessageCircle,
  Send,
  Clock,
} from "lucide-react";
import { AdminSupportChatHub } from "./AdminSupportChatHub";
import { useTranslation } from "react-i18next";

interface AdminDashboardProps {
  isEmbedded?: boolean;
}
export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isEmbedded = false,
}) => {
    const { t } = useTranslation();
  const {
    currentAdmin,
    loginAdminWithAuth,
    logoutAdmin,
    workers,
    jobs,
    verifications,
    verifyWorkerByAdmin,
    verifyWorkerDirectly,
    seedMoreWorkersForVerification,
    setCurrentRole,
    currentLanguage,
    adminTreasuryBalance,
    adminSubscriptionRevenue,
    adminWorkerPayoutsDisbursed,
    adminTransactions,
    disburseWorkerWageFromAdmin,
    subscribeCustomerPremium,
    currentCustomer,
    resetToZero,
    seedSampleData,
  } = useApp();
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  /* Admin navigation tabs: 'treasury' | 'kyc' | 'workers' | 'jobs' */ const [
    adminTab,
    setAdminTab,
  ] = useState<"treasury" | "kyc" | "workers" | "jobs" | "support">("treasury");
  /* KYC sub-filter: 'pending' | 'approved' | 'all' */ const [
    kycFilter,
    setKycFilter,
  ] = useState<"pending" | "approved" | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = loginAdminWithAuth(adminId, adminPassword);
    if (!res.success) {
      setAuthError(res.error || getT(currentLanguage, "auth_error_invalid"));
    }
  };
  /* IF NOT LOGGED IN: Show Admin Login */ if (!currentAdmin) {
    return (
      <div
        className={`bg-slate-900 text-slate-100 flex flex-col h-full overflow-y-auto select-none ${isEmbedded ? "w-full rounded-3xl border border-slate-700" : "max-w-md mx-auto rounded-3xl border border-slate-700 shadow-2xl"}`}
      >
        {" "}
        <div className="p-5 bg-slate-800 border-b border-slate-700 shrink-0 rounded-t-3xl">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <button
                onClick={() => setCurrentRole("select_role")}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition"
                title={getT(currentLanguage, "back_to_role_selection")}
              >
                {" "}
                <ArrowLeft className="w-4 h-4" />{" "}
              </button>{" "}
              <div>
                {" "}
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  {" "}
                  <Shield className="w-5 h-5 text-amber-400" />{" "}
                  {getT(currentLanguage, "role_admin_title")}{" "}
                </h3>{" "}
                <p className="text-xs text-slate-400">
                  {" "}
                  {getT(currentLanguage, "auth_tab_login")}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="p-5 space-y-4 flex-1">
          {/* Strict Admin Whitelist Notice */}
          {authError && (
            <div className="bg-rose-950/70 border border-rose-800 text-rose-200 text-xs p-3 rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                {getT(currentLanguage, "admin_email_label")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("bhavnoorsinghkochar@gmail.com")}
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-amber-500 pl-8 font-mono"
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                {getT(currentLanguage, "auth_password_label")}
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder={t("admin")}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-amber-500 pl-8 font-mono"
                  required
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{getT(currentLanguage, "auth_login_btn")}</span>
            </button>

            <div className="pt-2">
              <GoogleSSOButton
                roleTarget="admin"
                variant="dark"
                label={t("Sign in with Authorized Google Account")}
                onError={(err) => setAuthError(err)}
              />
            </div>
          </form>{" "}
        </div>{" "}
      </div>
    );
  }
  /* IF LOGGED IN: Admin Dashboard Calculations */ const activeWorkersCount =
    workers.filter((w) => w.isOnline).length;
  const verifiedWorkersCount = workers.filter((w) => w.isVerified).length;
  const unfilledJobsCount = jobs.filter((j) => j.status === "broadcast").length;
  const pendingVerifications = verifications.filter(
    (v) => v.status === "pending",
  );
  const approvedVerifications = verifications.filter(
    (v) => v.status === "approved",
  );
  const filteredVerifications = verifications.filter((v) => {
    if (kycFilter === "pending") return v.status === "pending";
    if (kycFilter === "approved") return v.status === "approved";
    return true;
  });
  const filteredWorkers = workers.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.phone.includes(q) ||
      w.primaryTrade.toLowerCase().includes(q) ||
      w.location.area.toLowerCase().includes(q)
    );
  });
  const totalCommissionRevenue = jobs
    .filter((j) => j.isPaid)
    .reduce((acc, j) => acc + j.platformFee, 0);
  const totalGMV = jobs
    .filter((j) => j.isPaid)
    .reduce((acc, j) => acc + j.dailyWage, 0);
  return (
    <div
      className={`bg-slate-900 text-slate-100 flex flex-col h-full overflow-hidden select-none ${isEmbedded ? "w-full rounded-3xl border border-slate-700" : "max-w-2xl mx-auto rounded-3xl border border-slate-700 shadow-2xl"}`}
    >
      {" "}
      {/* Header */}{" "}
      <div className="bg-slate-800 rounded-t-3xl p-4 sm:p-5 border-b border-slate-700 shrink-0">
        {" "}
        <div className="flex justify-between items-start mb-2">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              {" "}
              <Shield className="w-5 h-5" />{" "}
            </div>{" "}
            <div>
              {" "}
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {" "}
                {getT(currentLanguage, "role_admin_badge")}{" "}
              </span>{" "}
              <h2 className="text-base font-bold text-white leading-tight">
                {" "}
                {getT(currentLanguage, "role_admin_title")}{" "}
              </h2>{" "}
            </div>{" "}
          </div>{" "}
                    <div className="flex items-center gap-2">
            <button
              onClick={() => seedSampleData()}
              className="px-2 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
              title={t("Seed Sample Data")}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline"> {t("Seed Data")} </span>
            </button>
            <button
              onClick={() => resetToZero()}
              className="px-2 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
              title={t("Reset Platform")}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline"> {t("Reset Platform")} </span>
            </button>
            <button
              onClick={logoutAdmin}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition"
              title={getT(currentLanguage, "auth_logout_btn")}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>{" "}
        </div>{" "}
        <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-700/60 pt-2 mt-2">
          {" "}
          <span>
            {currentAdmin.name} ({currentAdmin.email})
          </span>{" "}
          <span className="text-amber-400 font-bold flex items-center gap-1">
            {" "}
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>{" "}
             {t("Live Operations Active")} {" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      {/* Navigation Sub-Tabs */}{" "}
      <div className="flex border-b border-slate-800 bg-slate-900 text-xs font-bold shrink-0 px-2 pt-2 gap-1 overflow-x-auto">
        {" "}
        <button
          onClick={() => setAdminTab("treasury")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-t-xl text-center transition flex items-center justify-center gap-1.5 ${adminTab === "treasury" ? "bg-slate-800 text-amber-400 border-t-2 border-amber-500 shadow-xs" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}`}
        >
          {" "}
          <Coins className="w-3.5 h-3.5 text-amber-400" />{" "}
          <span> {t("Commission")} </span>{" "}
        </button>{" "}
        <button
          onClick={() => setAdminTab("kyc")}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-t-xl text-center transition flex items-center justify-center gap-1.5 ${adminTab === "kyc" ? "bg-slate-800 text-amber-400 border-t-2 border-amber-500" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}`}
        >
          {" "}
          <FileText className="w-3.5 h-3.5" />{" "}
          <span>{getT(currentLanguage, "admin_verification_queue")}</span>{" "}
          {pendingVerifications.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">
              {" "}
              {pendingVerifications.length}{" "}
            </span>
          )}{" "}
        </button>{" "}
        <button
          onClick={() => setAdminTab("workers")}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-t-xl text-center transition flex items-center justify-center gap-1.5 ${adminTab === "workers" ? "bg-slate-800 text-amber-400 border-t-2 border-amber-500" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}`}
        >
          {" "}
          <Users className="w-3.5 h-3.5" />{" "}
          <span>{getT(currentLanguage, "admin_tab_all_workers")}</span>{" "}
          <span className="px-1.5 py-0.2 bg-amber-500/30 text-amber-300 text-[10px] font-bold rounded-full">
            {" "}
            {workers.length}{" "}
          </span>{" "}
        </button>{" "}
        <button
          onClick={() => setAdminTab("support")}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-t-xl text-center transition flex items-center justify-center gap-1.5 ${adminTab === "support" ? "bg-slate-800 text-amber-400 border-t-2 border-amber-500 shadow-xs" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
          <span> {t("Support Chats")} </span>
        </button>
        <button
          onClick={() => setAdminTab("jobs")}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-t-xl text-center transition flex items-center justify-center gap-1.5 ${adminTab === "jobs" ? "bg-slate-800 text-amber-400 border-t-2 border-amber-500" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"}`}
        >
          {" "}
          <Briefcase className="w-3.5 h-3.5" />{" "}
          <span>{getT(currentLanguage, "admin_tab_live_jobs")}</span>{" "}
          <span className="px-1.5 py-0.2 bg-amber-500/30 text-amber-300 text-[10px] font-bold rounded-full">
            {" "}
            {jobs.length}{" "}
          </span>{" "}
        </button>{" "}
      </div>{" "}
      {/* Main Body */}{" "}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {" "}
        {/* Top 2 Metric Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
              <span> {t("KYC Verified")} </span>
              <ShieldCheck className="w-3 h-3 text-amber-400" />
            </div>
            <p className="text-lg font-black text-white font-mono">
              {verifiedWorkersCount}
            </p>
            <p className="text-[9px] text-amber-400 font-mono">
              {pendingVerifications.length}  {t("Pending")} </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
              <span> {t("Commission Earned")} </span>
              <Wallet className="w-3 h-3 text-emerald-400" />
            </div>
            <p className="text-lg font-black text-emerald-400 font-mono">
              ₹{jobs.reduce((sum, job) => sum + (job.platformFee || 0), 0).toLocaleString("en-IN")}
            </p>
            <p className="text-[9px] text-slate-400 font-mono">
               {t("From")} {jobs.filter(j => j.platformFee && j.platformFee > 0).length}  {t("jobs")} </p>
          </div>
        </div>

        {/* TAB 0: COMMISSION LOG */}
        {adminTab === "treasury" && (
          <div className="space-y-3">
            {/* Commission Highlight Banner */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-slate-800 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                       {t("Commission Revenue")} </h3>
                    <p className="text-[11px] text-slate-400">
                       {t("Record of platform fees collected from jobs.")} </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Commission Log */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                     {t("Commission Log (")} {jobs.filter(j => j.platformFee && j.platformFee > 0).length})
                  </span>
                </h4>
              </div>
              <div className="space-y-2">
                {jobs.filter(j => j.platformFee && j.platformFee > 0).length === 0 ? (
                  <p className="text-slate-400 text-center py-4">
                     {t("No commission recorded yet.")} </p>
                ) : (
                  jobs.filter(j => j.platformFee && j.platformFee > 0).map((job) => {
                    return (
                      <div
                        key={job.id}
                        className="bg-slate-800 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs leading-snug">
                              {job.trade}  {t("Job Commission")} </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {job.postedAt}  {t("• Cust:")} {job.customerName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400 text-sm font-mono">
                            +₹{(job.platformFee || 0).toLocaleString("en-IN")}
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono">
                            {job.id}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* TAB 1: KYC VERIFICATION QUEUE */}{" "}
        {adminTab === "kyc" && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
            {" "}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                  {" "}
                  <FileText className="w-4 h-4 text-amber-400" />{" "}
                  {getT(currentLanguage, "admin_verification_queue")}{" "}
                </h3>{" "}
                <button
                  type="button"
                  onClick={seedMoreWorkersForVerification}
                  className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                  title={t("Simulate a new worker registering with Aadhaar")}
                >
                  {" "}
                  <Sparkles className="w-3 h-3 text-amber-400" />{" "}
                  <span> {t("+ Add Candidate")} </span>{" "}
                </button>{" "}
              </div>{" "}
              {/* Sub-filter tabs */}{" "}
              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-[11px] font-bold">
                {" "}
                <button
                  onClick={() => setKycFilter("pending")}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${kycFilter === "pending" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {" "}
                  <span>
                    {getT(currentLanguage, "admin_tab_pending_kyc")}
                  </span>{" "}
                  <span className="text-[10px]">
                    ({pendingVerifications.length})
                  </span>{" "}
                </button>{" "}
                <button
                  onClick={() => setKycFilter("approved")}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${kycFilter === "approved" ? "bg-amber-600 text-white font-black" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {" "}
                  <span>
                    {getT(currentLanguage, "admin_tab_verified_kyc")}
                  </span>{" "}
                  <span className="text-[10px]">
                    ({approvedVerifications.length})
                  </span>{" "}
                </button>{" "}
                <button
                  onClick={() => setKycFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition ${kycFilter === "all" ? "bg-amber-600 text-white font-black" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {" "}
                  <span> {t("All (")} {verifications.length})</span>{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* List */}{" "}
            <div className="space-y-2.5">
              {" "}
              {filteredVerifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-800/80 rounded-xl space-y-1">
                  {" "}
                  <ShieldCheck className="w-6 h-6 text-slate-500 mx-auto" />{" "}
                  <p className="font-medium">
                    {" "}
                    {kycFilter === "pending"
                      ? getT(currentLanguage, "admin_no_pending_kyc")
                      : kycFilter === "approved"
                        ? getT(currentLanguage, "admin_no_approved_kyc")
                        : "No verification records found."}{" "}
                  </p>{" "}
                </div>
              ) : (
                filteredVerifications.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-3.5 space-y-2.5 shadow-sm"
                  >
                    {" "}
                    <div className="flex justify-between items-start">
                      {" "}
                      <div>
                        {" "}
                        <div className="flex items-center gap-2">
                          {" "}
                          <h4 className="font-bold text-white text-sm">
                            {req.workerName}
                          </h4>{" "}
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md flex items-center gap-1 ${req.status === "approved" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : req.status === "rejected" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}
                          >
                            {" "}
                            {req.status === "approved" ? (
                              <>
                                {" "}
                                <ShieldCheck className="w-3 h-3 text-amber-400" />{" "}
                                <span>
                                  {getT(
                                    currentLanguage,
                                    "admin_verified_status",
                                  )}
                                </span>{" "}
                              </>
                            ) : req.status === "rejected" ? (
                              <>
                                {" "}
                                <X className="w-3 h-3 text-amber-400" />{" "}
                                <span> {t("Rejected")} </span>{" "}
                              </>
                            ) : (
                              <>
                                {" "}
                                <ShieldAlert className="w-3 h-3 text-amber-400" />{" "}
                                <span> {t("Pending Approval")} </span>{" "}
                              </>
                            )}{" "}
                          </span>{" "}
                        </div>{" "}
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {req.trade} • {req.experienceYears}  {t("Years Experience")} </p>{" "}
                      </div>{" "}
                      <span className="text-[11px] font-mono text-amber-400">
                        {req.phone}
                      </span>{" "}
                    </div>{" "}
                    <div className="bg-slate-900/90 p-2.5 rounded-lg text-[11px] font-mono text-slate-300 flex justify-between items-center border border-slate-800">
                      {" "}
                      <span> {t("Aadhaar:")} {req.aadhaarNumber}</span>{" "}
                      <span
                        className={`font-bold ${req.status === "approved" ? "text-amber-400" : "text-amber-400"}`}
                      >
                        {" "}
                        {req.status === "approved"
                          ? "Govt. Aadhaar Validated"
                          : "Awaiting Review"}{" "}
                      </span>{" "}
                    </div>{" "}
                    <div className="flex gap-2 pt-1">
                      {" "}
                      {req.status === "pending" ? (
                        <>
                          {" "}
                          <button
                            onClick={() =>
                              verifyWorkerByAdmin(req.id, "approved")
                            }
                            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            {" "}
                            <Check className="w-4 h-4" />{" "}
                            <span>
                              {getT(currentLanguage, "admin_verify_btn")}
                            </span>{" "}
                          </button>{" "}
                          <button
                            onClick={() =>
                              verifyWorkerByAdmin(req.id, "rejected")
                            }
                            className="px-4 bg-slate-700 hover:bg-amber-900/60 text-slate-300 hover:text-amber-200 font-bold py-2 rounded-lg transition flex items-center justify-center gap-1"
                          >
                            {" "}
                            <X className="w-4 h-4" />{" "}
                            <span>
                              {getT(currentLanguage, "admin_reject_btn")}
                            </span>{" "}
                          </button>{" "}
                        </>
                      ) : req.status === "approved" ? (
                        <div className="flex w-full items-center justify-between">
                          {" "}
                          <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                            {" "}
                            <Check className="w-3.5 h-3.5" />  {t("Verified & Visible to Customers")} {" "}
                          </span>{" "}
                          <button
                            onClick={() =>
                              verifyWorkerByAdmin(req.id, "rejected")
                            }
                            className="px-3 py-1 bg-slate-700/80 hover:bg-amber-900/50 text-slate-400 hover:text-amber-300 rounded-lg text-[10px] font-bold transition"
                          >
                            {" "}
                            {getT(currentLanguage, "admin_revoke_btn")}{" "}
                          </button>{" "}
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            verifyWorkerByAdmin(req.id, "approved")
                          }
                          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1"
                        >
                          {" "}
                          <Check className="w-3.5 h-3.5" />{" "}
                          <span> {t("Re-approve & Verify Worker")} </span>{" "}
                        </button>
                      )}{" "}
                    </div>{" "}
                  </div>
                ))
              )}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {adminTab === "support" && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
             <AdminSupportChatHub />
          </div>
        )}
        {/* TAB 2: REGISTERED WORKERS DIRECTORY */}{" "}
        {adminTab === "workers" && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-3">
            {" "}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {" "}
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                {" "}
                <Users className="w-4 h-4 text-amber-400" />{" "}
                {getT(currentLanguage, "admin_all_registered_workers")} (
                {workers.length}){" "}
              </h3>{" "}
              <div className="relative">
                {" "}
                <input
                  type="text"
                  placeholder={t("Search name, phone, trade...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1 text-xs text-white pl-7 focus:outline-amber-500 w-full sm:w-56"
                />{" "}
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              {filteredWorkers.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-800 rounded-xl">
                  {" "}
                  {getT(currentLanguage, "admin_no_workers_found")}{" "}
                </div>
              ) : (
                filteredWorkers.map((w) => (
                  <div
                    key={w.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    {" "}
                    <div className="flex items-center gap-3">
                      {" "}
                      <div className="relative">
                        {" "}
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/40">
                          {" "}
                          {w.name.charAt(0)}{" "}
                        </div>{" "}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${w.isOnline ? "bg-amber-500" : "bg-slate-500"}`}
                        />{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <div className="flex items-center gap-2">
                          {" "}
                          <h4 className="font-bold text-white text-sm">
                            {w.name}
                          </h4>{" "}
                          <span
                            className={`px-2 py-0.2 text-[10px] font-bold rounded-md flex items-center gap-1 ${w.isVerified ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}
                          >
                            {" "}
                            <ShieldCheck
                              className={`w-3 h-3 ${w.isVerified ? "text-amber-400" : "text-amber-400"}`}
                            />{" "}
                            {w.isVerified
                              ? getT(currentLanguage, "admin_verified_status")
                              : getT(
                                  currentLanguage,
                                  "admin_unverified_status",
                                )}{" "}
                          </span>{" "}
                        </div>{" "}
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {" "}
                          {w.primaryTrade} • {w.phone} • {w.location.area} • ₹
                          {w.dailyRate} {t("/day")} {" "}
                        </p>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {" "}
                      {!w.isVerified ? (
                        <button
                          onClick={() => verifyWorkerDirectly(w.id, "approved")}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-xs"
                        >
                          {" "}
                          <Check className="w-3.5 h-3.5" />{" "}
                          <span>
                            {getT(currentLanguage, "admin_verify_now")}
                          </span>{" "}
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-amber-950/60 border border-amber-700/60 text-amber-300 font-bold rounded-lg text-[11px] flex items-center gap-1">
                          {" "}
                          <Check className="w-3.5 h-3.5 text-amber-400" />{" "}
                          <span> {t("Verified")} </span>{" "}
                        </span>
                      )}{" "}
                    </div>{" "}
                  </div>
                ))
              )}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {/* TAB 3: LIVE SYSTEM JOBS */}{" "}
        {adminTab === "jobs" && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-2.5">
            {" "}
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
              {" "}
              <Briefcase className="w-4 h-4 text-amber-400" />{" "}
              <span> {t("Live System Jobs (")} {jobs.length})</span>{" "}
            </h3>{" "}
            <div className="space-y-2">
              {" "}
              {jobs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-800 rounded-xl">
                  {" "}
                   {t("No active jobs currently in database.")} {" "}
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-2"
                  >
                    {" "}
                    <div className="flex justify-between items-start">
                      {" "}
                      <div>
                        {" "}
                        <p className="font-bold text-white text-sm">
                          {job.title}
                        </p>{" "}
                        <p className="text-[11px] text-slate-400">
                          {" "}
                          {job.trade} • {job.area}  {t("• Employer:")} {" "}
                          {job.customerName} ({job.customerPhone}){" "}
                        </p>{" "}
                      </div>{" "}
                      <div className="text-right">
                        {" "}
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          ₹{job.dailyWage}
                        </span>{" "}
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">
                          {job.status}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="flex items-center justify-between text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-slate-300">
                      {" "}
                      <span>
                         {t("Assigned:")} {" "}
                        <strong className="text-amber-400">
                          {job.assignedWorkerName || "Broadcasting"}
                        </strong>
                      </span>{" "}
                      <span>
                         {t("Worker Payout:")} <strong>₹{job.workerPayout}</strong>  {t("| Commission:")} {" "}
                        <strong className="text-amber-400">
                          ₹{job.platformFee}
                        </strong>
                      </span>{" "}
                    </div>{" "}
                  </div>
                ))
              )}

            </div>{" "}
          </div>
        )}
        {adminTab === "support" && (
          <div className="shadow-xl">
             <AdminSupportChatHub />
          </div>
        )}
        {" "}
      </div>{" "}
    </div>
  );
};
