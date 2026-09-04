import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { useApp } from "../../context/AppContext";
import { auth } from "../../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getT } from "../../utils/translations";
import { Job, TradeType } from "../../types";
import {
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  Volume2,
  Power,
  Sparkles,
  ArrowLeft,
  LogOut,
  HardHat,
  CreditCard,
  Edit2,
  Save,
  Radio,
  Lock,
  User,
  Check,
  AlertCircle,
  LocateFixed,
  Crosshair,
  Navigation,
  ShieldAlert,
  Compass,
  ExternalLink,
  Star,
  Mail,
  Award,
  ThumbsUp,
  MessageSquare,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Clock,
  Plus,
  X,
  Building2,
  Paintbrush,
  Wrench,
  Zap,
  Hammer,
  ChevronRight,
  TrendingUp,
  IndianRupee,
  RefreshCw,
  Layers,
  ChevronDown,
  Info,
  Camera,
  CalendarClock,
  History,
  MessageCircle,
  FileDown,
  Mic,
  MicOff,
  Crown,
  Eye,
  EyeOff,
  CheckCheck,
  HelpCircle,
  Copy,
} from "lucide-react";
import { playSound } from "../../utils/audio";
import {
  getGoogleMapsDirectionsUrl,
  calculateDistanceKm,
} from "../../utils/geo";
import {
  SecurityVerificationModal,
  GmailOtpVerificationModal,
  GmailOtpVerificationSection,
} from "../common/SecurityVerificationModal";
import { QuickChatModal } from "../common/QuickChatModal";
import { PerformanceStatsModal } from "./PerformanceStatsModal";
import { EditAvailabilityModal } from "./EditAvailabilityModal";
import { PortfolioUploadModal } from "./PortfolioUploadModal";
import { WorkerAvatarUploadModal } from "./WorkerAvatarUploadModal";
import { WorkerJobHistory } from "./WorkerJobHistory";
import { WorkerSubscriptionModal } from "./WorkerSubscriptionModal";
import { generateWorkerPerformancePdf } from "../../utils/pdfReportGenerator";
import { useTranslation } from "react-i18next";

