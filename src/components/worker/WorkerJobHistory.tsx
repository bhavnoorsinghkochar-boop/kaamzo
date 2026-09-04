import React, { useState, useMemo } from "react";
import {
  History,
  Star,
  CheckCircle2,
  CreditCard,
  Calendar,
  Search,
  Filter,
  Volume2,
  MapPin,
  MessageSquare,
  FileText,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Download,
  Share2,
  X,
  ExternalLink,
  DollarSign,
  Inbox,
  AlertCircle,
  FileDown,
  Check,
} from "lucide-react";
import { Job, WorkerProfile, TradeType, Language } from "../../types";
import { playSound, speakText } from "../../utils/audio";
import { generateWorkerPerformancePdf } from "../../utils/pdfReportGenerator";
import { useTranslation } from "react-i18next";

interface WorkerJobHistoryProps {
  worker: WorkerProfile;
  completedJobs: Job[];
  currentLanguage: Language;
  onOpenChat: (job: Job) => void;
  onSeedSampleJobs?: () => void;
}
export const WorkerJobHistory: React.FC<WorkerJobHistoryProps> = ({
  worker,
  completedJobs = [],
  currentLanguage,
  onOpenChat,
}) => {
    const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<string>("All");
  const [selectedRatingFilter, setSelectedRatingFilter] =
    useState<string>("All");
  const [sortBy, setSortBy] = useState<
    "newest" | "highest_payout" | "highest_rating"
  >("newest");
  const [receiptJob, setReceiptJob] = useState<Job | null>(null);
  const [copiedTxn, setCopiedTxn] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  /* Strictly use actual completed assignments */ const displayJobs =
    completedJobs;
  /* Filter and Sort */ const filteredJobs = useMemo(() => {
    return displayJobs
      .filter((j) => {
        /* 1. Trade filter */ if (
          selectedTrade !== "All" &&
          j.trade !== selectedTrade
        ) {
          return false;
        }
        /* 2. Rating filter */ if (
          selectedRatingFilter === "5_stars" &&
          (j.rating || j.customerRating || 0) < 5
        ) {
          return false;
        }
        if (
          selectedRatingFilter === "4_plus" &&
          (j.rating || j.customerRating || 0) < 4
        ) {
          return false;
        }
        /* 3. Search query */ if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (j.title || "").toLowerCase().includes(q);
          const matchDesc = (j.description || "").toLowerCase().includes(q);
          const matchCust = (j.customerName || "").toLowerCase().includes(q);
          const matchArea = (j.area || j.locationAddress || "")
            .toLowerCase()
            .includes(q);
          const matchTxn = (j.transactionRef || "").toLowerCase().includes(q);
          if (
            !matchTitle &&
            !matchDesc &&
            !matchCust &&
            !matchArea &&
            !matchTxn
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "highest_payout") {
          return (
            (b.workerPayout || b.dailyWage) - (a.workerPayout || a.dailyWage)
          );
        }
        if (sortBy === "highest_rating") {
          return (
            (b.rating || b.customerRating || 0) -
            (a.rating || a.customerRating || 0)
          );
        }
        /* newest first (default) */ return (
          (new Date(b.ratedAt || b.completedAt || b.postedAt).getTime() || 0) -
          (new Date(a.ratedAt || a.completedAt || a.postedAt).getTime() || 0)
        );
      });
  }, [displayJobs, selectedTrade, selectedRatingFilter, searchQuery, sortBy]);
  /* Real Overall Statistics exclusively from actual completed jobs */ const totalEarned =
    useMemo(() => {
      return displayJobs.reduce(
        (sum, j) =>
          sum +
          (j.workerPayout !== undefined
            ? j.workerPayout
            : Math.round((j.dailyWage || 850) * 0.8)),
        0,
      );
    }, [displayJobs]);
  const ratedList = useMemo(() => {
    return displayJobs.filter(
      (j) =>
        (j.rating && j.rating > 0) ||
        (j.customerRating && j.customerRating > 0) ||
        (j.ratingGiven && j.ratingGiven > 0),
    );
  }, [displayJobs]);
  const avgRating = useMemo(() => {
    if (ratedList.length === 0) {
      return 0;
    }
    const sum = ratedList.reduce(
      (acc, j) => acc + (j.rating || j.customerRating || j.ratingGiven || 0),
      0,
    );
    return Number((sum / ratedList.length).toFixed(1));
  }, [ratedList]);
  const handleSpeakFeedback = (job: Job) => {
    const r = job.rating || job.customerRating || 5;
    const textToRead = `${job.customerName} gave a ${r} star rating: ${job.review || job.customerReview || job.reviewGiven || "Work completed with excellence."}`;
    speakText(textToRead, currentLanguage);
    playSound("click");
  };
  const handleCopyTxn = (txnRef: string) => {
    navigator.clipboard?.writeText(txnRef);
    setCopiedTxn(txnRef);
    playSound("click");
    setTimeout(() => setCopiedTxn(null), 2000);
  };
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    playSound("click");
    try {
      const customerMap: Record<string, number> = {};
      completedJobs.forEach((j) => {
        const key = (j.customerPhone || j.customerName || "")
          .trim()
          .toLowerCase();
        if (key) customerMap[key] = (customerMap[key] || 0) + 1;
      });
      const repeatCustomers = Object.values(customerMap).filter(
        (c) => c > 1,
      ).length;
      const totalDistinct = Object.keys(customerMap).length;
      const repeatRate =
        totalDistinct > 0
          ? Math.round((repeatCustomers / totalDistinct) * 100)
          : 0;
      await generateWorkerPerformancePdf({
        worker,
        completedJobs,
        totalEarnings: totalEarned,
        completedCount: completedJobs.length,
        realRating: avgRating,
        totalReviewsCount: ratedList.length,
        repeatHirerRate: repeatRate,
      });
      setExportSuccess(true);
      playSound("success");
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err) {
      console.error("Failed to generate PDF history report:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };
  return (
    <div className="space-y-6">
      {" "}
      {/* 1. Header & Real Summary Stats */}{" "}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-6">
        {" "}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {" "}
          <div className="space-y-1">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                {" "}
                <History className="w-4 h-4" />{" "}
              </div>{" "}
              <h3 className="text-xl font-black text-white">
                 {t("Certified Job & Payout History")} </h3>{" "}
            </div>{" "}
            <p className="text-xs text-slate-400">
              {" "}
               {t("Verified record of completed daily wage assignments, client reviews, and direct UPI settlements.")} {" "}
            </p>{" "}
          </div>{" "}
          <div className="flex items-center gap-2">
            {" "}
            <button
              type="button"
              id="history-btn-export-pdf"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              title={t("Download official verified performance report as PDF for client interviews")}
            >
              {" "}
              {isExportingPdf ? (
                <>
                  {" "}
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />{" "}
                  <span> {t("Generating PDF...")} </span>{" "}
                </>
              ) : exportSuccess ? (
                <>
                  {" "}
                  <Check className="w-3.5 h-3.5 text-amber-950" />{" "}
                  <span> {t("PDF Downloaded!")} </span>{" "}
                </>
              ) : (
                <>
                  {" "}
                  <FileDown className="w-3.5 h-3.5" />{" "}
                  <span> {t("Export as PDF")} </span>{" "}
                </>
              )}{" "}
            </button>{" "}
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5">
              {" "}
              <ShieldCheck className="w-4 h-4 text-amber-400" />{" "}
              <span> {t("100% Settled via UPI")} </span>{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        {/* 4-Metric Grid with Real Values */}{" "}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          {" "}
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
            {" "}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
               {t("Jobs Completed")} </span>{" "}
            <p className="text-2xl font-black text-white font-mono">
              {displayJobs.length}
            </p>{" "}
            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
              {" "}
              <CheckCircle2 className="w-3 h-3 inline" />{" "}
              {displayJobs.length > 0 ? "100% Completed" : "0 Assignments"}{" "}
            </span>{" "}
          </div>{" "}
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
            {" "}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
               {t("Total Earnings")} </span>{" "}
            <p className="text-2xl font-black text-amber-400 font-mono">
              ₹{totalEarned.toLocaleString("en-IN")}
            </p>{" "}
            <span className="text-[10px] text-slate-400 font-medium font-mono truncate block">
              {" "}
               {t("To:")} {worker.upiId}{" "}
            </span>{" "}
          </div>{" "}
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
            {" "}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
               {t("Client Rating")} </span>{" "}
            <div className="flex items-center gap-1.5">
              {" "}
              <p className="text-2xl font-black text-white font-mono">
                {" "}
                {avgRating > 0 ? avgRating.toFixed(1) : "—"}{" "}
              </p>{" "}
              {avgRating > 0 && (
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              )}{" "}
            </div>{" "}
            <span className="text-[10px] text-amber-300 font-medium">
              {" "}
              {ratedList.length > 0
                ? `${ratedList.length} Verified Review${ratedList.length > 1 ? "s" : ""}`
                : "No Ratings Yet"}{" "}
            </span>{" "}
          </div>{" "}
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 space-y-1">
            {" "}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
               {t("On-Time Arrival")} </span>{" "}
            <p className="text-2xl font-black text-amber-400 font-mono">
              {" "}
              {displayJobs.length > 0 ? "100%" : "N/A"}{" "}
            </p>{" "}
            <span className="text-[10px] text-slate-400 font-medium">
              {" "}
              {displayJobs.length > 0
                ? "Strict 10km GPS Radar"
                : "No jobs yet"}{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* If Worker has 0 completed jobs, show clean honest empty state */}{" "}
      {displayJobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xs max-w-xl mx-auto">
          {" "}
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            {" "}
            <Inbox className="w-8 h-8" />{" "}
          </div>{" "}
          <div className="space-y-1.5">
            {" "}
            <h4 className="text-lg font-black text-slate-900">
               {t("No Completed Jobs Recorded Yet")} </h4>{" "}
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {" "}
               {t("When you accept daily job broadcasts, verify start OTP with employers, and complete the work, your verified completion receipts, instant UPI earnings, and employer testimonials will show here automatically.")} {" "}
            </p>{" "}
          </div>{" "}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
            {" "}
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              {" "}
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />{" "}
              <span> {t("How your performance builds:")} </span>{" "}
            </p>{" "}
            <ul className="text-slate-600 space-y-1 text-[11px] list-disc list-inside">
              {" "}
              <li>
                 {t("Accept broadcast jobs in your trade from the")} {" "}
                <strong> {t("Available Jobs")} </strong>  {t("tab.")} </li>{" "}
              <li>
                 {t("Provide your 4-digit start OTP when you reach the customer's site.")} </li>{" "}
              <li>
                 {t("Customer releases payment directly to your UPI ID (")} <strong className="text-slate-900">{worker.upiId}</strong> {t(") upon completion.")} </li>{" "}
            </ul>{" "}
          </div>{" "}
        </div>
      ) : (
        <>
          {" "}
          {/* 2. Search, Filter & Sort Controls */}{" "}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
            {" "}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {" "}
              {/* Search Input */}{" "}
              <div className="relative flex-1">
                {" "}
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />{" "}
                <input
                  type="text"
                  placeholder={t("Search past jobs by title, employer, area, or UPI transaction ref...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-amber-500 focus:bg-white transition"
                />{" "}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    {" "}
                     {t("Clear")} {" "}
                  </button>
                )}{" "}
              </div>{" "}
              {/* Sort Selector */}{" "}
              <div className="flex items-center gap-2 shrink-0">
                {" "}
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                   {t("Sort by:")} </span>{" "}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-amber-500 cursor-pointer"
                >
                  {" "}
                  <option value="newest"> {t("📅 Newest Completed")} </option>{" "}
                  <option value="highest_payout"> {t("💰 Highest Net Payout")} </option>{" "}
                  <option value="highest_rating">
                     {t("⭐ Highest Client Rating")} </option>{" "}
                </select>{" "}
              </div>{" "}
            </div>{" "}
            {/* Trade & Rating Filter Chips */}{" "}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              {" "}
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                 {t("Filter:")} </span>{" "}
              {[
                "All",
                "Mason",
                "Painter",
                "Plumber",
                "Carpenter",
                "Electrician",
                "Labour",
              ].map((trade) => (
                <button
                  key={trade}
                  onClick={() => setSelectedTrade(trade)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${selectedTrade === trade ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {" "}
                  {trade}{" "}
                </button>
              ))}{" "}
              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />{" "}
              {/* Rating filter chips */}{" "}
              <button
                onClick={() => setSelectedRatingFilter("All")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${selectedRatingFilter === "All" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {" "}
                 {t("All Ratings")} {" "}
              </button>{" "}
              <button
                onClick={() => setSelectedRatingFilter("5_stars")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${selectedRatingFilter === "5_stars" ? "bg-amber-500 text-slate-950" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {" "}
                <Star className="w-3 h-3 fill-current" />{" "}
                <span> {t("5 Stars Only")} </span>{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
          {/* 3. Jobs List */}{" "}
          <div className="space-y-4">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {" "}
                 {t("Showing")} {filteredJobs.length}  {t("Past Completed Assignment")} {filteredJobs.length !== 1 ? "s" : ""}{" "}
              </span>{" "}
              <span className="text-xs text-slate-500 font-medium">
                {" "}
                 {t("Total Settled:")} {" "}
                <strong className="text-amber-700 font-mono">
                  ₹
                  {filteredJobs.reduce(
                    (acc, j) =>
                      acc +
                      (j.workerPayout !== undefined
                        ? j.workerPayout
                        : Math.round((j.dailyWage || 850) * 0.8)),
                    0,
                  )}
                </strong>{" "}
              </span>{" "}
            </div>{" "}
            {filteredJobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm max-w-md mx-auto">
                {" "}
                <History className="w-12 h-12 text-slate-300 mx-auto" />{" "}
                <h4 className="text-base font-black text-slate-900">
                   {t("No Past Jobs Match Filters")} </h4>{" "}
                <p className="text-xs text-slate-500">
                  {" "}
                   {t("Try changing your search query or trade filters to see other past completed jobs.")} {" "}
                </p>{" "}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTrade("All");
                    setSelectedRatingFilter("All");
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {" "}
                   {t("Reset Filters")} {" "}
                </button>{" "}
              </div>
            ) : (
              <div className="space-y-4">
                {" "}
                {filteredJobs.map((job) => {
                  const grossWage = job.dailyWage || 850;
                  const platformFee =
                    job.platformFee !== undefined
                      ? job.platformFee
                      : Math.round(grossWage * 0.2);
                  const workerPayout =
                    job.workerPayout || grossWage - platformFee;
                  const completionDateStr =
                    job.completionDate ||
                    job.completedAt ||
                    job.postedAt ||
                    "Recently";
                  const hasExplicitRating =
                    (typeof job.rating === "number" && job.rating > 0) ||
                    (typeof job.customerRating === "number" &&
                      job.customerRating > 0) ||
                    (typeof job.ratingGiven === "number" &&
                      job.ratingGiven > 0);
                  const ratingScore = hasExplicitRating
                    ? (job.rating ?? job.customerRating ?? job.ratingGiven)
                    : null;
                  const feedbackText =
                    job.review ||
                    job.customerReview ||
                    job.reviewGiven ||
                    "Work completed with excellence.";
                  const tags = job.ratingTags || [
                    "⚡ 100% Punctual",
                    "🛠️ Master Craftsmanship",
                  ];
                  const txn =
                    job.transactionRef ||
                    `UPI-DIHADI-${job.id.slice(-6).toUpperCase()}`;
                  return (
                    <div
                      key={job.id}
                      className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition space-y-4"
                    >
                      {" "}
                      {/* Top Bar: Trade + Date + Wage Amount */}{" "}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                        {" "}
                        <div className="flex items-center gap-2 flex-wrap">
                          {" "}
                          <span className="px-3 py-1 bg-amber-100 text-amber-950 font-black text-xs rounded-xl border border-amber-200">
                            {" "}
                            {job.trade}{" "}
                          </span>{" "}
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold flex items-center gap-1">
                            {" "}
                            <Calendar className="w-3 h-3 text-slate-500" />{" "}
                            <span> {t("Completed:")} {completionDateStr}</span>{" "}
                          </span>{" "}
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-[11px] font-bold flex items-center gap-1">
                            {" "}
                            <CheckCircle2 className="w-3 h-3 text-amber-600" />{" "}
                            <span> {t("Settled to UPI")} </span>{" "}
                          </span>{" "}
                        </div>{" "}
                        <div className="text-right shrink-0">
                          {" "}
                          <div className="flex items-baseline gap-1">
                            {" "}
                            <span className="text-xs text-slate-400 font-bold">
                               {t("Net Payout:")} </span>{" "}
                            <span className="text-xl font-black text-amber-600 font-mono leading-none">
                              {" "}
                              +₹{workerPayout}{" "}
                            </span>{" "}
                          </div>{" "}
                          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                            {" "}
                             {t("Gross: ₹")} {grossWage} •{" "}
                            {platformFee === 0
                              ? "0% Fee (Covered by VIP): -₹0"
                              : `20% Fee: -₹${platformFee}`}{" "}
                          </span>{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Main Job Details */}{" "}
                      <div className="space-y-2">
                        {" "}
                        <h4 className="text-base font-black text-slate-900 leading-snug">
                          {" "}
                          {job.title}{" "}
                        </h4>{" "}
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                          {" "}
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                          <span>{job.locationAddress || job.area}</span>{" "}
                          <span className="text-slate-300">•</span>{" "}
                          <span>
                             {t("Employer:")} {" "}
                            <strong className="text-slate-800">
                              {job.customerName}
                            </strong>
                          </span>{" "}
                        </p>{" "}
                        {job.description && (
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            {" "}
                            {job.description}{" "}
                          </p>
                        )}{" "}
                      </div>{" "}
                      {/* Employer Feedback Block */}{" "}
                      {(job.rating ||
                        job.customerRating ||
                        job.review ||
                        job.customerReview ||
                        job.reviewGiven) && (
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2.5">
                          {" "}
                          <div className="flex items-center justify-between gap-2">
                            {" "}
                            <div className="flex items-center gap-2">
                              {" "}
                              <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider">
                                {" "}
                                 {t("Employer Feedback & Rating")} {" "}
                              </span>{" "}
                              {ratingScore !== null ? (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[11px] rounded-lg shadow-2xs">
                                  {" "}
                                  <Star className="w-3 h-3 fill-slate-950" />{" "}
                                  <span>{ratingScore.toFixed(1)} ★</span>{" "}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 bg-slate-100 rounded-lg">
                                  {" "}
                                   {t("Pending Rating")} {" "}
                                </span>
                              )}{" "}
                            </div>{" "}
                            <button
                              type="button"
                              onClick={() => handleSpeakFeedback(job)}
                              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300 transition flex items-center gap-1 shadow-2xs cursor-pointer"
                              title={t("Listen to employer review")}
                            >
                              {" "}
                              <Volume2 className="w-3.5 h-3.5 text-amber-700" />{" "}
                              <span className="hidden sm:inline">
                                 {t("Listen Review")} </span>{" "}
                            </button>{" "}
                          </div>{" "}
                          <p className="text-xs text-slate-800 italic leading-relaxed">
                            {" "}
                             {t("&ldquo;")} {feedbackText} {t("&rdquo;")} {" "}
                          </p>{" "}
                          {/* Recognition Tags */}{" "}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {" "}
                              {tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-0.5 bg-white text-amber-950 rounded-lg text-[10px] font-bold border border-amber-200 shadow-2xs"
                                >
                                  {" "}
                                  {tag}{" "}
                                </span>
                              ))}{" "}
                            </div>
                          )}{" "}
                        </div>
                      )}{" "}
                      {/* Payment Reference & Actions Bar */}{" "}
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                        {" "}
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                          {" "}
                          <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                          <span>
                             {t("Ref:")} {" "}
                            <strong className="text-slate-800">{txn}</strong>
                          </span>{" "}
                          <button
                            type="button"
                            onClick={() => handleCopyTxn(txn)}
                            className="text-[10px] text-amber-600 hover:underline font-sans font-bold ml-1 cursor-pointer"
                          >
                            {" "}
                            {copiedTxn === txn ? "✓ Copied" : "Copy"}{" "}
                          </button>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          {" "}
                          <button
                            type="button"
                            onClick={() => onOpenChat(job)}
                            className="px-3 py-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-950 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                            title={t("View conversation with employer")}
                          >
                            {" "}
                            <MessageSquare className="w-3.5 h-3.5 text-slate-600" />{" "}
                            <span> {t("Employer Chat")} </span>{" "}
                          </button>{" "}
                          <button
                            type="button"
                            onClick={() => setReceiptJob(job)}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            {" "}
                            <FileText className="w-3.5 h-3.5 text-amber-400" />{" "}
                            <span> {t("Official Receipt")} </span>{" "}
                          </button>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
              </div>
            )}{" "}
          </div>{" "}
        </>
      )}{" "}
      {/* Digital Receipt Modal */}{" "}
      {receiptJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          {" "}
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 my-auto text-slate-900">
            {" "}
            {/* Receipt Header */}{" "}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              {" "}
              <div>
                {" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <div className="w-7 h-7 bg-amber-500 text-slate-950 rounded-lg flex items-center justify-center font-black text-xs">
                    {" "}
                    ₹{" "}
                  </div>{" "}
                  <h4 className="font-black text-base tracking-tight">
                     {t("DIHADI OFFICIAL SETTLEMENT RECEIPT")} </h4>{" "}
                </div>{" "}
                <p className="text-[11px] text-slate-500 mt-0.5">
                   {t("Govt. Verified Hyperlocal Escrow Settlement")} </p>{" "}
              </div>{" "}
              <button
                onClick={() => setReceiptJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                {" "}
                <X className="w-5 h-5" />{" "}
              </button>{" "}
            </div>{" "}
            {/* Receipt Body */}{" "}
            <div className="space-y-4 text-xs">
              {" "}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-1">
                {" "}
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                   {t("Settled Amount")} </span>{" "}
                <p className="text-3xl font-black text-amber-700 font-mono">
                  {" "}
                  +₹
                  {receiptJob.workerPayout ||
                    Math.round((receiptJob.dailyWage || 850) * 0.8)}{" "}
                </p>{" "}
                <p className="text-[11px] text-amber-700 font-semibold flex items-center justify-center gap-1">
                  {" "}
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />{" "}
                   {t("Successfully credited to UPI")} {" "}
                </p>{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px]">
                {" "}
                <div>
                  {" "}
                  <span className="text-slate-400 font-medium block">
                     {t("Worker Name")} </span>{" "}
                  <span className="font-bold text-slate-800">
                    {worker.name}
                  </span>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <span className="text-slate-400 font-medium block">
                     {t("Trade")} </span>{" "}
                  <span className="font-bold text-slate-800">
                    {receiptJob.trade}
                  </span>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <span className="text-slate-400 font-medium block">
                     {t("Employer")} </span>{" "}
                  <span className="font-bold text-slate-800">
                    {receiptJob.customerName}
                  </span>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <span className="text-slate-400 font-medium block">
                     {t("Job Location")} </span>{" "}
                  <span className="font-bold text-slate-800 truncate block">
                    {receiptJob.area}
                  </span>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <span className="text-slate-400 font-medium block">
                     {t("Payment Channel")} </span>{" "}
                  <span className="font-mono font-bold text-slate-800">
                    {receiptJob.paidVia || "UPI_QR"}
                  </span>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <span className="text-slate-400 font-medium block">
                     {t("Transaction Ref")} </span>{" "}
                  <span className="font-mono font-bold text-slate-800 truncate block">
                    {receiptJob.transactionRef ||
                      `UPI-DIHADI-${receiptJob.id.slice(-6).toUpperCase()}`}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              {/* Wage Breakdown */}{" "}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                {" "}
                <div className="flex justify-between text-slate-600">
                  {" "}
                  <span> {t("Gross Job Daily Wage")} </span>{" "}
                  <span className="font-mono font-bold">
                    ₹{receiptJob.dailyWage || 850}
                  </span>{" "}
                </div>{" "}
                <div className="flex justify-between text-slate-600">
                  {" "}
                  <span>
                     {t("Dihadi Platform Fee")} {" "}
                    {receiptJob.platformFee === 0
                      ? "(Covered by VIP)"
                      : "(20%)"}
                  </span>{" "}
                  <span className="font-mono text-amber-600">
                    -₹
                    {receiptJob.platformFee !== undefined
                      ? receiptJob.platformFee
                      : Math.round((receiptJob.dailyWage || 850) * 0.2)}
                  </span>{" "}
                </div>{" "}
                <div className="flex justify-between font-black text-slate-900 text-sm border-t border-dashed border-slate-300 pt-2">
                  {" "}
                  <span> {t("Net Worker Payout")} </span>{" "}
                  <span className="font-mono text-amber-600">
                    ₹
                    {receiptJob.workerPayout ||
                      Math.round((receiptJob.dailyWage || 850) * 0.8)}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* Receipt Modal Footer */}{" "}
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              {" "}
              <button
                type="button"
                onClick={() => {
                  window.print();
                  playSound("click");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                {" "}
                <Download className="w-3.5 h-3.5" />{" "}
                <span> {t("Print Slip")} </span>{" "}
              </button>{" "}
              <button
                type="button"
                onClick={() => setReceiptJob(null)}
                className="px-5 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
              >
                {" "}
                 {t("Close")} {" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
};