interface WorkerAppProps {
  isEmbedded?: boolean;
}
export const WorkerApp: React.FC<WorkerAppProps> = ({ isEmbedded = false }) => {
    const { t } = useTranslation();
  const {
    currentWorker,
    currentCity,
    supportedCities,
    setCurrentCity,
    detectAndSetLiveLocation,
    snapToRealWorldAddress,
    isLocating,
    workerAccounts,
    loginWorkerWithAuth,
    registerWorkerWithAuth,
    logoutWorker,
    jobs,
    toggleWorkerStatus,
    updateWorkerUpi,
    updateWorkerAvatar,
    acceptJobByWorker,
    startJobWithOtp,
    completeJobByWorker,
    withdrawWorkerEarnings,
    subscribeWorkerPremium,
    topUpWorkerWallet,
    submitWorkerKyc,
    verifyCurrentWorker,
    refreshWorkerGpsLocation,
    setCurrentRole,
    currentLanguage,
    speak,
    startCall,
    openGpsRadar,
    setNotification,
    showNotification,
  } = useApp();
  /* Subscription Modal State */ const [
    showSubscriptionModal,
    setShowSubscriptionModal,
  ] = useState(false);
  /* Auth Mode: 'login' or 'register' */ const [authTab, setAuthTab] = useState<
    "login" | "register"
  >("login");
  /* Login form state */ const [loginId, setLoginId] = useState("worker");
  const [loginPassword, setLoginPassword] = useState("123");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  /* Registration form state */ const [regUserId, setRegUserId] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("+91 98101 55678");
  const [regEmail, setRegEmail] = useState("bhavnoorsinghkochar@gmail.com");
  const [regTrade, setRegTrade] = useState<TradeType>("Mason");
  const [regDailyRate, setRegDailyRate] = useState<number>(850);
  const [regExperienceYears, setRegExperienceYears] = useState<number>(5);
  const [regArea, setRegArea] = useState(
    () =>
      `${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
  );
  const [regAadhaarNumber, setRegAadhaarNumber] = useState("7829-4412-9901");
  const [regUpiId, setRegUpiId] = useState("worker.mason@okaxis");
  /* Security Verification Modal State */ const [
    showSecurityModal,
    setShowSecurityModal,
  ] = useState(false);
  const [showGmailVerifyModal, setShowGmailVerifyModal] = useState(false);
  /* Dashboard main tabs: 'discovery' (jobs), 'radar', 'active_work', 'history', 'wallet', 'profile', 'support' */ const [
    activeTab,
    setActiveTab,
  ] = useState<
    | "discovery"
    | "radar"
    | "active_work"
    | "history"
    | "wallet"
    | "profile"
    | "support"
  >("discovery");
  /* Quick Chat Modal State */ const [showChatModal, setShowChatModal] =
    useState(false);
  const [activeChatJob, setActiveChatJob] = useState<Job | null>(null);
  /* Search & Filter State */ const [searchQuery, setSearchQuery] =
    useState("");
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<
    TradeType | "All"
  >("All");
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(10.0);
  const [showAllCityJobs, setShowAllCityJobs] = useState<boolean>(false);
  const [declinedJobIds, setDeclinedJobIds] = useState<Set<string>>(new Set());
  const [minDailyWage, setMinDailyWage] = useState<number>(0);
  const [durationFilter, setDurationFilter] = useState<
    "all" | "single_day" | "multi_day"
  >("all");
  const [sortBy, setSortBy] = useState<"nearest" | "wage_high" | "newest">(
    "nearest",
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // Web Speech API Voice Filter State
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptAccumulatorRef = useRef<string>("");
  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);
  // OTP and Job Interactions
  const [otpInput, setOtpInput] = useState<{ [jobId: string]: string }>({});
  const [selectedRadarJob, setSelectedRadarJob] = useState<Job | null>(null);
  // UPI and Profile editing
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [tempUpi, setTempUpi] = useState("");
  const [withdrawalSuccessToast, setWithdrawalSuccessToast] = useState(false);
  // Quick-Action Modals State
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isExportingPdfQuick, setIsExportingPdfQuick] = useState(false);
  const [exportPdfSuccessQuick, setExportPdfSuccessQuick] = useState(false);
  useEffect(() => {
    if (currentCity) {
      setRegArea(`${currentCity.defaultArea}, ${currentCity.name}`);
    }
  }, [currentCity]);
  // Handler for quick PDF export for client interviews
  const handleExportPdfQuick = async () => {
    if (!currentWorker) return;
    setIsExportingPdfQuick(true);
    playSound("click");
    try {
      const ratedJobs = completedJobs.filter(
        (j) =>
          (j.rating && j.rating > 0) ||
          (j.customerRating && j.customerRating > 0) ||
          (j.ratingGiven && j.ratingGiven > 0),
      );
      const totalReviews = ratedJobs.length;
      let calcRating = 0;
      if (ratedJobs.length > 0) {
        const sum = ratedJobs.reduce(
          (acc, j) =>
            acc + (j.rating || j.customerRating || j.ratingGiven || 0),
          0,
        );
        calcRating = Number((sum / ratedJobs.length).toFixed(1));
      }
      const totalEarned = completedJobs.reduce(
        (sum, j) =>
          sum +
          (j.workerPayout !== undefined
            ? j.workerPayout
            : Math.round((j.dailyWage || 850) * 0.8)),
        0,
      );
      // Customer map for repeat hirer rate
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
        worker: currentWorker,
        completedJobs,
        totalEarnings: totalEarned,
        completedCount: completedJobs.length,
        realRating: calcRating,
        totalReviewsCount: totalReviews,
        repeatHirerRate: repeatRate,
      });
      setExportPdfSuccessQuick(true);
      playSound("success");
      setTimeout(() => setExportPdfSuccessQuick(false), 3500);
    } catch (err) {
      console.error("Failed to generate quick PDF dossier:", err);
    } finally {
      setIsExportingPdfQuick(false);
    }
  };
  // Coordinates
  const workerLat = currentWorker?.gpsLocation?.lat || 30.8926;
  const workerLng = currentWorker?.gpsLocation?.lng || 75.8415;
  // Active Assigned Jobs
  const myAssignedJobs = useMemo(() => {
    if (!currentWorker) return [];
    return jobs.filter(
      (j) =>
        j.assignedWorkerId === currentWorker.id &&
        j.status !== "paid_and_closed",
    );
  }, [jobs, currentWorker]);
  // Completed Jobs
  const completedJobs = useMemo(() => {
    if (!currentWorker) return [];
    return jobs.filter(
      (j) =>
        j.assignedWorkerId === currentWorker.id &&
        j.status === "paid_and_closed",
    );
  }, [jobs, currentWorker]);
  // Real Dynamic Performance Stats Summary matching PerformanceStatsModal (exclusively from real completed assignments)
  const workerPerformanceSummary = useMemo(() => {
    if (!currentWorker) {
      return {
        rating: 0,
        reviewsCount: 0,
        completedCount: 0,
        totalEarned: 0,
        onTimeRate: 0,
        label: "0 Jobs Done • No Ratings",
      };
    }
    const ratedJobs = completedJobs.filter(
      (j) =>
        (j.rating && j.rating > 0) ||
        (j.customerRating && j.customerRating > 0) ||
        (j.ratingGiven && j.ratingGiven > 0),
    );
    const totalReviews = ratedJobs.length;
    let calcRating = 0;
    if (ratedJobs.length > 0) {
      const sum = ratedJobs.reduce(
        (acc, j) => acc + (j.rating || j.customerRating || j.ratingGiven || 0),
        0,
      );
      calcRating = Number((sum / ratedJobs.length).toFixed(1));
    }
    const completedCount = completedJobs.length;
    const totalEarned = completedJobs.reduce(
      (sum, j) =>
        sum +
        (j.workerPayout !== undefined
          ? j.workerPayout
          : Math.round((j.dailyWage || 850) * 0.8)),
      0,
    );
    const onTimeRate = completedCount > 0 ? 100 : 0;
    let label = "";
    if (calcRating > 0 && totalReviews > 0) {
      label = `${calcRating.toFixed(1)} ★ • ${onTimeRate}% On-Time (${totalReviews} rev)`;
    } else if (completedCount > 0) {
      label = `${completedCount} Job${completedCount > 1 ? "s" : ""} Done • 100% On-Time`;
    } else {
      label = "0 Jobs Done • No Ratings";
    }
    return {
      rating: calcRating,
      reviewsCount: totalReviews,
      completedCount,
      totalEarned,
      onTimeRate,
      label,
    };
  }, [currentWorker, completedJobs]);
  // Filter and calculate distance for broadcast jobs (MUST be defined before any return)
  const {
    filteredBroadcastJobs,
    totalBroadcastCount,
    blockedDistantCount,
    allBroadcastWithDistance,
  } = useMemo(() => {
    const allBroadcast = jobs.filter((j) => j.status === "broadcast");
    const withDistance = allBroadcast.map((j) => {
      const jobLat = j.jobGps?.lat || workerLat;
      const jobLng = j.jobGps?.lng || workerLng;
      let dist = calculateDistanceKm(workerLat, workerLng, jobLat, jobLng);
      // City-level proximity normalization if raw coordinates had wide offset
      if (
        dist > 25.0 &&
        j.jobGps?.city &&
        currentWorker?.gpsLocation?.city &&
        j.jobGps.city.toLowerCase() ===
          currentWorker.gpsLocation.city.toLowerCase()
      ) {
        dist = +(
          1.2 +
          (Math.abs(
            j.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0),
          ) %
            35) /
            10
        ).toFixed(1);
      }
      return { ...j, distanceKm: dist };
    });
    const inRangeJobs = withDistance.filter((j) => {
      if (showAllCityJobs) return true;
      return j.distanceKm <= maxDistanceKm;
    });
    const blockedCount = withDistance.filter(
      (j) => !showAllCityJobs && j.distanceKm > maxDistanceKm,
    ).length;
    const filtered = inRangeJobs.filter((job) => {
      // 1. Distance filter (user-selected threshold within 10km unless showAllCityJobs is active)
      if (!showAllCityJobs && job.distanceKm > maxDistanceKm) {
        return false;
      }
      // 2. Trade Filter
      if (selectedTradeFilter !== "All" && job.trade !== selectedTradeFilter) {
        return false;
      }
      // 3. Search Query (Trade, Title, Description, Area, Customer Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTrade = (job.trade || "").toLowerCase().includes(q);
        const matchesTitle = (job.title || "").toLowerCase().includes(q);
        const matchesDesc = (job.description || "").toLowerCase().includes(q);
        const matchesArea = (job.area || "").toLowerCase().includes(q);
        const matchesCustomer = (job.customerName || "")
          .toLowerCase()
          .includes(q);
        if (
          !matchesTrade &&
          !matchesTitle &&
          !matchesDesc &&
          !matchesArea &&
          !matchesCustomer
        ) {
          return false;
        }
      }
      // 4. Min Daily Wage filter
      if (minDailyWage > 0 && job.workerPayout < minDailyWage) {
        return false;
      }
      // 5. Duration Filter
      if (durationFilter === "single_day" && (job.durationDays || 1) > 1) {
        return false;
      }
      if (durationFilter === "multi_day" && (job.durationDays || 1) <= 1) {
        return false;
      }
      return true;
    });
    // Sort results
    filtered.sort((a, b) => {
      if (sortBy === "nearest") {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      }
      if (sortBy === "wage_high") {
        return b.workerPayout - a.workerPayout;
      }
      return b.id.localeCompare(a.id);
    });
    return {
      filteredBroadcastJobs: filtered,
      totalBroadcastCount: allBroadcast.length,
      blockedDistantCount: blockedCount,
      allBroadcastWithDistance: withDistance,
    };
  }, [
    jobs,
    workerLat,
    workerLng,
    maxDistanceKm,
    showAllCityJobs,
    currentWorker,
    selectedTradeFilter,
    searchQuery,
    minDailyWage,
    durationFilter,
    sortBy,
  ]);
  /* Trade category counts for filter badges */ const tradeCounts =
    useMemo(() => {
      const counts: Record<string, number> = { All: 0 };
      jobs
        .filter((j) => j.status === "broadcast")
        .forEach((j) => {
          const jobLat = j.jobGps?.lat || workerLat;
          const jobLng = j.jobGps?.lng || workerLng;
          const dist = calculateDistanceKm(
            workerLat,
            workerLng,
            jobLat,
            jobLng,
          );
          if (dist <= 10.0) {
            counts.All = (counts.All || 0) + 1;
            counts[j.trade] = (counts[j.trade] || 0) + 1;
          }
        });
      return counts;
    }, [jobs, workerLat, workerLng]);
  /* Helpers */ const getTradeName = (t: TradeType | string) => {
    if (currentLanguage === "hi") {
      const map: Record<string, string> = {
        Mason: "राजमिस्त्री",
        Painter: "पेंटर",
        Plumber: "प्लंबर",
        Carpenter: "बढ़ई",
        Electrician: "इलेक्ट्रीशियन",
        "Construction Helper": "हेल्पर",
        "Tile Worker": "टाइल मिस्त्री",
        Welder: "वेल्डर",
        "Loader/Mover": "लोडर",
      };
      return map[t] || t;
    }
    if (currentLanguage === "pa") {
      const map: Record<string, string> = {
        Mason: "ਰਾਜਮਿਸਤਰੀ",
        Painter: "ਪੇਂਟਰ",
        Plumber: "ਪਲੰਬਰ",
        Carpenter: "ਤਰਖਾਣ",
        Electrician: "ਇਲੈਕਟ੍ਰੀਸ਼ੀਅਨ",
        "Construction Helper": "ਹੈਲਪਰ",
        "Tile Worker": "ਟਾਈਲ ਮਿਸਤਰੀ",
        Welder: "ਵੈਲਡਰ",
        "Loader/Mover": "ਲੋਡਰ",
      };
      return map[t] || t;
    }
    return t;
  };
  const popularTradeCards = [
    {
      trade: "Mason" as TradeType,
      label: "Mason",
      icon: Building2,
      subtitle: "Brickwork & Concrete",
    },
    {
      trade: "Painter" as TradeType,
      label: "Painter",
      icon: Paintbrush,
      subtitle: "Wall & Texture",
    },
    {
      trade: "Plumber" as TradeType,
      label: "Plumber",
      icon: Wrench,
      subtitle: "Pipes & Fitting",
    },
    {
      trade: "Electrician" as TradeType,
      label: "Electrician",
      icon: Zap,
      subtitle: "Wiring & Fixes",
    },
    {
      trade: "Carpenter" as TradeType,
      label: "Carpenter",
      icon: Hammer,
      subtitle: "Wood & Furniture",
    },
    {
      trade: "Tile Worker" as TradeType,
      label: "Tile Worker",
      icon: Layers,
      subtitle: "Flooring & Tiles",
    },
    {
      trade: "Welder" as TradeType,
      label: "Welder",
      icon: Sparkles,
      subtitle: "Iron & Grill",
    },
    {
      trade: "Construction Helper" as TradeType,
      label: "Helper",
      icon: HardHat,
      subtitle: "Site Support",
    },
  ];
  /* Active filters count */ const activeFiltersCount =
    (selectedTradeFilter !== "All" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (maxDistanceKm < 10.0 ? 1 : 0) +
    (minDailyWage > 0 ? 1 : 0) +
    (durationFilter !== "all" ? 1 : 0);
  const resetAllFilters = () => {
    setSelectedTradeFilter("All");
    setSearchQuery("");
    setMaxDistanceKm(10.0);
    setMinDailyWage(0);
    setDurationFilter("all");
    setSortBy("nearest");
    setVoiceFeedback(null);
    setLastVoiceCommand(null);
    playSound("click");
  };
  /* Web Speech API Voice Command Parser & Handler */ const handleVoiceCommand =
    (rawTranscript: string) => {
      if (!rawTranscript || !rawTranscript.trim()) return;
      const t = rawTranscript.toLowerCase().trim();
      setLastVoiceCommand(rawTranscript);
      let recognizedTrade: TradeType | "All" | null = null;
      let responseText = "";
      /* 1. Reset / Show All command */ if (
        t.includes("all") ||
        t.includes("sab") ||
        t.includes("sabhi") ||
        t.includes("sare") ||
        t.includes("clear") ||
        t.includes("reset") ||
        t.includes("every") ||
        t.includes("har")
      ) {
        recognizedTrade = "All";
        setSearchQuery("");
        setSelectedTradeFilter("All");
        responseText =
          currentLanguage === "hi"
            ? "सभी काम दिखाए जा रहे हैं।"
            : currentLanguage === "pa"
              ? "ਸਾਰੇ ਕੰਮ ਦਿਖਾਏ ਜਾ ਰਹੇ ਹਨ।"
              : "Showing all available jobs.";
      }
      /* 2. Specific Trade Categories else */ if (
        t.includes("mason") ||
        t.includes("brick") ||
        t.includes("mistri") ||
        t.includes("rajmistri") ||
        t.includes("राजमिस्त्री") ||
        t.includes("ਰਾਜਮਿਸਤਰੀ")
      ) {
        recognizedTrade = "Mason";
      } else if (
        t.includes("paint") ||
        t.includes("rang") ||
        t.includes("पेंटर") ||
        t.includes("ਪੇਂਟਰ")
      ) {
        recognizedTrade = "Painter";
      } else if (
        t.includes("plumb") ||
        t.includes("nal") ||
        t.includes("pipe") ||
        t.includes("प्लंबर") ||
        t.includes("ਪਲੰਬਰ")
      ) {
        recognizedTrade = "Plumber";
      } else if (
        t.includes("electr") ||
        t.includes("bijli") ||
        t.includes("wire") ||
        t.includes("इलेक्ट्रीशियन") ||
        t.includes("ਇਲੈਕਟ੍ਰੀਸ਼ੀਅਨ")
      ) {
        recognizedTrade = "Electrician";
      } else if (
        t.includes("carpent") ||
        t.includes("wood") ||
        t.includes("furniture") ||
        t.includes("badhai") ||
        t.includes("tarkhan") ||
        t.includes("बढ़ई") ||
        t.includes("ਤਰਖਾਣ")
      ) {
        recognizedTrade = "Carpenter";
      } else if (
        t.includes("tile") ||
        t.includes("floor") ||
        t.includes("टाइल") ||
        t.includes("ਟਾਈਲ")
      ) {
        recognizedTrade = "Tile Worker";
      } else if (
        t.includes("weld") ||
        t.includes("iron") ||
        t.includes("grill") ||
        t.includes("लोहा") ||
        t.includes("वेल्डर") ||
        t.includes("ਵੈਲਡਰ")
      ) {
        recognizedTrade = "Welder";
      } else if (
        t.includes("help") ||
        t.includes("labour") ||
        t.includes("mazdoor") ||
        t.includes("मजदूर") ||
        t.includes("हेल्पर") ||
        t.includes("ਹੈਲਪਰ")
      ) {
        recognizedTrade = "Construction Helper";
      }
      if (recognizedTrade && recognizedTrade !== "All") {
        setSelectedTradeFilter(recognizedTrade);
        setSearchQuery("");
        const tradeLabel = getTradeName(recognizedTrade);
        responseText =
          currentLanguage === "hi"
            ? `${tradeLabel} के काम फिल्टर कर दिए गए हैं।`
            : currentLanguage === "pa"
              ? `${tradeLabel} ਦੇ ਕੰਮ ਫਿਲਟਰ ਕੀਤੇ ਗਏ ਹਨ।`
              : `Filtered for ${recognizedTrade} jobs.`;
      } else if (!recognizedTrade) {
        /* General voice search: clean natural phrases and search */ const cleanedSearch =
          t
            .replace(/show\s+me\s+(jobs\s+in\s+|jobs\s+for\s+|jobs\s+)?/gi, "")
            .replace(/find\s+(jobs\s+in\s+|jobs\s+for\s+|jobs\s+)?/gi, "")
            .replace(/search\s+(for\s+)?/gi, "")
            .replace(/kaam\s+dikhao/gi, "")
            .replace(/mujhe\s+/gi, "")
            .replace(/wale\s+kaam/gi, "")
            .trim();
        if (cleanedSearch) {
          setSearchQuery(cleanedSearch);
          responseText =
            currentLanguage === "hi"
              ? `"${cleanedSearch}" के काम खोजे जा रहे हैं।`
              : currentLanguage === "pa"
                ? `"${cleanedSearch}" ਦੇ ਕੰਮ ਲੱਭੇ ਜਾ ਰਹੇ ਹਨ।`
                : `Searching jobs for"${cleanedSearch}".`;
        } else {
          responseText =
            currentLanguage === "hi"
              ? "कमांड समझ नहीं आई। कृपया दोबारा कहें।"
              : "Could not understand voice command. Please try again.";
        }
      }
      playSound("success");
      if (responseText) {
        speak(responseText);
        showNotification(
          "Voice Filter Applied",
          `🎙️"${rawTranscript}" ➔ ${responseText}`,
        );
      }
    };
  /* Toggle Web Speech API Voice Listening */ const toggleVoiceListening =
    () => {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (isVoiceListening) {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }
        setIsVoiceListening(false);
        setVoiceFeedback(null);
        return;
      }
      if (!SpeechRecognition) {
        setVoiceError(
          "Web Speech API is not supported in this browser. Please type in the search bar.",
        );
        showNotification(
          "Voice Filter Unavailable",
          "Web Speech API is not supported in your browser.",
        );
        return;
      }
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang =
          currentLanguage === "hi"
            ? "hi-IN"
            : currentLanguage === "pa"
              ? "pa-IN"
              : "en-IN";
        recognition.onstart = () => {
          setIsVoiceListening(true);
          setVoiceError(null);
          setVoiceTranscript("");
          transcriptAccumulatorRef.current = "";
          setVoiceFeedback(
            currentLanguage === "hi"
              ? 'सुन रहे हैं... बोलिए जैसे"राजमिस्त्री के काम दिखाओ" या"पेंटर"'
              : currentLanguage === "pa"
                ? 'ਸੁਣ ਰਹੇ ਹਾਂ... ਬੋਲੋ ਜਿਵੇਂ"ਰਾਜਮਿਸਤਰੀ ਦੇ ਕੰਮ" ਜਾਂ"ਪੇਂਟਰ"'
                : 'Listening... Speak a command like"show me mason jobs" or"painter"',
          );
          playSound("gps_ping");
        };
        recognition.onresult = (event: any) => {
          const current = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setVoiceTranscript(current);
          transcriptAccumulatorRef.current = current;
          setVoiceFeedback(`Heard:"${current}"`);
        };
        recognition.onerror = (event: any) => {
          setIsVoiceListening(false);
          if (event.error !== "no-speech") {
            setVoiceError(`Voice error: ${event.error}`);
          }
        };
        recognition.onend = () => {
          setIsVoiceListening(false);
          const recognized = transcriptAccumulatorRef.current;
          if (recognized) {
            handleVoiceCommand(recognized);
          }
          setTimeout(() => {
            setVoiceFeedback(null);
          }, 3500);
        };
        recognition.start();
      } catch (err: any) {
        setIsVoiceListening(false);
        setVoiceError("Unable to access microphone.");
      }
    };
  /* Auth Handlers */ const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || user.uid;
      const name = user.displayName || "Worker";
      const found = workerAccounts.find(
        (a) => a.id.toLowerCase() === email.toLowerCase(),
      );
      if (found) {
        const res = loginWorkerWithAuth(
          found.id,
          found.password || "google123",
        );
        if (!res.success) setAuthError(res.error || "Login failed");
      } else {
        const tempPass = "google123";
        registerWorkerWithAuth({
          userId: email,
          password: tempPass,
          name: name,
          phone: user.phoneNumber || "+91 99999 99999",
          email: user.email || undefined,
          isEmailVerified: true,
          primaryTrade: "Construction Helper",
          dailyRate: 600,
          experienceYears: 1,
          area: currentCity?.defaultArea || "City",
          aadhaarNumber:
            "XXXX-XXXX-" + Math.floor(1000 + Math.random() * 9000).toString(),
        });
        loginWorkerWithAuth(email, tempPass);
      }
    } catch (error: any) {
      if (
        error?.code === "auth/cancelled-popup-request" ||
        error?.code === "auth/popup-closed-by-user"
      ) {
        console.warn("User cancelled the Google popup sign-in.");
        return;
      }
      console.error("Google Sign-In Error:", error);
      setAuthError(error.message || "Google Sign-In failed.");
    }
  };
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!loginId.trim()) {
      setAuthError(getT(currentLanguage, "auth_error_invalid"));
      return;
    }
    const result = loginWorkerWithAuth(loginId, loginPassword);
    if (!result.success) {
      setAuthError(result.error || getT(currentLanguage, "auth_error_invalid"));
    }
  };
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!regName.trim()) {
      setAuthError("Please enter your full name");
      return;
    }
    if (!regPassword.trim()) {
      setAuthError("Please enter a password");
      return;
    }
    const chosenId =
      regUserId.trim() ||
      regPhone.replace(/[^0-9]/g, "") ||
      regName.trim().toLowerCase().replace(/\s+/g, "_");
    registerWorkerWithAuth({
      userId: chosenId,
      password: regPassword.trim(),
      name: regName.trim(),
      phone: regPhone.trim() || "+91 98101 55678",
      email: regEmail.trim() || undefined,
      isPhoneVerified: true,
      isEmailVerified: !!regEmail.trim(),
      primaryTrade: regTrade,
      dailyRate: Number(regDailyRate) || 850,
      experienceYears: Number(regExperienceYears) || 3,
      area:
        regArea ||
        `${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
      aadhaarNumber: regAadhaarNumber || "7829-4412-9901",
      upiId: regUpiId || `${chosenId}@upi`,
    });
  };
  const handleVerificationSuccess = (verifiedData: {
    verifiedPhone: string;
    verifiedEmail?: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  }) => {
    setShowSecurityModal(false);
    const chosenId =
      regUserId.trim() ||
      (verifiedData.verifiedPhone || regPhone).replace(/[^0-9]/g, "");
    registerWorkerWithAuth({
      userId: chosenId,
      password: regPassword.trim() || "123",
      name: regName.trim(),
      phone: verifiedData.verifiedPhone || regPhone,
      email: verifiedData.verifiedEmail || regEmail,
      isPhoneVerified: verifiedData.isPhoneVerified,
      isEmailVerified: verifiedData.isEmailVerified,
      primaryTrade: regTrade,
      dailyRate: Number(regDailyRate) || 850,
      experienceYears: Number(regExperienceYears) || 3,
      area:
        regArea ||
        `${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
      aadhaarNumber: regAadhaarNumber || "7829-4412-9901",
      upiId: regUpiId || `${chosenId}@upi`,
    });
  };
  const handleQuickDemoLogin = (userId: string, pass: string) => {
    setLoginId(userId);
    setLoginPassword(pass);
    setAuthError(null);
    loginWorkerWithAuth(userId, pass);
  };
  const handleOtpSubmit = (jobId: string) => {
    const code = otpInput[jobId] || "";
    if (!code || code.length !== 4) {
      setNotification(
        "Please enter the 4-digit start OTP provided by the employer.",
      );
      playSound("click");
      return;
    }
    const success = startJobWithOtp(jobId, code);
    if (success) {
      setOtpInput({ ...otpInput, [jobId]: "" });
      playSound("success");
    }
  };
  const handleSpeakJob = (job: Job) => {
    if (currentLanguage === "hi") {
      speak(
        `नया काम: ${getTradeName(job.trade)}, ₹${job.workerPayout} दैनिक मजदूरी, ${job.area}। दूरी लगभग ${job.distanceKm} किलोमीटर। 10 किलोमीटर के दायरे में।`,
      );
    } else if (currentLanguage === "pa") {
      speak(
        `ਨਵਾਂ ਕੰਮ: ${getTradeName(job.trade)}, ₹${job.workerPayout} ਦਿਹਾੜੀ, ${job.area}। ਦੂਰੀ ${job.distanceKm} ਕਿਲੋਮੀਟਰ। 10 ਕਿਲੋਮੀਟਰ ਦੇ ਦਾਇਰੇ ਵਿੱਚ।`,
      );
    } else {
      speak(
        `New job: ${job.trade}, ₹${job.workerPayout} daily wage, ${job.area}. Distance ${job.distanceKm} kilometers, within strict 10km radius.`,
      );
    }
  };
  const handleSaveUpi = () => {
    if (tempUpi.trim()) {
      updateWorkerUpi(tempUpi.trim());
      setIsEditingUpi(false);
      playSound("success");
    }
  };
  const handleWithdraw = () => {
    withdrawWorkerEarnings();
    setWithdrawalSuccessToast(true);
    setTimeout(() => setWithdrawalSuccessToast(false), 4000);
  };
  /* IF NOT LOGGED IN: Show Login / Registration */ if (!currentWorker) {
    return (
      <div
        className={`bg-white flex flex-col h-full overflow-y-auto select-none ${isEmbedded ? "w-full" : "max-w-md mx-auto rounded-3xl border border-slate-200 shadow-xl"}`}
      >
        {" "}
        {/* Header */}{" "}
        <div className="p-6 bg-slate-900 text-white shrink-0 rounded-t-3xl">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <button
                onClick={() => setCurrentRole("select_role")}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                title={getT(currentLanguage, "back_to_role_selection")}
              >
                {" "}
                <ArrowLeft className="w-4 h-4" />{" "}
              </button>{" "}
              <div>
                {" "}
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  {" "}
                  <HardHat className="w-6 h-6 text-amber-500" />{" "}
                  {getT(currentLanguage, "role_worker_title")}{" "}
                </h3>{" "}
                <p className="text-xs text-slate-400">
                  {" "}
                  {authTab === "login"
                    ? getT(currentLanguage, "auth_tab_login")
                    : getT(currentLanguage, "auth_tab_register")}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="p-6 space-y-5 flex-1">
          {" "}
          {/* Auth Tab Switcher */}{" "}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {" "}
            <button
              onClick={() => {
                setAuthTab("login");
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${authTab === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              {" "}
              {getT(currentLanguage, "auth_sign_in")}{" "}
            </button>{" "}
            <button
              onClick={() => {
                setAuthTab("register");
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${authTab === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              {" "}
              {getT(currentLanguage, "auth_register")}{" "}
            </button>{" "}
          </div>{" "}
          {authError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3.5 rounded-2xl flex items-center gap-2.5">
              {" "}
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />{" "}
              <span>{authError}</span>{" "}
            </div>
          )}{" "}
          {authTab === "login" ? (
            /* Login Form */ <div className="space-y-4">
              {" "}
              <form
                onSubmit={handleLoginSubmit}
                className="space-y-3.5 text-xs"
              >
                {" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                    {" "}
                    {getT(currentLanguage, "auth_user_id_label")}  {t("/ Mobile / Email")} {" "}
                  </label>{" "}
                  <div className="relative">
                    {" "}
                    <input
                      type="text"
                      placeholder={t("e.g. User ID, Mobile, or Email")}
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-amber-500 pl-9"
                    />{" "}
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />{" "}
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    {" "}
                    <span>
                      {getT(currentLanguage, "auth_password_label")}
                    </span>{" "}
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                      {" "}
                      {showLoginPassword ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}{" "}
                      <span>
                        {showLoginPassword ? "Hide" : "Show Password"}
                      </span>{" "}
                    </button>{" "}
                  </label>{" "}
                  <div className="relative">
                    {" "}
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder={t("Enter password")}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-amber-500 pl-9 pr-10"
                    />{" "}
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />{" "}
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {" "}
                      {showLoginPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl shadow-md text-xs transition flex items-center justify-center gap-2 mt-4"
                >
                  {" "}
                  <CheckCircle2 className="w-4 h-4" />{" "}
                  <span>{getT(currentLanguage, "auth_login_btn")}</span>{" "}
                </button>{" "}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold py-3 rounded-2xl shadow-sm text-xs transition flex items-center justify-center gap-2 mt-3"
                >
                  {" "}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    {" "}
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />{" "}
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />{" "}
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />{" "}
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />{" "}
                    <path fill="none" d="M1 1h22v22H1z" />{" "}
                  </svg>{" "}
                  <span> {t("Sign in with Google")} </span>{" "}
                </button>{" "}
              </form>{" "}
            </div>
          ) : (
            /* Register Form */ <form
              onSubmit={handleRegisterSubmit}
              className="space-y-3 text-xs"
            >
              {" "}
              <div>
                {" "}
                <label className="font-bold text-slate-700 block mb-1">
                   {t("Full Name")} </label>{" "}
                <input
                  type="text"
                  placeholder={t("e.g. Harpreet Singh")}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-amber-500"
                />{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-2">
                {" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                     {t("User ID / Username")} </label>{" "}
                  <input
                    type="text"
                    placeholder={t("e.g. bhavnoor")}
                    value={regUserId}
                    onChange={(e) => setRegUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-500"
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    {" "}
                    <span> {t("Password")} </span>{" "}
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="text-[10px] text-amber-700 font-semibold"
                    >
                      {" "}
                      {showRegPassword ? "Hide" : "Show"}{" "}
                    </button>{" "}
                  </label>{" "}
                  <div className="relative">
                    {" "}
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder={t("e.g. mypass123")}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-500 pr-8"
                    />{" "}
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {" "}
                      {showRegPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-2">
                {" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                     {t("Mobile Phone")} </label>{" "}
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-amber-500"
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    {" "}
                    <span> {t("Gmail / Email")} </span>{" "}
                    <span className="text-[9px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                       {t("Security OTP")} </span>{" "}
                  </label>{" "}
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={t("name@gmail.com")}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-amber-500"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="font-bold text-slate-700 block mb-1">
                  {getT(currentLanguage, "worker_trade_label")}
                </label>{" "}
                <select
                  value={regTrade}
                  onChange={(e) => setRegTrade(e.target.value as TradeType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-amber-500"
                >
                  {" "}
                  <option value="Mason">{getTradeName("Mason")}</option>{" "}
                  <option value="Painter">{getTradeName("Painter")}</option>{" "}
                  <option value="Plumber">{getTradeName("Plumber")}</option>{" "}
                  <option value="Carpenter">{getTradeName("Carpenter")}</option>{" "}
                  <option value="Electrician">
                    {getTradeName("Electrician")}
                  </option>{" "}
                  <option value="Tile Worker">
                    {getTradeName("Tile Worker")}
                  </option>{" "}
                  <option value="Welder">{getTradeName("Welder")}</option>{" "}
                  <option value="Construction Helper">
                    {getTradeName("Construction Helper")}
                  </option>{" "}
                </select>{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-2">
                {" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                    {getT(currentLanguage, "worker_daily_rate_label")}
                  </label>{" "}
                  <input
                    type="number"
                    value={regDailyRate}
                    onChange={(e) => setRegDailyRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-amber-500"
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                    {getT(currentLanguage, "worker_exp_label")}
                  </label>{" "}
                  <input
                    type="number"
                    value={regExperienceYears}
                    onChange={(e) =>
                      setRegExperienceYears(Number(e.target.value))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-amber-500"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="font-bold text-slate-700 block mb-1">
                  {getT(currentLanguage, "worker_upi_label")}
                </label>{" "}
                <input
                  type="text"
                  value={regUpiId}
                  onChange={(e) => setRegUpiId(e.target.value)}
                  placeholder={t("e.g. 9810155678@paytm")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-950 focus:outline-amber-500"
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <div className="flex items-center justify-between mb-1">
                  {" "}
                  <label className="font-bold text-slate-700 block">
                     {t("Area / City")} </label>{" "}
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await snapToRealWorldAddress();
                      if (res) {
                        setRegArea(
                          `${res.sublocality || res.street || currentCity.defaultArea}, ${res.city}`,
                        );
                      }
                    }}
                    disabled={isLocating}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 transition disabled:opacity-50"
                  >
                    {" "}
                    <Crosshair className="w-3 h-3 text-amber-600" />{" "}
                    <span>
                      {isLocating ? "Resolving..." : "Snap Real-World Address"}
                    </span>{" "}
                  </button>{" "}
                </div>{" "}
                <input
                  type="text"
                  value={regArea}
                  onChange={(e) => setRegArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-amber-500"
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="font-bold text-slate-700 block mb-1">
                  {getT(currentLanguage, "worker_aadhaar_label")}
                </label>{" "}
                <input
                  type="text"
                  value={regAadhaarNumber}
                  onChange={(e) => setRegAadhaarNumber(e.target.value)}
                  placeholder={t("XXXX-XXXX-XXXX")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-amber-500"
                />{" "}
              </div>{" "}
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl shadow-md text-xs transition flex items-center justify-center gap-2 mt-3"
              >
                {" "}
                <ShieldCheck className="w-4 h-4 text-amber-950" />{" "}
                <span> {t("Verify Gmail / SMS & Register Worker")} </span>{" "}
              </button>
              <div className="relative flex items-center py-2 mt-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                   {t("Or")} </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold py-3 rounded-2xl shadow-sm text-xs transition flex items-center justify-center gap-2 mt-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                <span> {t("Continue with Google")} </span>
              </button>
            </form>
          )}{" "}
        </div>{" "}
        {/* Security Verification Modal */}{" "}
        <SecurityVerificationModal
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
          targetName={regName}
          email={regEmail}
          phone={regPhone}
          role="worker"
          onVerificationComplete={handleVerificationSuccess}
        />{" "}
      </div>
    );
  }
  /* LOGGED IN WORKER VIEW */ return (
    <div
      className={`bg-slate-50 text-slate-900 flex flex-col min-h-screen select-none w-full max-w-full ${isEmbedded ? "w-full" : "max-w-7xl mx-auto rounded-none sm:rounded-3xl sm:border border-slate-200/80 sm:shadow-2xl overflow-hidden"}`}
    >
      {/* 1. Header Navigation Bar */}
      <nav className="bg-slate-900 text-white px-3 sm:px-6 lg:px-8 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 relative lg:sticky lg:top-16 z-20 shadow-md w-full">
        {" "}
        {/* Left Branding & Live Radar Badge */}{" "}
        <div className="flex items-center gap-3">
          {" "}
          <button
            onClick={() => setCurrentRole("select_role")}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title={getT(currentLanguage, "switch_role")}
          >
            {" "}
            <ArrowLeft className="w-4 h-4" />{" "}
          </button>{" "}
          <div className="flex items-center gap-2.5">
            {" "}
            <div
              className="relative cursor-pointer group"
              onClick={() => {
                setShowAvatarModal(true);
                playSound("click");
              }}
              title={t("Click to Upload/Change Profile Photo")}
            >
              {" "}
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg border-2 border-amber-300 shadow-md overflow-hidden">
                {" "}
                {currentWorker.avatar ? (
                  <img
                    src={currentWorker.avatar}
                    alt={currentWorker.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentWorker.name.charAt(0)
                )}{" "}
              </div>{" "}
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                {" "}
                <Camera className="w-4 h-4 text-white" />{" "}
              </div>{" "}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${currentWorker.isOnline ? "bg-amber-500" : "bg-slate-400"}`}
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <div className="flex items-center gap-1.5">
                {" "}
                <h3 className="font-black text-white text-base tracking-tight leading-none">
                  {" "}
                  {currentWorker.name}{" "}
                </h3>{" "}
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded flex items-center gap-0.5 border ${currentWorker.isVerified ? "bg-amber-500/20 text-amber-300 border-amber-400/40" : "bg-amber-500/20 text-amber-300 border-amber-400/40"}`}
                >
                  {" "}
                  <ShieldCheck className="w-3 h-3 text-amber-400" />{" "}
                  {currentWorker.isVerified
                    ? "UIDAI Verified"
                    : "KYC Pending"}{" "}
                </span>{" "}
              </div>{" "}
              <p className="text-xs text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                {" "}
                <span>{getTradeName(currentWorker.primaryTrade)}</span>{" "}
                <span className="text-slate-500">•</span>{" "}
                <span className="text-slate-300">
                  {currentWorker.gpsLocation?.area ||
                    currentWorker.location.area}
                </span>{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Center Portal Tabs */}{" "}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold overflow-x-auto max-w-full">
          {" "}
          <button
            onClick={() => {
              setActiveTab("discovery");
              playSound("click");
            }}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === "discovery" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}
          >
            {" "}
            <Search className="w-3.5 h-3.5" /> <span> {t("Find Jobs")} </span>{" "}
            <span
              className={`px-1.5 py-0.2 text-[10px] font-black rounded-full ${activeTab === "discovery" ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300"}`}
            >
              {" "}
              {filteredBroadcastJobs.length}{" "}
            </span>{" "}
          </button>{" "}
          <button
            onClick={() => {
              setActiveTab("radar");
              playSound("click");
            }}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === "radar" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}
          >
            {" "}
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />{" "}
            <span> {t("10km Radar")} </span>{" "}
          </button>{" "}
          <button
            onClick={() => {
              setActiveTab("active_work");
              playSound("click");
            }}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === "active_work" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}
          >
            {" "}
            <Clock className="w-3.5 h-3.5" /> <span> {t("Active Work")} </span>{" "}
            {myAssignedJobs.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full animate-bounce">
                {" "}
                {myAssignedJobs.length}{" "}
              </span>
            )}{" "}
          </button>{" "}
          <button
            onClick={() => {
              setActiveTab("history");
              playSound("click");
            }}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === "history" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}
          >
            {" "}
            <History className="w-3.5 h-3.5" /> <span> {t("Job History")} </span>{" "}
            <span
              className={`px-1.5 py-0.2 text-[10px] font-black rounded-full ${activeTab === "history" ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300"}`}
            >
              {" "}
              {completedJobs.length}{" "}
            </span>{" "}
          </button>{" "}
          <button
            onClick={() => {
              setActiveTab("wallet");
              playSound("click");
            }}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === "wallet" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}
          >
            {" "}
            <CreditCard className="w-3.5 h-3.5" />{" "}
            <span> {t("Wallet & UPI")} </span>{" "}
          </button>{" "}
          <button
            onClick={() => {
              setActiveTab("profile");
              playSound("click");
            }}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === "profile" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}
          >
            {" "}
            <User className="w-3.5 h-3.5" /> <span> {t("Profile & KYC")} </span>{" "}
          </button>{" "}
          <button
            onClick={() => {
              setActiveTab("support");
              playSound("click");
            }}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === "support" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}
          >
            {" "}
            <HelpCircle className="w-3.5 h-3.5" /> <span> {t("Support")} </span>{" "}
          </button>{" "}
        </div>{" "}
        {/* Right Status Toggle, Wallet Quick & Sign Out */}{" "}
        <div className="flex items-center gap-2.5">
          {" "}
          {/* Online Toggle */}{" "}
          <button
            onClick={toggleWorkerStatus}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${currentWorker.isOnline ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"}`}
            title={t("Toggle availability on GPS radar")}
          >
            {" "}
            <Power className="w-3.5 h-3.5" />{" "}
            <span className="hidden sm:inline">
              {currentWorker.isOnline ? "Online (Broadcasting)" : "Offline"}
            </span>{" "}
          </button>{" "}
          {/* Wallet Balance Badge */}{" "}
          <div className="bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
            {" "}
            <div>
              {" "}
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                 {t("Wallet")} </span>{" "}
              <span className="text-sm font-black text-amber-400 font-mono">
                ₹{currentWorker.walletBalance}
              </span>{" "}
            </div>{" "}
            <button
              onClick={handleWithdraw}
              disabled={currentWorker.walletBalance <= 0}
              className="px-2 py-1 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 text-[10px] font-black rounded-lg transition"
            >
              {" "}
               {t("Withdraw")} {" "}
            </button>{" "}
          </div>{" "}
          <button
            onClick={logoutWorker}
            className="p-2 bg-slate-800 hover:bg-amber-900/40 text-slate-400 hover:text-amber-300 rounded-xl transition border border-slate-700"
            title={getT(currentLanguage, "auth_logout_btn")}
          >
            {" "}
            <LogOut className="w-4 h-4" />{" "}
          </button>{" "}
        </div>{" "}
      </nav>{" "}
      {/* Withdrawal Success Toast */}{" "}
      {withdrawalSuccessToast && (
        <div className="bg-amber-600 text-white px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md animate-fade-in">
          {" "}
          <CheckCircle2 className="w-4 h-4" />{" "}
          <span>
            ₹{currentWorker.walletBalance}  {t("payout triggered to")} {" "}
            {currentWorker.upiId}  {t("via Instant IMPS/UPI!")} </span>{" "}
        </div>
      )}{" "}
      {/* Main Content Body */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {!currentWorker.isVerified ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-fade-in px-4">
            <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center">
              <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                 {t("You are in the Waiting Room")} </h2>
              <p className="text-slate-600 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                 {t("Your profile is currently under review by our admin team. Please wait for some time. Once your account is verified and approved, you will be able to view and accept nearby jobs.")} </p>
            </div>
            <div className="px-5 py-3 bg-slate-100 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                 {t("Status: Pending Admin Approval")} </p>
            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: FIND JOBS (DISCOVERY WITH RICH FILTERS) */}
            {activeTab === "discovery" && (
          <div className="space-y-6">
            {" "}
            {/* A. Hero Banner & GPS Radar Status */}{" "}
            <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              {" "}
              <div className="max-w-2xl space-y-3.5 z-10">
                {" "}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFE57F]/20 dark:bg-[#FFE57F]/10 border border-[#A87B28]/40 rounded-full text-[#A87B28] dark:text-[#FFE57F] text-[10px] font-bold uppercase">
                  {" "}
                  <span className="w-2 h-2 rounded-full bg-[#FCD33F] animate-ping" />{" "}
                  <span> {t("Hyperlocal 10km GPS Radar Active")} </span>{" "}
                </div>{" "}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                  {" "}
                   {t("Available Job Broadcasts Near You.")} <br />{" "}
                  <span className="text-[#FCD33F] font-black">
                     {t("Guaranteed Daily Payouts & Zero Middlemen.")} </span>{" "}
                </h2>{" "}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {" "}
                   {t("Live jobs within your 10km neighborhood radius in")} {" "}
                  {currentWorker.gpsLocation?.city ||
                    currentWorker.location.city}
                   {t(". Payouts credited directly to your UPI upon job completion.")} {" "}
                </p>{" "}
                {/* Search & Voice Filter Bar */}{" "}
                <div className="space-y-2.5 pt-2">
                  {" "}
                  <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                    {" "}
                    <div className="relative flex-1">
                      {" "}
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />{" "}
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("Search jobs by trade, task, or locality (e.g. Mason, Plumbing, Civil Lines)...")}
                        className="w-full bg-white text-slate-900 pl-10 pr-9 py-3 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md placeholder:text-slate-400"
                      />{" "}
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        >
                          {" "}
                          <X className="w-4 h-4" />{" "}
                        </button>
                      )}{" "}
                    </div>{" "}
                    {/* Web Speech API Voice Listen Button */}{" "}
                    <button
                      id="btn-voice-listen"
                      onClick={toggleVoiceListening}
                      className={`px-4 py-3 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shrink-0 border cursor-pointer ${isVoiceListening ? "bg-amber-600 text-white border-amber-500 shadow-lg animate-pulse ring-4 ring-amber-500/30" : "bg-amber-500 text-slate-950 hover:bg-amber-400 border-amber-400 shadow-md active:scale-95"}`}
                      title={t("Click to speak a voice command (e.g. 'Show me mason jobs' or 'Plumber')")}
                      aria-label="Voice Search Listen"
                    >
                      {" "}
                      {isVoiceListening ? (
                        <>
                          {" "}
                          <MicOff className="w-4 h-4 text-white animate-bounce" />{" "}
                          <span> {t("Listening...")} </span>{" "}
                        </>
                      ) : (
                        <>
                          {" "}
                          <Mic className="w-4 h-4 text-slate-950" />{" "}
                          <span> {t("Listen")} </span>{" "}
                        </>
                      )}{" "}
                    </button>{" "}
                    <button
                      onClick={() =>
                        setShowAdvancedFilters(!showAdvancedFilters)
                      }
                      className={`px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 border cursor-pointer ${showAdvancedFilters || activeFiltersCount > 0 ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md" : "bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700"}`}
                    >
                      {" "}
                      <SlidersHorizontal className="w-4 h-4" />{" "}
                      <span> {t("Filters")} </span>{" "}
                      {activeFiltersCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-slate-950 text-amber-400 text-[10px] font-black rounded-full">
                          {" "}
                          {activeFiltersCount}{" "}
                        </span>
                      )}{" "}
                    </button>{" "}
                  </div>{" "}
                  {/* Voice Assistant Live Status & Quick Speech Command Pills */}{" "}
                  {(isVoiceListening ||
                    voiceFeedback ||
                    lastVoiceCommand ||
                    voiceError) && (
                    <div
                      className={`p-3 rounded-2xl border text-xs transition animate-fade-in ${isVoiceListening ? "bg-amber-950/40 border-amber-500/50 text-amber-200" : voiceError ? "bg-amber-950/40 border-amber-500/50 text-amber-200" : "bg-slate-900/90 border-slate-700 text-slate-200"}`}
                    >
                      {" "}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {" "}
                        <div className="flex items-center gap-2">
                          {" "}
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${isVoiceListening ? "bg-amber-500 animate-ping" : "bg-amber-400"}`}
                          />{" "}
                          <span className="font-bold">
                            {" "}
                            {isVoiceListening ? (
                              <span className="text-white">
                                {" "}
                                {voiceFeedback ||
                                  "Listening to your voice..."}{" "}
                              </span>
                            ) : voiceError ? (
                              <span className="text-amber-300">
                                {voiceError}
                              </span>
                            ) : (
                              <span className="text-slate-300">
                                {" "}
                                 {t("Last Command:")} {" "}
                                <strong className="text-amber-400">
                                  "{lastVoiceCommand}"
                                </strong>{" "}
                              </span>
                            )}{" "}
                          </span>{" "}
                        </div>{" "}
                        {/* Quick Voice Command Chips / Examples */}{" "}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {" "}
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                             {t("Try saying:")} </span>{" "}
                          {[
                            "Show me mason jobs",
                            "Painter",
                            "Plumber",
                            "Electrician",
                            "Show all jobs",
                          ].map((cmd) => (
                            <button
                              key={cmd}
                              onClick={() => handleVoiceCommand(cmd)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-[10px] text-amber-300 font-medium cursor-pointer transition"
                            >
                              "{cmd}"{" "}
                            </button>
                          ))}{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </div>{" "}
              {/* Right Live GPS & Radar Quick Card */}{" "}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 w-full md:w-72 shrink-0 space-y-3 z-10">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                     {t("Your Live Pin")} </span>{" "}
                  <button
                    onClick={refreshWorkerGpsLocation}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    title={t("Calibrate GPS location")}
                  >
                    {" "}
                    <RefreshCw className="w-3 h-3" />{" "}
                    <span> {t("Calibrate")} </span>{" "}
                  </button>{" "}
                </div>{" "}
                <div className="flex items-center gap-2.5">
                  {" "}
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                    {" "}
                    <LocateFixed className="w-5 h-5 animate-pulse" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {" "}
                      {currentWorker.gpsLocation?.area ||
                        currentWorker.location.area}
                      ,{" "}
                      {currentWorker.gpsLocation?.city ||
                        currentWorker.location.city}{" "}
                    </h4>{" "}
                    <p className="text-[10px] text-amber-400 font-mono">
                      {" "}
                       {t("Accuracy: ±")} {currentWorker.gpsLocation?.accuracyMeters || 4} {t("m")} {" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  {" "}
                  <span className="text-slate-400"> {t("Strict Radius")} </span>{" "}
                  <span className="font-bold text-amber-400">
                     {t("&le; 10.0 km")} </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* B. Advanced Filters Collapsible Panel */}{" "}
            {showAdvancedFilters && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 animate-fade-in">
                {" "}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  {" "}
                  <div className="flex items-center gap-2">
                    {" "}
                    <Filter className="w-4 h-4 text-amber-500" />{" "}
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      {" "}
                       {t("Advanced Job Filter Controls")} {" "}
                    </h3>{" "}
                  </div>{" "}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetAllFilters}
                      className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1"
                    >
                      {" "}
                      <X className="w-3.5 h-3.5" />{" "}
                      <span> {t("Reset All Filters")} </span>{" "}
                    </button>
                  )}{" "}
                </div>{" "}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {" "}
                  {/* Distance Radius Slider */}{" "}
                  <div className="space-y-1.5">
                    {" "}
                    <div className="flex justify-between items-center text-xs">
                      {" "}
                      <label className="font-bold text-slate-700">
                         {t("Max Distance (Radar)")} </label>{" "}
                      <span className="font-black text-amber-600 font-mono">
                        {maxDistanceKm}  {t("km")} </span>{" "}
                    </div>{" "}
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={maxDistanceKm}
                      onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />{" "}
                    <div className="flex justify-between text-[10px] text-slate-400">
                      {" "}
                      <span> {t("1 km (Hyperlocal)")} </span> <span> {t("5 km")} </span>{" "}
                      <span> {t("10 km (Max)")} </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Min Daily Wage */}{" "}
                  <div className="space-y-1.5">
                    {" "}
                    <div className="flex justify-between items-center text-xs">
                      {" "}
                      <label className="font-bold text-slate-700">
                         {t("Min Daily Payout")} </label>{" "}
                      <span className="font-black text-amber-600 font-mono">
                        {" "}
                        {minDailyWage > 0 ? `₹${minDailyWage}` : "Any"}{" "}
                      </span>{" "}
                    </div>{" "}
                    <input
                      type="range"
                      min="0"
                      max="1500"
                      step="50"
                      value={minDailyWage}
                      onChange={(e) => setMinDailyWage(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />{" "}
                    <div className="flex justify-between text-[10px] text-slate-400">
                      {" "}
                      <span>₹0</span> <span>₹750</span> <span>₹1500+</span>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Duration Filter */}{" "}
                  <div className="space-y-1.5">
                    {" "}
                    <label className="font-bold text-slate-700 text-xs block">
                       {t("Job Duration")} </label>{" "}
                    <select
                      value={durationFilter}
                      onChange={(e) => setDurationFilter(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-amber-500"
                    >
                      {" "}
                      <option value="all"> {t("All Durations")} </option>{" "}
                      <option value="single_day"> {t("1-Day Daily Work Only")} </option>{" "}
                      <option value="multi_day">
                         {t("Multi-Day Projects (2+ Days)")} </option>{" "}
                    </select>{" "}
                  </div>{" "}
                  {/* Sort By */}{" "}
                  <div className="space-y-1.5">
                    {" "}
                    <label className="font-bold text-slate-700 text-xs block">
                       {t("Sort Jobs By")} </label>{" "}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-amber-500"
                    >
                      {" "}
                      <option value="nearest">
                         {t("Distance (Nearest First)")} </option>{" "}
                      <option value="wage_high">
                         {t("Daily Payout (Highest First)")} </option>{" "}
                      <option value="newest">
                         {t("Broadcast Time (Newest First)")} </option>{" "}
                    </select>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            )}{" "}
            {/* C. Trade Category Chips */}{" "}
            <div className="space-y-3">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  {" "}
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />{" "}
                  <span> {t("Filter by Trade Categories")} </span>{" "}
                </h3>{" "}
                {selectedTradeFilter !== "All" && (
                  <button
                    onClick={() => setSelectedTradeFilter("All")}
                    className="text-xs text-amber-600 font-bold hover:underline"
                  >
                    {" "}
                     {t("Clear Filter (Show All)")} {" "}
                  </button>
                )}{" "}
              </div>{" "}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                {" "}
                {/* All Option */}{" "}
                <button
                  onClick={() => {
                    setSelectedTradeFilter("All");
                    playSound("click");
                  }}
                  className={`p-3 rounded-2xl border transition text-center flex flex-col items-center justify-center gap-1.5 ${selectedTradeFilter === "All" ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-sm" : "bg-white hover:bg-slate-50 border-slate-200"}`}
                >
                  {" "}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${selectedTradeFilter === "All" ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-700"}`}
                  >
                    {" "}
                    <Layers className="w-4 h-4" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <p className="text-xs font-black text-slate-900">
                       {t("All Trades")} </p>{" "}
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({tradeCounts.All || 0})
                    </span>{" "}
                  </div>{" "}
                </button>{" "}
                {popularTradeCards.map((cat) => {
                  const isSelected = selectedTradeFilter === cat.trade;
                  const Icon = cat.icon;
                  const count = tradeCounts[cat.trade] || 0;
                  return (
                    <button
                      key={cat.trade}
                      onClick={() => {
                        setSelectedTradeFilter(isSelected ? "All" : cat.trade);
                        playSound("click");
                      }}
                      className={`p-3 rounded-2xl border transition text-center flex flex-col items-center justify-center gap-1.5 ${isSelected ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-sm" : "bg-white hover:bg-slate-50 border-slate-200"}`}
                    >
                      {" "}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${isSelected ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-700"}`}
                      >
                        {" "}
                        <Icon className="w-4 h-4" />{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <p className="text-xs font-black text-slate-900 truncate max-w-[80px]">
                          {cat.label}
                        </p>{" "}
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({count})
                        </span>{" "}
                      </div>{" "}
                    </button>
                  );
                })}{" "}
              </div>{" "}
            </div>{" "}
            {/* D. Results Header & Strict 10km Radius Notice */}{" "}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <span className="text-sm font-black text-slate-900">
                  {" "}
                  {filteredBroadcastJobs.length}  {t("Job")} {filteredBroadcastJobs.length !== 1 ? "s" : ""}  {t("Available")} {" "}
                </span>{" "}
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-md flex items-center gap-1">
                  {" "}
                  <ShieldCheck className="w-3 h-3 text-amber-600" />  {t("Within &le;")} {" "}
                  {maxDistanceKm} {t("km")} {" "}
                </span>{" "}
              </div>{" "}
              {blockedDistantCount > 0 && (
                <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 flex items-center gap-1.5">
                  {" "}
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />{" "}
                  <span>
                    {blockedDistantCount}  {t("distant job(s) &gt; 10km blocked to prevent long travel")} </span>{" "}
                </div>
              )}{" "}
            </div>{" "}
            {/* E. Job Cards Grid */}{" "}
            {filteredBroadcastJobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4 shadow-sm max-w-lg mx-auto">
                {" "}
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                  {" "}
                  <HardHat className="w-8 h-8" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h4 className="text-base font-black text-slate-900">
                     {t("No Matching Jobs in Current Filter")} </h4>{" "}
                  <p className="text-xs text-slate-500 mt-1">
                    {" "}
                    {totalBroadcastCount > 0
                      ? `There are ${totalBroadcastCount} active job broadcast(s) in your region. Expand your distance or clear trade filters to see them.`
                      : "No customer broadcasts have been posted yet. Post a job from the Customer portal to see it appear live here!"}{" "}
                  </p>{" "}
                </div>{" "}
                <div className="flex flex-wrap gap-2 justify-center pt-1">
                  {" "}
                  {totalBroadcastCount > 0 && !showAllCityJobs && (
                    <button
                      onClick={() => {
                        setShowAllCityJobs(true);
                        setSelectedTradeFilter("All");
                        playSound("click");
                      }}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
                    >
                      {" "}
                      <Radio className="w-3.5 h-3.5" />{" "}
                      <span>
                         {t("Show All Active City Jobs (")} {totalBroadcastCount})
                      </span>{" "}
                    </button>
                  )}{" "}
                  <button
                    onClick={resetAllFilters}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    {" "}
                     {t("Reset Filters")} {" "}
                  </button>{" "}
                </div>{" "}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {" "}
                {filteredBroadcastJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-4 hover:border-amber-400 transition shadow-sm hover:shadow-md flex flex-col justify-between"
                  >
                    {" "}
                    <div className="space-y-3">
                      {" "}
                      {/* Top Badges & Payout */}{" "}
                      <div className="flex justify-between items-start gap-2">
                        {" "}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {" "}
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black rounded-lg">
                            {" "}
                            {getTradeName(job.trade)}{" "}
                          </span>{" "}
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-md flex items-center gap-1 border border-amber-100">
                            {" "}
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />{" "}
                            {job.distanceKm}  {t("km away")} {" "}
                          </span>{" "}
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                            {" "}
                            <ShieldCheck className="w-3 h-3 text-amber-600" />{" "}
                            <span> {t("Prepaid by Employer")} </span>{" "}
                          </span>{" "}
                        </div>{" "}
                        <div className="text-right shrink-0">
                          {" "}
                          <span className="text-lg font-black text-amber-600 font-mono leading-none block">
                            {" "}
                            ₹{job.workerPayout}{" "}
                          </span>{" "}
                          <span className="text-[10px] text-amber-700 font-bold">
                             {t("100% in Escrow")} </span>{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Job Title & Location */}{" "}
                      <div>
                        {" "}
                        <h4 className="font-black text-slate-900 text-sm leading-snug">
                          {" "}
                          {job.title}{" "}
                        </h4>{" "}
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                          {" "}
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />{" "}
                          <span>{job.locationAddress || job.area}</span>{" "}
                        </p>{" "}
                      </div>{" "}
                      {/* Description */}{" "}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {" "}
                        {job.description}{" "}
                      </p>{" "}
                    </div>{" "}
                    {/* Footer Actions */}{" "}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      {" "}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        {" "}
                        <span>
                           {t("Employer:")} {" "}
                          <strong className="text-slate-800">
                            {job.customerName}
                          </strong>
                        </span>{" "}
                        <span className="font-medium">
                          {job.durationDays || 1}  {t("Day")} {(job.durationDays || 1) > 1 ? "s" : ""}  {t("Work")} </span>{" "}
                      </div>{" "}
                      <div className="flex items-center gap-2">
                        {" "}
                        {/* Audio TTS Reader */}{" "}
                        <button
                          onClick={() => handleSpeakJob(job)}
                          className="p-2.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 rounded-xl transition"
                          title={t("Listen to job details in your language")}
                        >
                          {" "}
                          <Volume2 className="w-4 h-4" />{" "}
                        </button>{" "}
                        {/* GPS Radar Modal Trigger */}{" "}
                        <button
                          onClick={() => openGpsRadar(job)}
                          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-amber-200"
                          title={t("View on GPS Radar")}
                        >
                          {" "}
                          <Radio className="w-3.5 h-3.5 text-amber-600" />{" "}
                          <span> {t("GPS Route")} </span>{" "}
                        </button>{" "}
                        {/* Accept Button */}{" "}
                        <button
                          onClick={() => {
                            setDeclinedJobIds((prev) =>
                              new Set(prev).add(job.id),
                            );
                            playSound("click");
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-200"
                          title={t("Decline Job")}
                        >
                          {" "}
                          <X className="w-3.5 h-3.5" />{" "}
                          <span> {t("Decline")} </span>{" "}
                        </button>{" "}
                        <button
                          onClick={() => {
                            acceptJobByWorker(job.id);
                            setActiveTab("active_work");
                            playSound("success");
                          }}
                          className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          {" "}
                          <Check className="w-4 h-4" />{" "}
                          <span>
                            {getT(currentLanguage, "worker_accept")}
                          </span>{" "}
                        </button>{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>
            )}{" "}
          </div>
        )}{" "}
        {/* TAB 2: 10KM GPS RADAR SCREEN */}{" "}
        {activeTab === "radar" && (
          <div className="space-y-6">
            {" "}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              {" "}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {" "}
                <div>
                  {" "}
                  <div className="flex items-center gap-2">
                    {" "}
                    <Radio className="w-5 h-5 text-amber-400 animate-pulse" />{" "}
                    <h3 className="text-xl font-black text-white">
                       {t("Live 10km GPS Radar & Job Scanner")} </h3>{" "}
                  </div>{" "}
                  <p className="text-xs text-slate-400 mt-1">
                    {" "}
                     {t("Visual scanner detecting job broadcasts within your strict 10km radius from (")} {workerLat.toFixed(4)},{" "}
                    {workerLng.toFixed(4)}){" "}
                  </p>{" "}
                </div>{" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <button
                    onClick={() => {
                      setShowAllCityJobs(!showAllCityJobs);
                      playSound("click");
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${showAllCityJobs ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                  >
                    {" "}
                    <span>
                      {showAllCityJobs
                        ? "Radius: Full City"
                        : "Radius: Strict 10km"}
                    </span>{" "}
                  </button>{" "}
                  <button
                    onClick={refreshWorkerGpsLocation}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    {" "}
                    <Compass className="w-4 h-4" />{" "}
                    <span> {t("Calibrate Radar")} </span>{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              {/* Circular Visual Radar Canvas Representation */}{" "}
              <div className="relative w-full max-w-md mx-auto aspect-square rounded-full border-2 border-amber-500/30 bg-slate-950/80 overflow-hidden flex items-center justify-center shadow-inner">
                {" "}
                {/* Concentric distance rings */}{" "}
                <div className="absolute w-[80%] h-[80%] rounded-full border border-amber-500/20 flex items-center justify-center">
                  {" "}
                  <span className="absolute top-2 text-[9px] font-mono text-amber-400/60">
                     {t("8 km")} </span>{" "}
                </div>{" "}
                <div className="absolute w-[50%] h-[50%] rounded-full border border-amber-500/25 flex items-center justify-center">
                  {" "}
                  <span className="absolute top-2 text-[9px] font-mono text-amber-400/60">
                     {t("5 km")} </span>{" "}
                </div>{" "}
                <div className="absolute w-[20%] h-[20%] rounded-full border border-amber-500/30 flex items-center justify-center">
                  {" "}
                  <span className="absolute top-1 text-[8px] font-mono text-amber-400/60">
                     {t("2 km")} </span>{" "}
                </div>{" "}
                {/* Crosshairs */}{" "}
                <div className="absolute w-full h-[1px] bg-amber-500/20" />{" "}
                <div className="absolute h-full w-[1px] bg-amber-500/20" />{" "}
                {/* Animated Radar Sweep Line */}{" "}
                <div
                  className="absolute inset-0 origin-center animate-spin"
                  style={{ animationDuration: "6s" }}
                >
                  {" "}
                  <div className="w-1/2 h-1/2 bg-gradient-to-br from-amber-500/25 to-transparent rounded-tl-full origin-bottom-right" />{" "}
                </div>{" "}
                {/* Worker Center Marker */}{" "}
                <div
                  className="relative z-10 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px] border-2 border-white shadow-lg animate-pulse"
                  title={t("Your Location")}
                >
                  {" "}
                  ★{" "}
                </div>{" "}
                {/* Plotted Job Markers */}{" "}
                {(filteredBroadcastJobs.length > 0
                  ? filteredBroadcastJobs
                  : allBroadcastWithDistance
                ).map((j, idx) => {
                  /* Approximate relative placement on radar */ const angle =
                    (idx * 67 + 25) * (Math.PI / 180);
                  const radiusRatio = Math.min(
                    (j.distanceKm || 2) / 10.0,
                    0.88,
                  );
                  const xOffset = Math.cos(angle) * (radiusRatio * 42);
                  const yOffset = Math.sin(angle) * (radiusRatio * 42);
                  return (
                    <button
                      key={j.id}
                      onClick={() => setSelectedRadarJob(j)}
                      style={{
                        transform: `translate(${xOffset * 4}px, ${yOffset * 4}px)`,
                      }}
                      className="absolute z-20 w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-300 text-slate-950 flex items-center justify-center text-[10px] font-black border-2 border-slate-950 transition transform hover:scale-125 shadow-md cursor-pointer"
                      title={`${j.title} (${j.distanceKm} km) - ₹${j.workerPayout}`}
                    >
                      {" "}
                      ₹{" "}
                    </button>
                  );
                })}{" "}
              </div>{" "}
              {/* Selected Job Radar Drawer */}{" "}
              {selectedRadarJob && (
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 animate-fade-in max-w-lg mx-auto">
                  {" "}
                  <div className="flex justify-between items-start">
                    {" "}
                    <div>
                      {" "}
                      <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-md">
                        {" "}
                        {selectedRadarJob.trade}{" "}
                      </span>{" "}
                      <h4 className="text-sm font-black text-white mt-1">
                        {selectedRadarJob.title}
                      </h4>{" "}
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        {" "}
                        <MapPin className="w-3 h-3 text-slate-500" />{" "}
                        {selectedRadarJob.area} ({selectedRadarJob.distanceKm}{" "}
                         {t("km away)")} {" "}
                      </p>{" "}
                    </div>{" "}
                    <div className="text-right">
                      {" "}
                      <span className="text-base font-black text-amber-400 font-mono">
                        ₹{selectedRadarJob.workerPayout}
                      </span>{" "}
                      <span className="text-[10px] text-slate-400 block">
                         {t("Daily Wage")} </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <p className="text-xs text-slate-300">
                    {selectedRadarJob.description}
                  </p>{" "}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                    {" "}
                    <button
                      onClick={() => setSelectedRadarJob(null)}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-xs font-bold"
                    >
                      {" "}
                       {t("Close")} {" "}
                    </button>{" "}
                    <button
                      onClick={() => {
                        acceptJobByWorker(selectedRadarJob.id);
                        setSelectedRadarJob(null);
                        setActiveTab("active_work");
                        playSound("success");
                      }}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      {" "}
                      <Check className="w-4 h-4" />{" "}
                      <span> {t("Accept Job From Radar")} </span>{" "}
                    </button>{" "}
                  </div>{" "}
                </div>
              )}{" "}
              {/* Live Radar Job Queue Feed */}{" "}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    {" "}
                    <Radio className="w-3.5 h-3.5 text-amber-400" />{" "}
                    <span>
                       {t("Live Radar Job Queue (")} {
                        (filteredBroadcastJobs.length > 0
                          ? filteredBroadcastJobs
                          : allBroadcastWithDistance
                        ).length
                      }
                      )
                    </span>{" "}
                  </h4>{" "}
                </div>{" "}
                {(filteredBroadcastJobs.length > 0
                  ? filteredBroadcastJobs
                  : allBroadcastWithDistance
                ).length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-950/40 rounded-2xl border border-slate-800">
                    {" "}
                     {t("No active job signals detected within radar range. Keep radar online to receive auto-alerts!")} {" "}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {" "}
                    {(filteredBroadcastJobs.length > 0
                      ? filteredBroadcastJobs
                      : allBroadcastWithDistance
                    ).map((job) => (
                      <div
                        key={job.id}
                        className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition"
                      >
                        {" "}
                        <div className="space-y-1">
                          {" "}
                          <div className="flex items-center gap-2 flex-wrap">
                            {" "}
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded-md border border-amber-500/30">
                              {" "}
                              {job.trade}{" "}
                            </span>{" "}
                            <span className="text-xs font-black text-white">
                              {job.title}
                            </span>{" "}
                            <span className="text-[10px] text-amber-400 font-mono font-bold">
                              ({job.distanceKm}  {t("km)")} </span>{" "}
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md border border-amber-500/30 flex items-center gap-1">
                              {" "}
                              <ShieldCheck className="w-3 h-3 text-amber-400" />{" "}
                              <span> {t("Prepaid in Escrow")} </span>{" "}
                            </span>{" "}
                          </div>{" "}
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            {" "}
                            <MapPin className="w-3 h-3 text-slate-500" />{" "}
                            <span>{job.locationAddress || job.area}</span>{" "}
                            <span className="text-slate-600">•</span>{" "}
                            <span>
                               {t("Employer:")} {" "}
                              <strong className="text-slate-300">
                                {job.customerName}
                              </strong>
                            </span>{" "}
                          </p>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          {" "}
                          <div className="text-right sm:mr-2">
                            {" "}
                            <span className="text-sm font-black text-amber-400 font-mono">
                              ₹{job.workerPayout}
                            </span>{" "}
                            <span className="text-[9px] text-slate-400 block font-bold">
                               {t("Daily Wage")} </span>{" "}
                          </div>{" "}
                          <button
                            type="button"
                            onClick={() => {
                              acceptJobByWorker(job.id);
                              setActiveTab("active_work");
                              playSound("success");
                            }}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            {" "}
                            <Check className="w-3.5 h-3.5" />{" "}
                            <span> {t("Accept")} </span>{" "}
                          </button>{" "}
                        </div>{" "}
                      </div>
                    ))}{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}{" "}
        {/* TAB 3: ACTIVE WORK ASSIGNMENTS */}{" "}
        {activeTab === "active_work" && (
          <div className="space-y-6">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <div>
                {" "}
                <h3 className="text-lg font-black text-slate-900">
                   {t("Active Work Assignments")} </h3>{" "}
                <p className="text-xs text-slate-500">
                   {t("Live jobs currently assigned to you")} </p>{" "}
              </div>{" "}
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black">
                {" "}
                {myAssignedJobs.length}  {t("In Progress")} {" "}
              </span>{" "}
            </div>{" "}
            {myAssignedJobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-sm max-w-md mx-auto">
                {" "}
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />{" "}
                <h4 className="text-base font-black text-slate-900">
                   {t("No Active Jobs")} </h4>{" "}
                <p className="text-xs text-slate-500">
                  {" "}
                   {t("You do not have any jobs currently in progress. Go to Find Jobs to accept new daily assignments!")} {" "}
                </p>{" "}
                <button
                  onClick={() => setActiveTab("discovery")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition"
                >
                  {" "}
                   {t("Browse Available Jobs")} {" "}
                </button>{" "}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {" "}
                {myAssignedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-amber-50/60 border-2 border-amber-400 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between"
                  >
                    {" "}
                    <div className="space-y-3">
                      {" "}
                      <div className="flex justify-between items-start">
                        {" "}
                        <div>
                          {" "}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {" "}
                            <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-lg">
                              {" "}
                              {job.status === "accepted"
                                ? "Pending Start OTP"
                                : "Work In Progress"}{" "}
                            </span>{" "}
                            <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                              {" "}
                              <ShieldCheck className="w-3 h-3 text-amber-600" />{" "}
                              <span> {t("100% Prepaid in Escrow")} </span>{" "}
                            </span>{" "}
                          </div>{" "}
                          <h4 className="font-black text-slate-900 text-base mt-2">
                            {job.title}
                          </h4>{" "}
                          <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            {" "}
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />{" "}
                            {job.locationAddress || job.area}{" "}
                          </p>{" "}
                        </div>{" "}
                        <div className="text-right">
                          {" "}
                          <span className="text-xl font-black text-amber-700 font-mono">
                            ₹{job.workerPayout}
                          </span>{" "}
                          <span className="text-[10px] text-slate-500 block font-bold">
                             {t("Daily Wage")} </span>{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Employer Contact Bar */}{" "}
                      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-amber-200">
                        {" "}
                        <div>
                          {" "}
                          <p className="text-xs font-bold text-slate-900">
                            {job.customerName}
                          </p>{" "}
                          <p className="text-[11px] text-slate-500">
                            {job.customerPhone}
                          </p>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {" "}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveChatJob(job);
                              setShowChatModal(true);
                              playSound("click");
                            }}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-xs transition"
                            title={t("Quick Chat with Employer")}
                          >
                            {" "}
                            <MessageSquare className="w-3.5 h-3.5 text-slate-950" />{" "}
                            <span> {t("Quick Chat")} </span>{" "}
                          </button>{" "}
                          <button
                            type="button"
                            onClick={() => openGpsRadar(job)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-amber-200"
                            title={t("Open GPS Radar")}
                          >
                            {" "}
                            <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />{" "}
                            <span> {t("Radar")} </span>{" "}
                          </button>{" "}
                          <a
                            href={getGoogleMapsDirectionsUrl(
                              workerLat,
                              workerLng,
                              job.jobGps?.lat || workerLat + 0.008,
                              job.jobGps?.lng || workerLng + 0.008,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition"
                            title={t("Open Google Maps")}
                          >
                            {" "}
                            <ExternalLink className="w-3.5 h-3.5 text-amber-600" />{" "}
                          </a>{" "}
                          <button
                            type="button"
                            onClick={() =>
                              startCall(
                                {
                                  name: currentWorker.name,
                                  role: "worker",
                                  phone: currentWorker.phone,
                                },
                                {
                                  name: job.customerName,
                                  role: "customer",
                                  phone: job.customerPhone,
                                },
                                job.title,
                              )
                            }
                            className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs transition"
                            title={t("Call Employer")}
                          >
                            {" "}
                            <Phone className="w-3.5 h-3.5" />{" "}
                          </button>{" "}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                    {/* Step Actions */}{" "}
                    <div className="pt-3 border-t border-amber-200/80">
                      {" "}
                      {job.status === "accepted" ? (
                        <div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300 text-center space-y-2">
                          {" "}
                          <Clock className="w-8 h-8 text-amber-600 mx-auto animate-pulse" />{" "}
                          <h4 className="font-black text-amber-950 text-sm">
                             {t("Waiting for Employer to Approve & Pay")} </h4>{" "}
                          <p className="text-xs text-amber-800">
                             {t("The customer must complete the prepaid payment to approve you. Once paid, your Start OTP will be sent to the chat.")} </p>{" "}
                        </div>
                      ) : job.status === "approved" ? (
                        <div className="space-y-3 bg-amber-100/70 p-3.5 rounded-2xl border border-amber-300/80">
                          {" "}
                          <div className="flex items-center justify-between">
                            {" "}
                            <div>
                              {" "}
                              <span className="text-xs text-amber-950 font-black flex items-center gap-1.5">
                                {" "}
                                <Lock className="w-3.5 h-3.5 text-amber-800" />{" "}
                                <span> {t("Start-of-Work OTP Verification")} </span>{" "}
                              </span>{" "}
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                {" "}
                                 {t("Ask the customer at the site for their 4-digit passcode to unlock the work clock.")} {" "}
                              </p>{" "}
                            </div>{" "}
                            {job.otpCode && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOtpInput({
                                    ...otpInput,
                                    [job.id]: job.otpCode,
                                  });
                                  playSound("click");
                                }}
                                className="text-[10px] bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-1 rounded-lg font-bold transition border border-amber-400/50 cursor-pointer"
                                title={t("Auto-fill OTP for test simulation")}
                              >
                                {" "}
                                 {t("Test Auto-fill (#")} {job.otpCode}){" "}
                              </button>
                            )}{" "}
                          </div>{" "}
                          <div className="flex flex-col sm:flex-row gap-2">
                            {" "}
                            <input
                              type="text"
                              placeholder={t("Enter 4-digit Start OTP")}
                              value={otpInput[job.id] || ""}
                              onChange={(e) =>
                                setOtpInput({
                                  ...otpInput,
                                  [job.id]: e.target.value
                                    .replace(/[^0-9]/g, "")
                                    .slice(0, 4),
                                })
                              }
                              className="bg-white border-2 border-amber-300 rounded-xl px-4 py-2.5 text-base font-mono font-black text-slate-900 flex-1 focus:outline-amber-500 text-center sm:text-left tracking-widest"
                              maxLength={4}
                            />{" "}
                            <button
                              type="button"
                              onClick={() => handleOtpSubmit(job.id)}
                              disabled={
                                !(
                                  otpInput[job.id] &&
                                  otpInput[job.id].length === 4
                                )
                              }
                              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 rounded-xl text-xs font-black transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {" "}
                              <CheckCircle2 className="w-4 h-4" />{" "}
                              <span> {t("Verify & Start Work")} </span>{" "}
                            </button>{" "}
                          </div>{" "}
                          {/* Quick Request Toolbar */}{" "}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                            {" "}
                            <span className="text-[10px] text-amber-900 font-bold uppercase mr-1">
                               {t("Request OTP:")} </span>{" "}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveChatJob(job);
                                setShowChatModal(true);
                                playSound("click");
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-amber-300/80 font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              {" "}
                              <MessageSquare className="w-3 h-3 text-amber-600" />{" "}
                              <span> {t("Ask on Chat")} </span>{" "}
                            </button>{" "}
                            <a
                              href={`https://api.whatsapp.com/send?phone=${job.customerPhone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(`Hello ${job.customerName}, I have reached the work location for"${job.title}". Please share the 4-digit start OTP.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-300 font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                            >
                              {" "}
                              <MessageCircle className="w-3 h-3 text-amber-600" />{" "}
                              <span> {t("WhatsApp")} </span>{" "}
                            </a>{" "}
                            <button
                              type="button"
                              onClick={() =>
                                startCall(
                                  {
                                    name: currentWorker.name,
                                    role: "worker",
                                    phone: currentWorker.phone,
                                  },
                                  {
                                    name: job.customerName,
                                    role: "customer",
                                    phone: job.customerPhone,
                                  },
                                  job.title,
                                )
                              }
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-300 font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                            >
                              {" "}
                              <Phone className="w-3 h-3 text-amber-600" />{" "}
                              <span> {t("Call Employer")} </span>{" "}
                            </button>{" "}
                          </div>{" "}
                        </div>
                      ) : job.status === "in_progress" ? (
                        <div className="space-y-3">
                          {" "}
                          <div className="bg-amber-100 p-3 rounded-xl border border-amber-300 text-center text-xs font-black text-amber-950 uppercase tracking-wide">
                            {" "}
                             {t("Job Started")} {" "}
                          </div>{" "}
                          <button
                            onClick={() => {
                              completeJobByWorker(job.id);
                              playSound("success");
                            }}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            {" "}
                            <Check className="w-4 h-4" />{" "}
                            <span> {t("Mark Job Finished")} </span>{" "}
                          </button>{" "}
                        </div>
                      ) : (
                        <div className="bg-amber-100 p-3 rounded-2xl text-center text-xs font-bold text-amber-900">
                          {" "}
                           {t("Waiting for Customer to Rate...")} {" "}
                        </div>
                      )}{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>
            )}{" "}
          </div>
        )}{" "}
        {/* TAB: JOB & PAYOUT HISTORY */}{" "}
        {activeTab === "history" && (
          <WorkerJobHistory
            worker={currentWorker}
            completedJobs={completedJobs}
            currentLanguage={currentLanguage}
            onOpenChat={(job) => {
              setActiveChatJob(job);
              setShowChatModal(true);
              playSound("click");
            }}
          />
        )}{" "}
        {/* TAB 4: WALLET & EARNINGS BREAKDOWN */}{" "}
        {activeTab === "wallet" && (
          <div className="space-y-6">
            {" "}
            {/* Financial Overview Cards */}{" "}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {" "}
              <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-2 border border-slate-800 shadow-md">
                {" "}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                   {t("Withdrawable Balance")} </span>{" "}
                <p className="text-3xl font-black text-amber-400 font-mono">
                  ₹{currentWorker.walletBalance}
                </p>{" "}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  {" "}
                  <span className="text-[11px] text-slate-400 font-mono">
                     {t("UPI:")} {currentWorker.upiId}
                  </span>{" "}
                  <button
                    onClick={handleWithdraw}
                    disabled={currentWorker.walletBalance <= 0}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-lg text-[11px] transition"
                  >
                    {" "}
                     {t("Withdraw")} {" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
                {" "}
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                   {t("Total Lifetime Earnings")} </span>{" "}
                <p className="text-3xl font-black text-amber-600 font-mono">
                  {" "}
                  ₹
                  {workerPerformanceSummary.totalEarned.toLocaleString(
                    "en-IN",
                  )}{" "}
                </p>{" "}
                <p className="text-[11px] text-slate-500 font-medium">
                   {t("100% Direct to Bank via UPI")} </p>{" "}
              </div>{" "}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
                {" "}
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                   {t("Jobs Completed")} </span>{" "}
                <p className="text-3xl font-black text-slate-900 font-mono">
                  {completedJobs.length}
                </p>{" "}
                <p className="text-[11px] text-slate-500 font-medium">
                  {" "}
                  {workerPerformanceSummary.reviewsCount > 0 &&
                  workerPerformanceSummary.rating > 0
                    ? `Average Rating: ${workerPerformanceSummary.rating.toFixed(1)} ★ (${workerPerformanceSummary.reviewsCount} reviews)`
                    : "No Ratings Recorded Yet"}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            {/* UPI Handle Manager Card */}{" "}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
              {" "}
              <div className="flex justify-between items-center">
                {" "}
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                   {t("UPI Direct Settlement Handle")} </h4>{" "}
                {!isEditingUpi && (
                  <button
                    onClick={() => {
                      setIsEditingUpi(true);
                      setTempUpi(currentWorker.upiId);
                    }}
                    className="text-amber-600 hover:text-amber-700 font-bold text-xs flex items-center gap-1"
                  >
                    {" "}
                    <Edit2 className="w-3 h-3" />{" "}
                    <span> {t("Change Handle")} </span>{" "}
                  </button>
                )}{" "}
              </div>{" "}
              {isEditingUpi ? (
                <div className="flex gap-2">
                  {" "}
                  <input
                    type="text"
                    value={tempUpi}
                    onChange={(e) => setTempUpi(e.target.value)}
                    className="bg-slate-50 border border-amber-400 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 flex-1 focus:outline-amber-600"
                    placeholder={t("e.g. 9810155678@paytm")}
                  />{" "}
                  <button
                    onClick={handleSaveUpi}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    {" "}
                    <Save className="w-3.5 h-3.5" /> <span> {t("Save")} </span>{" "}
                  </button>{" "}
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 font-mono font-bold text-slate-800 flex items-center justify-between text-xs">
                  {" "}
                  <span>{currentWorker.upiId}</span>{" "}
                  <CreditCard className="w-4 h-4 text-slate-400" />{" "}
                </div>
              )}{" "}
            </div>{" "}
            {/* Completed Job Earnings History */}{" "}
            <div className="space-y-3">
              {" "}
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                {" "}
                 {t("Payout Log & Client Feedback (")} {completedJobs.length}){" "}
              </h4>{" "}
              {completedJobs.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-500">
                  {" "}
                   {t("No completed jobs recorded yet. Accept daily assignments to build your earnings record!")} {" "}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {" "}
                  {completedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs"
                    >
                      {" "}
                      <div className="flex items-center justify-between">
                        {" "}
                        <div>
                          {" "}
                          <h5 className="font-bold text-xs text-slate-900">
                            {job.title}
                          </h5>{" "}
                          <p className="text-[11px] text-slate-500">
                            {job.area}  {t("• Employer:")} {job.customerName}
                          </p>{" "}
                        </div>{" "}
                        <div className="text-right">
                          {" "}
                          <span className="text-sm font-black text-amber-600 font-mono">
                            +₹{job.workerPayout}
                          </span>{" "}
                          <span className="text-[10px] text-slate-400 block font-mono">
                             {t("Settled")} </span>{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Employer Review if available */}{" "}
                      {((typeof job.rating === "number" && job.rating > 0) ||
                        (typeof job.customerRating === "number" &&
                          job.customerRating > 0) ||
                        (typeof job.ratingGiven === "number" &&
                          job.ratingGiven > 0) ||
                        job.review ||
                        job.customerReview ||
                        job.reviewGiven) &&
                        (() => {
                          const rVal =
                            job.rating ?? job.customerRating ?? job.ratingGiven;
                          const reviewText =
                            job.review || job.customerReview || job.reviewGiven;
                          return (
                            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-xs space-y-1">
                              {" "}
                              <div className="flex items-center justify-between">
                                {" "}
                                <span className="text-[10px] font-bold text-amber-900 uppercase">
                                   {t("Client Rating")} </span>{" "}
                                {rVal ? (
                                  <span className="flex items-center gap-1 font-black text-slate-950 bg-amber-400 px-2 py-0.5 rounded text-[10px]">
                                    {" "}
                                    <Star className="w-2.5 h-2.5 fill-slate-950" />{" "}
                                    {rVal} ★{" "}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 italic">
                                     {t("No rating yet")} </span>
                                )}{" "}
                              </div>{" "}
                              {reviewText && (
                                <p className="text-[11px] text-slate-700 italic">
                                  "{reviewText}"
                                </p>
                              )}{" "}
                              {job.ratingTags && job.ratingTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {" "}
                                  {job.ratingTags.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-white text-amber-900 rounded text-[9px] font-bold border border-amber-200"
                                    >
                                      {" "}
                                      {tag}{" "}
                                    </span>
                                  ))}{" "}
                                </div>
                              )}{" "}
                            </div>
                          );
                        })()}{" "}
                    </div>
                  ))}{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {/* TAB 5: PROFILE & AADHAAR KYC TRUST */}{" "}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {" "}
            {/* Quick Action Management Bar */}{" "}
            <div className="bg-white text-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
              {" "}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-700">
                {" "}
                <div className="flex items-center gap-2.5">
                  {" "}
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
                    {" "}
                    <Sparkles className="w-4 h-4" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h3 className="text-sm font-black text-white leading-tight">
                       {t("Essential Worker Actions")} </h3>{" "}
                    <p className="text-[11px] text-slate-400">
                       {t("Manage your verified public profile, real-time radar, and showcase portfolio")} </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full text-[10px] font-bold border border-slate-700/80 shrink-0">
                    {" "}
                    {currentWorker.primaryTrade}  {t("Portal")} {" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {" "}
                {/* Action 1: View Performance Stats */}{" "}
                <div className="relative group/perf-btn">
                  {" "}
                  <div
                    id="worker-btn-perf-stats"
                    className="w-full p-3 bg-slate-800/90 hover:bg-slate-800 hover:border-amber-400/50 border border-slate-700/80 rounded-2xl transition flex flex-col justify-between gap-2.5 text-left group shadow-xs"
                  >
                    {" "}
                    <button
                      type="button"
                      onClick={() => {
                        setShowStatsModal(true);
                        playSound("click");
                      }}
                      className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
                      title={t("View full verified performance stats")}
                    >
                      {" "}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {" "}
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition relative overflow-hidden">
                          {" "}
                          <motion.div
                            animate={{
                              scale: [1, 1.15, 1],
                              rotate: [0, 6, -6, 0],
                              filter: [
                                "drop-shadow(0 0 2px rgba(251, 191, 36, 0.4))",
                                "drop-shadow(0 0 6px rgba(251, 191, 36, 0.9))",
                                "drop-shadow(0 0 2px rgba(251, 191, 36, 0.4))",
                              ],
                            }}
                            transition={{
                              duration: 2.4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="relative flex items-center justify-center"
                          >
                            {" "}
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />{" "}
                            <motion.span
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0.6, 1.2, 0.6],
                                y: [-1, -3, -1],
                                x: [1, 3, 1],
                              }}
                              transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                repeatDelay: 0.6,
                                ease: "easeInOut",
                              }}
                              className="absolute -top-1.5 -right-1.5 text-amber-300 pointer-events-none"
                            >
                              {" "}
                              <Sparkles className="w-2.5 h-2.5 fill-amber-300" />{" "}
                            </motion.span>{" "}
                          </motion.div>{" "}
                        </div>{" "}
                        <div className="min-w-0 flex-1">
                          {" "}
                          <span className="text-xs font-black text-slate-100 group-hover:text-amber-400 transition block truncate">
                            {" "}
                             {t("Performance Stats")} {" "}
                          </span>{" "}
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                            {" "}
                            <motion.span
                              animate={{
                                scale: [1, 1.25, 1],
                                opacity: [0.8, 1, 0.8],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="inline-flex items-center text-amber-400 shrink-0"
                            >
                              {" "}
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />{" "}
                            </motion.span>{" "}
                            <span className="truncate">
                              {workerPerformanceSummary.label}
                            </span>{" "}
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0" />{" "}
                    </button>{" "}
                    {/* Export as PDF Button inside #worker-btn-perf-stats */}{" "}
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      {" "}
                      <button
                        type="button"
                        id="worker-btn-export-pdf"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportPdfQuick();
                        }}
                        disabled={isExportingPdfQuick}
                        className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 disabled:bg-slate-700 disabled:text-slate-500 text-[11px] font-black rounded-lg border border-amber-500/40 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        title={t("Export official verified performance report as PDF for client interviews")}
                      >
                        {" "}
                        {isExportingPdfQuick ? (
                          <>
                            {" "}
                            <span className="w-3 h-3 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />{" "}
                            <span> {t("Exporting...")} </span>{" "}
                          </>
                        ) : exportPdfSuccessQuick ? (
                          <>
                            {" "}
                            <Check className="w-3 h-3 text-amber-400" />{" "}
                            <span className="text-amber-300">
                               {t("PDF Ready!")} </span>{" "}
                          </>
                        ) : (
                          <>
                            {" "}
                            <FileDown className="w-3.5 h-3.5" />{" "}
                            <span> {t("Export as PDF")} </span>{" "}
                          </>
                        )}{" "}
                      </button>{" "}
                      <span className="text-[10px] text-slate-400 font-medium truncate">
                        {" "}
                         {t("For Client Interviews")} {" "}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Verified by real-world job data Tooltip */}{" "}
                  <div
                    role="tooltip"
                    className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-950/95 text-amber-300 text-[11px] font-bold rounded-xl shadow-2xl border border-amber-400/40 pointer-events-none opacity-0 scale-90 translate-y-2 group-hover/perf-btn:opacity-100 group-hover/perf-btn:scale-100 group-hover/perf-btn:translate-y-0 group-focus-within/perf-btn:opacity-100 group-focus-within/perf-btn:scale-100 group-focus-within/perf-btn:translate-y-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap z-30 flex items-center gap-1.5 backdrop-blur-md ring-1 ring-amber-400/20"
                  >
                    {" "}
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />{" "}
                    <span className="tracking-wide">
                       {t("Verified by real-world job data")} </span>{" "}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-slate-950/95" />{" "}
                  </div>{" "}
                </div>{" "}
                {/* Action 2: Edit Availability */}{" "}
                <button
                  type="button"
                  id="worker-btn-edit-avail"
                  onClick={() => {
                    setShowAvailabilityModal(true);
                    playSound("click");
                  }}
                  className="p-3 bg-slate-800/90 hover:bg-slate-800 hover:border-amber-400/50 border border-slate-700/80 rounded-2xl transition flex items-center justify-between gap-3 text-left group shadow-xs cursor-pointer overflow-hidden"
                >
                  {" "}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {" "}
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      {" "}
                      <Clock className="w-4 h-4" />{" "}
                    </div>{" "}
                    <div className="min-w-0 flex-1">
                      {" "}
                      <span className="text-xs font-black text-slate-100 group-hover:text-amber-400 transition block truncate">
                        {" "}
                         {t("Edit Availability")} {" "}
                      </span>{" "}
                      <span className="text-[10px] text-amber-400 font-semibold block truncate">
                        {" "}
                        {currentWorker.isOnline
                          ? "Online (10km Radar)"
                          : "Currently Offline"}{" "}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0" />{" "}
                </button>{" "}
                {/* Action 3: Upload Portfolio Image */}{" "}
                <button
                  type="button"
                  id="worker-btn-upload-portfolio"
                  onClick={() => {
                    setShowPortfolioModal(true);
                    playSound("click");
                  }}
                  className="p-3 bg-gradient-to-r from-amber-500/20 via-amber-500/15 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 hover:border-amber-400 rounded-2xl transition flex items-center justify-between gap-3 text-left group shadow-xs cursor-pointer overflow-hidden"
                >
                  {" "}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {" "}
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition font-bold shadow-xs">
                      {" "}
                      <Camera className="w-4 h-4" />{" "}
                    </div>{" "}
                    <div className="min-w-0 flex-1">
                      {" "}
                      <span className="text-xs font-black text-white group-hover:text-amber-300 transition block truncate">
                        {" "}
                         {t("Upload Portfolio")} {" "}
                      </span>{" "}
                      <span className="text-[10px] text-amber-300 font-medium block truncate">
                        {" "}
                         {t("Add Work Photos")} {" "}
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <Plus className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition shrink-0" />{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* Rating & Performance Scorecard */}{" "}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-3xl p-6 shadow-md space-y-4">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-xs flex items-center justify-center font-black text-xl">
                    {" "}
                    <Star className="w-6 h-6 fill-slate-950" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h4 className="font-black text-xl leading-none">
                      {" "}
                      {workerPerformanceSummary.reviewsCount > 0 &&
                      workerPerformanceSummary.rating > 0
                        ? `${workerPerformanceSummary.rating.toFixed(1)} ★ Rating`
                        : "New Professional"}{" "}
                    </h4>{" "}
                    <p className="text-xs font-semibold text-amber-950 mt-1">
                      {" "}
                      {workerPerformanceSummary.reviewsCount > 0
                        ? `Based on ${workerPerformanceSummary.reviewsCount} Verified Client Review${workerPerformanceSummary.reviewsCount > 1 ? "s" : ""}`
                        : "0 Client Reviews Recorded"}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="text-right">
                  {" "}
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 block">
                     {t("Tier")} </span>{" "}
                  <span className="text-xs font-black bg-slate-950 text-amber-400 px-3 py-1 rounded-xl">
                    {" "}
                    {completedJobs.length >= 20
                      ? "Master Artisan"
                      : completedJobs.length >= 5
                        ? "Senior Craftsman"
                        : "Registered Worker"}{" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              {/* Quality Badges */}{" "}
              <div className="bg-white/20 backdrop-blur-xs rounded-2xl p-3 space-y-1.5">
                {" "}
                <span className="text-[10px] font-black text-slate-950 uppercase tracking-wider block">
                  {" "}
                   {t("Top Employer Recognitions")} {" "}
                </span>{" "}
                <div className="flex flex-wrap gap-1.5">
                  {" "}
                  <span className="px-2.5 py-1 bg-white/90 text-slate-900 font-bold text-xs rounded-xl shadow-xs">
                    {" "}
                     {t("⚡ 100% Punctual")} {" "}
                  </span>{" "}
                  <span className="px-2.5 py-1 bg-white/90 text-slate-900 font-bold text-xs rounded-xl shadow-xs">
                    {" "}
                     {t("🛠️ Master Craftsmanship")} {" "}
                  </span>{" "}
                  <span className="px-2.5 py-1 bg-white/90 text-slate-900 font-bold text-xs rounded-xl shadow-xs">
                    {" "}
                     {t("🤝 Honest & Polite")} {" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* Aadhaar Verification & Trust Badge Card */}{" "}
            <div
              className={`rounded-3xl p-6 border space-y-4 shadow-sm ${currentWorker.isVerified ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-500/10 border-amber-500/30"}`}
            >
              {" "}
              <div className="flex items-start justify-between gap-3">
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${currentWorker.isVerified ? "bg-amber-500/20 text-amber-600 border-amber-500/30" : "bg-amber-500/20 text-amber-600 border-amber-500/30"}`}
                  >
                    {" "}
                    {currentWorker.isVerified ? (
                      <ShieldCheck className="w-6 h-6" />
                    ) : (
                      <ShieldAlert className="w-6 h-6" />
                    )}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h4 className="font-bold text-slate-900 text-base">
                       {t("Govt. Aadhaar Verification")} </h4>{" "}
                    <p className="text-xs text-slate-600">
                      {" "}
                      {currentWorker.isVerified
                        ? "100% UIDAI Validated Daily Professional • Active Trusted Badge"
                        : "Verification Pending in Admin KYC Queue"}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 ${currentWorker.isVerified ? "bg-amber-600 text-white" : "bg-amber-500 text-slate-950"}`}
                >
                  {" "}
                  {currentWorker.isVerified
                    ? "✓ Active Badge"
                    : "⏳ Under Review"}{" "}
                </span>{" "}
              </div>{" "}
              <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-slate-200 space-y-2.5">
                {" "}
                <div className="flex justify-between items-center text-xs">
                  {" "}
                  <span className="text-slate-500">
                     {t("Masked Aadhaar UID")} </span>{" "}
                  <span className="font-mono font-bold text-slate-900">
                    {currentWorker.aadhaarNumberMasked}
                  </span>{" "}
                </div>{" "}
                <div className="flex justify-between items-center text-xs">
                  {" "}
                  <span className="text-slate-500">
                     {t("Security Verified Contact")} </span>{" "}
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    {" "}
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />{" "}
                    {currentWorker.phone}{" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              {/* Action buttons */}{" "}
              {!currentWorker.isVerified && (
                <div className="flex gap-2 pt-1">
                  {" "}
                  <button
                    onClick={() => {
                      verifyCurrentWorker("approved");
                      playSound("success");
                    }}
                    className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {" "}
                    <Check className="w-4 h-4" />{" "}
                    <span> {t("1-Click Test Verify")} </span>{" "}
                  </button>{" "}
                  <button
                    onClick={() => {
                      submitWorkerKyc({
                        workerName: currentWorker.name,
                        trade: currentWorker.primaryTrade,
                        phone: currentWorker.phone,
                        aadhaarNumber:
                          currentWorker.aadhaarNumberMasked.replace(
                            /X/g,
                            "9",
                          ) || "7829-4412-9901",
                        experienceYears: currentWorker.experienceYears || 4,
                      });
                      playSound("click");
                    }}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1"
                  >
                    {" "}
                    <Sparkles className="w-3.5 h-3.5" />{" "}
                    <span> {t("Resubmit")} </span>{" "}
                  </button>{" "}
                </div>
              )}{" "}
            </div>{" "}
            {/* Profile Credentials Info */}{" "}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                   {t("Worker Profile & Identity")} </h4>{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowAvatarModal(true);
                    playSound("click");
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  {" "}
                  <Camera className="w-3.5 h-3.5" />{" "}
                  <span> {t("Update Photo")} </span>{" "}
                </button>{" "}
              </div>{" "}
              {/* Profile Photo Display with 1-Click Update */}{" "}
              <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                {" "}
                <div
                  className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-800 flex items-center justify-center cursor-pointer group shrink-0"
                  onClick={() => {
                    setShowAvatarModal(true);
                    playSound("click");
                  }}
                >
                  {" "}
                  {currentWorker.avatar ? (
                    <img
                      src={currentWorker.avatar}
                      alt={currentWorker.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-white font-black text-2xl">
                      {currentWorker.name.charAt(0)}
                    </span>
                  )}{" "}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    {" "}
                    <Camera className="w-5 h-5 text-white" />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex-1 min-w-0">
                  {" "}
                  <div className="flex items-center gap-1.5">
                    {" "}
                    <span className="font-black text-slate-900 text-sm truncate">
                      {currentWorker.name}
                    </span>{" "}
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                       {t("Photo Verified")} </span>{" "}
                  </div>{" "}
                  <p className="text-slate-500 text-xs mt-0.5">
                     {t("Click photo to take selfie or choose image")} </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="divide-y divide-slate-100 text-xs">
                {" "}
                <div className="flex justify-between py-2.5">
                  {" "}
                  <span className="text-slate-500"> {t("Registered Phone")} </span>{" "}
                  <span className="font-bold text-slate-900">
                    {currentWorker.phone}
                  </span>{" "}
                </div>{" "}
                <div className="flex justify-between py-2.5">
                  {" "}
                  <span className="text-slate-500"> {t("Primary Trade")} </span>{" "}
                  <span className="font-bold text-slate-900">
                    {getTradeName(currentWorker.primaryTrade)}
                  </span>{" "}
                </div>{" "}
                <div className="flex justify-between py-2.5">
                  {" "}
                  <span className="text-slate-500">
                     {t("Daily Rate Expectation")} </span>{" "}
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{currentWorker.dailyRate} {t("/day")} </span>{" "}
                </div>{" "}
                <div className="flex justify-between py-2.5">
                  {" "}
                  <span className="text-slate-500">
                     {t("Operating City & Area")} </span>{" "}
                  <span className="font-bold text-slate-900">
                    {currentWorker.location.area}, {currentWorker.location.city}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* Embedded Gmail OTP Verification Section */}{" "}
            <GmailOtpVerificationSection
              initialEmail="bhavnoorsinghkochar@gmail.com"
              onVerified={(email) => {
                showNotification(
                  "Gmail Verified",
                  `✓ Worker email ${email} confirmed and verified.`,
                );
              }}
            />{" "}
          </div>
        )}{" "}
        {/* TAB 7: 24/7 WORKER HELPLINE & SUPPORT HUB */}{" "}
        {activeTab === "support" && (
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            {" "}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              {" "}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                {" "}
                <div>
                  {" "}
                  <div className="flex items-center gap-2">
                    {" "}
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                      {" "}
                      <ShieldCheck className="w-4 h-4" />{" "}
                    </div>{" "}
                    <h3 className="text-xl font-black text-white">
                       {t("Kaamzo Worker Support & Safety Hub")} </h3>{" "}
                  </div>{" "}
                  <p className="text-xs text-slate-400 mt-1">
                    {" "}
                     {t("24/7 dedicated worker welfare, WhatsApp assistance, dispute resolution, and wage protection.")} {" "}
                  </p>{" "}
                </div>{" "}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold shrink-0">
                  {" "}
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />{" "}
                   {t("Worker Helpline 24/7 Live")} {" "}
                </span>{" "}
              </div>{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {" "}
                {/* Card 1: IVR Voice & WhatsApp Helpline */}{" "}
                <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-3xl space-y-3 shadow-md">
                  {" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                      {" "}
                      <Phone className="w-5 h-5" />{" "}
                    </div>{" "}
                    <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase rounded-full">
                      {" "}
                       {t("Voice & WhatsApp")} {" "}
                    </span>{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h4 className="text-sm font-black text-white">
                       {t("IVR Voice & WhatsApp Helpline")} </h4>{" "}
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {" "}
                       {t("Toll-free voice assistance and direct WhatsApp messaging in Punjabi, Hindi & English.")} {" "}
                    </p>{" "}
                  </div>{" "}
                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
                    {" "}
                    <div className="flex items-center justify-between">
                      {" "}
                      <span className="text-[11px] font-bold text-slate-400">
                         {t("Helpline Number:")} </span>{" "}
                      <span className="text-sm font-mono font-black text-amber-400">
                        +91 95922 21100
                      </span>{" "}
                    </div>{" "}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {" "}
                      <a
                        href={`https://wa.me/919592221100?text=Hi%20Kaamzo%20Support,%20I%20am%20Worker%20${encodeURIComponent(currentWorker.name)}%20(${encodeURIComponent(currentWorker.primaryTrade)})%20and%20need%20assistance.`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {" "}
                        <MessageCircle className="w-3.5 h-3.5" />{" "}
                        <span> {t("WhatsApp")} </span>{" "}
                      </a>{" "}
                      <a
                        href="tel:+919592221100"
                        className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {" "}
                        <Phone className="w-3.5 h-3.5" />{" "}
                        <span> {t("Call Now")} </span>{" "}
                      </a>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Card 2: Official Helpline Email */}{" "}
                <div className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-3xl space-y-3 shadow-md flex flex-col justify-between">
                  {" "}
                  <div>
                    {" "}
                    <div className="flex items-center justify-between mb-3">
                      {" "}
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shadow-xs">
                        {" "}
                        <Mail className="w-5 h-5" />{" "}
                      </div>{" "}
                      <span className="px-2.5 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-black uppercase rounded-full">
                        {" "}
                         {t("Email Support")} {" "}
                      </span>{" "}
                    </div>{" "}
                    <h4 className="text-sm font-black text-white">
                       {t("Official Helpline Gmail")} </h4>{" "}
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {" "}
                       {t("Escalations, KYC verification inquiries, and UPI payout audits.")} {" "}
                    </p>{" "}
                  </div>{" "}
                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
                    {" "}
                    <div className="flex items-center justify-between">
                      {" "}
                      <span className="text-[11px] font-bold text-slate-400">
                         {t("Official Email:")} </span>{" "}
                      <span className="text-xs font-mono font-bold text-amber-300 truncate max-w-[190px]">
                        {" "}
                         {t("bhavnoorsinghkochar@gmail.com")} {" "}
                      </span>{" "}
                    </div>{" "}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {" "}
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=bhavnoorsinghkochar@gmail.com?cc=danishwadhawan7@gmail.com&subject=Kaamzo%20Worker%20Support%20Request%20-%20${encodeURIComponent(currentWorker.name)}`}
                        className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        {" "}
                        <Mail className="w-3.5 h-3.5 text-amber-400" />{" "}
                        <span> {t("Send Email")} </span>{" "}
                      </a>{" "}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            "bhavnoorsinghkochar@gmail.com",
                          );
                          showNotification(
                            "Copied",
                            "Helpline email copied to clipboard!",
                          );
                          playSound("click");
                        }}
                        className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        {" "}
                        <Copy className="w-3.5 h-3.5" />{" "}
                        <span> {t("Copy Email")} </span>{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Card 3: 100% Escrow Guaranteed Payout */}{" "}
                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl space-y-2">
                  {" "}
                  <div className="flex items-center gap-2">
                    {" "}
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      {" "}
                      <ShieldCheck className="w-4 h-4" />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h4 className="text-xs font-black text-white">
                         {t("100% Escrow Wage Guarantee")} </h4>{" "}
                      <span className="text-[10px] font-bold text-amber-400">
                         {t("Zero Payment Defaults")} </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <p className="text-[11px] text-slate-400">
                    {" "}
                     {t("Every customer deposits upfront escrow before work starts. Your hard work is 100% financially secured.")} {" "}
                  </p>{" "}
                </div>{" "}
                {/* Card 4: Instant UPI Settlement */}{" "}
                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl space-y-2">
                  {" "}
                  <div className="flex items-center gap-2">
                    {" "}
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      {" "}
                      <CreditCard className="w-4 h-4" />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h4 className="text-xs font-black text-white">
                         {t("Direct UPI Settlement")} </h4>{" "}
                      <span className="text-[10px] font-bold text-purple-300">
                         {t("Instant Transfer via UPI")} </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <p className="text-[11px] text-slate-400">
                    {" "}
                     {t("Earnings credit directly to your UPI handle (")} {currentWorker.upiId} {t(") upon OTP start & completion.")} {" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              {/* Embedded Gmail OTP Verification Section */}{" "}
              <div className="pt-2 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800">
                {" "}
                <GmailOtpVerificationSection
                  initialEmail={
                    currentWorker?.email || "bhavnoorsinghkochar@gmail.com"
                  }
                  onVerified={(verifiedEmail) => {
                    showNotification(
                      "Gmail Verified",
                      `✓ Worker email ${verifiedEmail} confirmed and verified.`,
                    );
                  }}
                />{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}{" "}
        </>
        )}
      </div>{" "}
      {/* Quick Action Management Modals */}{" "}
      <QuickChatModal
        isOpen={showChatModal}
        onClose={() => {
          setShowChatModal(false);
          setActiveChatJob(null);
        }}
        job={activeChatJob}
        currentUserRole="worker"
        currentUserName={currentWorker.name}
        currentUserPhone={currentWorker.phone}
        onStartCall={() => {
          if (activeChatJob) {
            startCall(
              {
                name: currentWorker.name,
                role: "worker",
                phone: currentWorker.phone,
              },
              {
                name: activeChatJob.customerName,
                role: "customer",
                phone: activeChatJob.customerPhone,
              },
              activeChatJob.title,
            );
          }
        }}
        onOpenRadar={() => {
          if (activeChatJob) {
            openGpsRadar(activeChatJob);
          }
        }}
        currentLanguage={currentLanguage}
      />{" "}
      <PerformanceStatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        worker={currentWorker}
        completedJobs={completedJobs}
        currentLanguage={currentLanguage}
      />{" "}
      <EditAvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        worker={currentWorker}
        toggleWorkerStatus={toggleWorkerStatus}
      />{" "}
      <PortfolioUploadModal
        isOpen={showPortfolioModal}
        onClose={() => setShowPortfolioModal(false)}
        worker={currentWorker}
        showNotification={showNotification}
      />{" "}
      {/* Worker Avatar & Selfie Photo Upload Modal */}{" "}
      <WorkerAvatarUploadModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        worker={currentWorker}
        onAvatarUpdated={(newAvatarUrl) => {
          updateWorkerAvatar(newAvatarUrl);
        }}
        showNotification={showNotification}
      />{" "}
      {/* Standalone Gmail OTP Verification Modal */}{" "}
      <GmailOtpVerificationModal
        isOpen={showGmailVerifyModal}
        onClose={() => setShowGmailVerifyModal(false)}
        initialEmail={regEmail || "bhavnoorsinghkochar@gmail.com"}
        targetName={currentWorker.name}
        role="worker"
        onVerified={(verifiedEmail) => {
          showNotification(
            "Gmail Verified",
            `✓ Worker email ${verifiedEmail} confirmed and verified.`,
          );
        }}
      />{" "}
    </div>
  );
};
