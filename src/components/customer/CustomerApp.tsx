import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { auth } from "../../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getT } from "../../utils/translations";
import { GoogleSSOButton } from "../common/GoogleSSOButton";
import { TradeType, Job, WorkerProfile } from "../../types";
import {
  calculateDistanceKm,
  calculateBearing,
  getCoordinatesForArea,
} from "../../utils/geo";
import {
  Plus,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
  CheckCircle,
  HardHat,
  ArrowLeft,
  LogOut,
  Building2,
  Users,
  CreditCard,
  QrCode,
  Radio,
  Lock,
  User,
  AlertCircle,
  LocateFixed,
  Navigation,
  Compass,
  Crosshair,
  Star,
  Mail,
  ThumbsUp,
  MessageSquare,
  Search,
  Paintbrush,
  Wrench,
  Zap,
  Hammer,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  Bell,
  ArrowRight,
  KeyRound,
  Copy,
  ExternalLink,
  MessageCircle,
  Check,
  Crown,
  Eye,
  EyeOff,
  AlertTriangle,
  Calendar,
  Clock,
  Calculator,
  ShieldAlert,
} from "lucide-react";
import { playSound } from "../../utils/audio";
import { Logo } from "../common/Logo";
import {
  SecurityVerificationModal,
  GmailOtpVerificationModal,
  GmailOtpVerificationSection,
} from "../common/SecurityVerificationModal";
import { RateEmployeeModal } from "../common/RateEmployeeModal";
import { QuickChatModal, ChatTarget } from "../common/QuickChatModal";
import { CustomerSubscriptionModal } from "./CustomerSubscriptionModal";
import { UpiQrPaymentModal } from "../common/UpiQrPaymentModal";
import { useTranslation } from "react-i18next";

export const GOV_SERVICE_CATEGORIES: {
  trade: TradeType;
  label: string;
  sublabel: string;
  govHourlyRate: number;
  defaultTitle: string;
}[] = [
  {
    trade: "Carpenter",
    label: "Carpenter",
    sublabel: "Furniture & wood",
    govHourlyRate: 225,
    defaultTitle: "Custom Woodwork & Repair",
  },
  {
    trade: "Plumber",
    label: "Plumber",
    sublabel: "Pipe & fitting",
    govHourlyRate: 299,
    defaultTitle: "Pipe Leak Repair & Fitting",
  },
  {
    trade: "Mason",
    label: "Mason",
    sublabel: "Brick & plaster",
    govHourlyRate: 150,
    defaultTitle: "Brick & Plaster Masonry",
  },
  {
    trade: "Painter",
    label: "Painter",
    sublabel: "Wall coating",
    govHourlyRate: 125,
    defaultTitle: "Home Wall Painting & Primer",
  },
  {
    trade: "Construction Helper",
    label: "Unskilled Labour",
    sublabel: "General helper",
    govHourlyRate: 100,
    defaultTitle: "General Construction & Shifting Help",
  },
  {
    trade: "Electrician",
    label: "Electrician",
    sublabel: "Wiring & appliances",
    govHourlyRate: 220,
    defaultTitle: "Electrical Wiring & Switchboard Repair",
  },
  {
    trade: "Tile Worker",
    label: "Tile Worker",
    sublabel: "Flooring & tiles",
    govHourlyRate: 180,
    defaultTitle: "Tile Installation & Grouting",
  },
  {
    trade: "Welder",
    label: "Welder",
    sublabel: "Metal & fabrication",
    govHourlyRate: 200,
    defaultTitle: "Gate & Metal Grill Welding",
  },
  {
    trade: "Loader/Mover",
    label: "Loader / Mover",
    sublabel: "Heavy goods shifting",
    govHourlyRate: 120,
    defaultTitle: "Luggage & Goods Loading / Unloading",
  },
];

interface CustomerAppProps {
  isEmbedded?: boolean;
}
export const CustomerApp: React.FC<CustomerAppProps> = ({
  isEmbedded = false,
}) => {
    const { t } = useTranslation();
  const {
    currentCustomer,
    currentCity,
    supportedCities,
    setCurrentCity,
    detectAndSetLiveLocation,
    snapToRealWorldAddress,
    isLocating,
    customerAccounts,
    loginCustomerWithAuth,
    registerCustomerWithAuth,
    loginCustomer,
    logoutCustomer,
    updateCustomerGps,
    refreshCustomerGpsLocation,
    jobs,
    workers,
    postJob,
    releasePaymentByCustomer,
    subscribeCustomerPremium,
    rateWorkerJob,
    setCurrentRole,
    currentLanguage,
    startCall,
    openGpsRadar,
    openUpiPayment,
    openMultiChannelModal,
    openTop5Shortlist,
    showNotification,
    acceptJobByWorker,
    approveWorker,
    rejectWorker,
    dispatchJobStartOtp,
    latestTop5Matches,
    latestMatchedJob,
    getTop5WorkersForJob,
    matchJobWithWorkers,
    openProtectionModal,
    refundEscrowToCustomer,
    raiseJobComplaint,
    openSubscriptionPromo,
    approveAndFundEscrow,
  } = useApp();
  /*  Subscription Modal State  */ const [
    showCustomerSubscriptionModal,
    setShowCustomerSubscriptionModal,
  ] = useState(false);
  /*  Dispute & Complaint Modal State  */ const [
    complaintJob,
    setComplaintJob,
  ] = useState<Job | null>(null);
  const [complaintReason, setComplaintReason] = useState<string>(
    "Worker did not arrive at site / Absent",
  );
  const [complaintDetails, setComplaintDetails] = useState<string>("");
  const [isSubmittingComplaint, setIsSubmittingComplaint] =
    useState<boolean>(false);
  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintJob) return;
    setIsSubmittingComplaint(true);
    setTimeout(() => {
      setIsSubmittingComplaint(false);
      raiseJobComplaint(complaintJob.id, complaintReason, complaintDetails);
      setComplaintJob(null);
      setComplaintReason("Worker did not arrive at site / Absent");
      setComplaintDetails("");
    }, 350);
  };
  /* Navigation Sub-Tabs: 'find_workers' | 'my_bookings' | 'support' */ const [
    activeTab,
    setActiveTab,
  ] = useState<"find_workers" | "my_bookings" | "support">("find_workers");
  /* Auth Tab Mode: 'login' | 'register' */ const [authTab, setAuthTab] =
    useState<"login" | "register">("login");
  const [workerViewMode, setWorkerViewMode] = useState<"list" | "radar">(
    "list",
  );
  const [selectedRadarWorker, setSelectedRadarWorker] =
    useState<WorkerProfile | null>(null);
  /*  Search & Filters State  */ const [searchQuery, setSearchQuery] =
    useState<string>("");
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>("All");
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(1.0);
  const [minWage, setMinWage] = useState<string>("");
  const [maxWage, setMaxWage] = useState<string>("");
  const [strict10kmOnly, setStrict10kmOnly] = useState<boolean>(true);
  /*  Direct Worker Booking Modal State  */ const [
    bookingWorker,
    setBookingWorker,
  ] = useState<WorkerProfile | null>(null);
  const [directJobTitle, setDirectJobTitle] = useState<string>("");
  const [directJobDuration, setDirectJobDuration] = useState<number>(1);
  const [directJobDescription, setDirectJobDescription] = useState<string>("");
  const [prepayBooking, setPrepayBooking] = useState<{
    type: "direct" | "broadcast" | "approve_escrow";
    jobId?: string;
    amount: number;
    workerName: string;
  } | null>(null);
  /*  Login form states  */ const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  /*  Registration form states  */ const [regName, setRegName] = useState("");
  const [regUserId, setRegUserId] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState("+91 99100 88221");
  const [regEmail, setRegEmail] = useState("bhavnoorsinghkochar@gmail.com");
  const [regArea, setRegArea] = useState(
    () => currentCity?.defaultArea || "Model Town",
  );
  const [regAddress, setRegAddress] = useState(
    () =>
      `House 142, ${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}, ${currentCity?.state || "Punjab"}`,
  );
  const [regUpi, setRegUpi] = useState("bhavnoor.verma@okhdfcbank");
  /*  Security Verification Modal State  */ const [
    showSecurityModal,
    setShowSecurityModal,
  ] = useState(false);
  const [showGmailVerifyModal, setShowGmailVerifyModal] = useState(false);
  /*  Rating Modal State  */ const [ratingJob, setRatingJob] =
    useState<Job | null>(null);
  /*  Quick Chat Modal State  */ const [showChatModal, setShowChatModal] =
    useState(false);
  const [activeChatJob, setActiveChatJob] = useState<Job | null>(null);
  const [activeChatTarget, setActiveChatTarget] = useState<ChatTarget | null>(
    null,
  );
  /*  OTP Dispatch & Copy State  */ const [copiedOtpJobId, setCopiedOtpJobId] =
    useState<string | null>(null);
  const [dispatchedEmailOtpJobs, setDispatchedEmailOtpJobs] = useState<
    Record<string, boolean>
  >({});
  const [isDispatchingOtp, setIsDispatchingOtp] = useState<
    Record<string, boolean>
  >({});
  const handleSendOtpEmail = async (job: Job) => {
    setIsDispatchingOtp((prev) => ({ ...prev, [job.id]: true }));
    try {
      const email = currentCustomer?.email || "bhavnoorsinghkochar@gmail.com";
      const success = await dispatchJobStartOtp(job, email);
      setDispatchedEmailOtpJobs((prev) => ({ ...prev, [job.id]: true }));
      if (success) {
        playSound("success");
      }
    } finally {
      setIsDispatchingOtp((prev) => ({ ...prev, [job.id]: false }));
    }
  };
  const handleSendOtpSms = (job: Job) => {
    const targetPhone = (
      job.assignedWorkerPhone ||
      currentCustomer?.phone ||
      "+919910088221"
    ).replace(/[^0-9]/g, "");
    const body = encodeURIComponent(
      `🔑 Dihadi Start-of-Work Passcode: ${job.otpCode} for"${job.title}". Enter this 4-digit code in your app upon arrival to start work.`,
    );
    window.location.href = `sms:${targetPhone}?body=${body}`;
  };
  const handleShareOtpWhatsApp = (job: Job) => {
    const targetPhone = (
      job.assignedWorkerPhone ||
      currentCustomer?.phone ||
      "9910088221"
    ).replace(/[^0-9]/g, "");
    const phoneWithCountry =
      targetPhone.length === 10 ? `91${targetPhone}` : targetPhone;
    const msg = encodeURIComponent(
      `*🔑 DIHADI WORKER START OTP*\n\nJob: *${job.title}*\nStart Passcode: *${job.otpCode}*\nAgreed Daily Wage: ₹${job.dailyWage}\n\nEnter this 4-digit code in your Dihadi app upon arrival to start the work clock!`,
    );
    window.open(
      `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${msg}`,
      "_blank",
    );
  };
  const handleCopyOtp = (job: Job) => {
    navigator.clipboard?.writeText(job.otpCode);
    setCopiedOtpJobId(job.id);
    playSound("click");
    showNotification(`Copied Start OTP: ${job.otpCode}`);
    setTimeout(() => setCopiedOtpJobId(null), 2500);
  };
  /*  Job Posting modal state  */ const [showPostModal, setShowPostModal] =
    useState(false);
  /*  Form State for Post Job  */ const getTodayFormatted = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const [trade, setTrade] = useState<TradeType>("Carpenter");
  const [title, setTitle] = useState("Custom Woodwork & Repair");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(getTodayFormatted);
  const [endDate, setEndDate] = useState(getTodayFormatted);
  const [shiftStartTime, setShiftStartTime] = useState("09:00");
  const [shiftEndTime, setShiftEndTime] = useState("14:00");
  const [hoursPerDay, setHoursPerDay] = useState<number>(5);
  const [worksiteAddress, setWorksiteAddress] = useState<string>("");
  const [dailyWage, setDailyWage] = useState<number>(1125);
  const [durationDays, setDurationDays] = useState<number>(1);
  const getCalculatedTotalDays = (start: string, end: string) => {
    try {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) || diffDays < 1 ? 1 : diffDays;
    } catch {
      return 1;
    }
  };
  const calculateHoursFromTimes = (start: string, end: string) => {
    try {
      const [h1, m1] = start.split(":").map(Number);
      const [h2, m2] = end.split(":").map(Number);
      let diff = h2 + m2 / 60 - (h1 + m1 / 60);
      if (diff <= 0) diff = 1;
      return Math.round(diff * 10) / 10;
    } catch {
      return 5;
    }
  };
  const selectedCategory =
    GOV_SERVICE_CATEGORIES.find((c) => c.trade === trade) ||
    GOV_SERVICE_CATEGORIES[0];
  const activeGovHourlyRate = selectedCategory.govHourlyRate;
  const calculatedTotalDays = getCalculatedTotalDays(startDate, endDate);
  const baseLabor = Math.round(
    activeGovHourlyRate * hoursPerDay * calculatedTotalDays,
  );
  const platformFee = Math.round(baseLabor * 0.2);
  const totalCustomerPayment = baseLabor + platformFee;
  const workerEarnings = baseLabor;
  const handleSelectCategory = (cat: (typeof GOV_SERVICE_CATEGORIES)[0]) => {
    setTrade(cat.trade);
    setTitle(cat.defaultTitle);
    playSound("click");
  };
  useEffect(() => {
    if (currentCustomer?.address && !worksiteAddress) {
      setWorksiteAddress(currentCustomer.address);
    }
  }, [currentCustomer]);
  useEffect(() => {
    if (currentCity) {
      setRegArea(currentCity.defaultArea);
      setRegAddress(
        `House 142, ${currentCity.defaultArea}, ${currentCity.name}, ${currentCity.state}`,
      );
      if (!locationQuery) {
        setLocationQuery(currentCity.name);
      }
    }
  }, [currentCity]);
  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || user.uid;
      const name = user.displayName || "Customer";
      const found = customerAccounts.find(
        (a) => a.id.toLowerCase() === email.toLowerCase(),
      );
      if (found) {
        const res = loginCustomerWithAuth(
          found.id,
          found.password || "google123",
        );
        if (!res.success) setAuthError(res.error || "Login failed");
      } else {
        const tempPass = "google123";
        registerCustomerWithAuth({
          userId: email,
          password: tempPass,
          name: name,
          phone: user.phoneNumber || "+91 99999 99999",
          email: user.email || undefined,
          isEmailVerified: true,
          area: currentCity?.defaultArea || "City",
          address: "Google Sign In User",
        });
        loginCustomerWithAuth(email, tempPass);
      }
    } catch (error: any) {
      if (
        error?.code === "auth/cancelled-popup-request" ||
        error?.code === "auth/popup-closed-by-user"
      ) {
        console.warn("User cancelled the Google popup sign-in.");
        return;
      }
      if (error?.code === "auth/unauthorized-domain") {
        const domain = typeof window !== "undefined" ? window.location.hostname : "your Vercel domain";
        setAuthError(
          `Unauthorized Domain (${domain}): Please add "${domain}" to Firebase Console -> Authentication -> Settings -> Authorized domains (Project ID: nifty-backup-mc9s2).`
        );
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
    const result = loginCustomerWithAuth(loginId, loginPassword);
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
    registerCustomerWithAuth({
      userId: chosenId,
      password: regPassword.trim(),
      name: regName.trim(),
      phone: regPhone.trim() || "+91 99100 88221",
      email: regEmail.trim() || undefined,
      isPhoneVerified: true,
      isEmailVerified: !!regEmail.trim(),
      area: regArea || currentCity?.defaultArea || "Model Town",
      address:
        regAddress ||
        `House 142, ${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
      upiId: regUpi || `${chosenId}@upi`,
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
    registerCustomerWithAuth({
      userId: chosenId,
      password: regPassword.trim() || "123",
      name: regName.trim(),
      phone: verifiedData.verifiedPhone || regPhone,
      email: verifiedData.verifiedEmail || regEmail,
      isPhoneVerified: verifiedData.isPhoneVerified,
      isEmailVerified: verifiedData.isEmailVerified,
      area: regArea || currentCity?.defaultArea || "Model Town",
      address:
        regAddress ||
        `House 142, ${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
      upiId: regUpi || `${chosenId}@upi`,
    });
  };
  const handleQuickDemoLogin = (userId: string, pass: string) => {
    setLoginId(userId);
    setLoginPassword(pass);
    setAuthError(null);
    loginCustomerWithAuth(userId, pass);
  };
  const getTradeName = (t: TradeType | string) => {
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
  const processPrepaidBooking = () => {
    if (!prepayBooking || !currentCustomer) return;
    if (prepayBooking.type === "approve_escrow" && prepayBooking.jobId) {
      approveAndFundEscrow(prepayBooking.jobId);
    }
    setPrepayBooking(null);
  };
  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;
    if (!title.trim()) {
      showNotification(
        "Missing Details",
        "Please specify the work requirement title.",
      );
      playSound("click");
      return;
    }
    const siteAddr =
      worksiteAddress.trim() ||
      currentCustomer.address ||
      `House 142, ${currentCustomer.area}`;
    const createdJob = postJob({
      title: title.trim(),
      trade,
      description:
        description.trim() ||
        `Need verified ${selectedCategory.label} for scheduled work at site.`,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      locationAddress: siteAddr,
      area: currentCustomer.area,
      dailyWage: Math.round(activeGovHourlyRate * hoursPerDay),
      durationDays: calculatedTotalDays,
      startDate,
      endDate,
      shiftStartTime,
      shiftEndTime,
      hoursPerDay,
      hourlyRate: activeGovHourlyRate,
      baseLabor,
    });
    if (createdJob) {
      setShowPostModal(false);
      playSound("success");
      showNotification(
        "Job Requirement Broadcasted!",
        `Broadcasted to verified workers within 10km at official ₹${activeGovHourlyRate}/hr rate.`,
      );
      setActiveTab("my_bookings");
    }
  };
  const handleConfirmDirectBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer || !bookingWorker) return;
    const workerTrade = bookingWorker.primaryTrade;
    const workerDailyWage = bookingWorker.dailyRate;
    const jobTitle =
      directJobTitle.trim() || `Hired ${bookingWorker.name} for ${workerTrade}`;
    const createdJob = postJob({
      title: jobTitle,
      trade: workerTrade,
      description:
        directJobDescription ||
        `Direct booking for ${bookingWorker.name} (${workerTrade}).`,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      locationAddress: currentCustomer.address,
      area: currentCustomer.area,
      dailyWage: Number(workerDailyWage) || 850,
      durationDays: Number(directJobDuration) || 1,
    });
    if (createdJob) {
      acceptJobByWorker(createdJob.id, bookingWorker);
      playSound("success");
      showNotification(
        `Booked ${bookingWorker.name}! Proceed to approve and pay.`,
      );
    }
    setBookingWorker(null);
    setDirectJobTitle("");
    setDirectJobDescription("");
    setActiveTab("my_bookings");
  };
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTradeFilter("All");
    setLocationQuery("");
    setMinRating(1.0);
    setMinWage("");
    setMaxWage("");
    setStrict10kmOnly(true);
  };
  const custLat = currentCustomer?.gpsLocation?.lat || 30.8926;
  const custLng = currentCustomer?.gpsLocation?.lng || 75.8415;
  /* Filter workers based on query, selected trade, rating, price, and strict 10km radar */ const filteredWorkers =
    useMemo(() => {
      return workers.filter((w) => {
        // Only show verified workers to customers
        if (!w.isVerified) return false;
        
        const workerLat = w.gpsLocation?.lat || custLat;
        const workerLng = w.gpsLocation?.lng || custLng;
        const distance = calculateDistanceKm(
          custLat,
          custLng,
          workerLat,
          workerLng,
        );
        /*  Strict 10km hyperlocal constraint  */ if (
          strict10kmOnly &&
          distance > 10.0
        ) {
          return false;
        }
        /*  Trade filter  */ if (
          selectedTradeFilter !== "All" &&
          w.primaryTrade !== selectedTradeFilter
        ) {
          return false;
        }
        /*  Search Query filter  */ if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTrade = (w.primaryTrade || "").toLowerCase().includes(q);
          const matchesName = (w.name || "").toLowerCase().includes(q);
          const workerSkills = (w as any).skills || w.secondaryTrades || [];
          const matchesSkills =
            Array.isArray(workerSkills) &&
            workerSkills.some((s: string) =>
              (s || "").toLowerCase().includes(q),
            );
          const matchesArea = (w.location?.area || "")
            .toLowerCase()
            .includes(q);
          if (!matchesTrade && !matchesName && !matchesSkills && !matchesArea) {
            return false;
          }
        }
        /*  Location query filter  */ if (locationQuery.trim()) {
          const loc = locationQuery.toLowerCase().trim();
          const matchesCity = (w.location?.city || "")
            .toLowerCase()
            .includes(loc);
          const matchesArea = (w.location?.area || "")
            .toLowerCase()
            .includes(loc);
          if (!matchesCity && !matchesArea) {
            /*  If searching for distance/radar, keep within radius  */
          }
        }
        /*  Min Rating  */ if (w.rating < minRating) {
          return false;
        }
        /*  Price filter  */ if (minWage && w.dailyRate < Number(minWage)) {
          return false;
        }
        if (maxWage && w.dailyRate > Number(maxWage)) {
          return false;
        }
        return true;
      });
    }, [
      workers,
      selectedTradeFilter,
      searchQuery,
      locationQuery,
      minRating,
      minWage,
      maxWage,
      strict10kmOnly,
      custLat,
      custLng,
    ]);
  /*  IF NOT LOGGED IN: Show Customer Login  */ if (!currentCustomer) {
    return (
      <div
        className={`bg-white flex flex-col h-full overflow-y-auto select-none ${isEmbedded ? "w-full" : "max-w-md mx-auto rounded-3xl border border-slate-200 shadow-xl"}`}
      >
        {" "}
        {/* Header */}{" "}
        <div className="p-5 bg-amber-600 text-white shrink-0 rounded-t-3xl">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <div className="flex items-center gap-2">
              {" "}
              <button
                onClick={() => setCurrentRole("select_role")}
                className="p-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition"
                title={getT(currentLanguage, "back_to_role_selection")}
              >
                {" "}
                <ArrowLeft className="w-4 h-4" />{" "}
              </button>{" "}
              <div>
                {" "}
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  {" "}
                  <Building2 className="w-5 h-5 text-amber-200" />{" "}
                  {getT(currentLanguage, "role_customer_title")}{" "}
                </h3>{" "}
                <p className="text-xs text-amber-100">
                  {" "}
                  {authTab === "login"
                    ? getT(currentLanguage, "auth_tab_login")
                    : getT(currentLanguage, "auth_tab_register")}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="p-5 space-y-4 flex-1">
          {" "}
          {/* Tab Switcher */}{" "}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {" "}
            <button
              onClick={() => {
                setAuthTab("login");
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${authTab === "login" ? "bg-white text-amber-900 shadow-xs" : "text-slate-500 hover:text-slate-900 "}`}
            >
              {" "}
              {getT(currentLanguage, "auth_sign_in")}{" "}
            </button>{" "}
            <button
              onClick={() => {
                setAuthTab("register");
                setAuthError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${authTab === "register" ? "bg-white text-amber-900 shadow-xs" : "text-slate-500 hover:text-slate-900 "}`}
            >
              {" "}
              {getT(currentLanguage, "auth_register")}{" "}
            </button>{" "}
          </div>{" "}
          {authError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl flex items-center gap-2">
              {" "}
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />{" "}
              <span>{authError}</span>{" "}
            </div>
          )}{" "}
          {authTab === "login" ? (
            /* Customer Login Form */ <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-600 pl-8"
                    />{" "}
                    <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />{" "}
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
                      className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 hover:underline"
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-600 pl-8 pr-9"
                    />{" "}
                    <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />{" "}
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-1"
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
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-2xl shadow-md text-xs transition flex items-center justify-center gap-2 mt-4"
                >
                  {" "}
                  <CheckCircle className="w-4 h-4" />{" "}
                  <span>{getT(currentLanguage, "auth_login_btn")}</span>{" "}
                </button>{" "}
                <GoogleSSOButton roleTarget="customer" variant="light" label={getT(currentLanguage, "auth_login_btn") + " with Google"} />{" "}
              </form>{" "}
            </div>
          ) : (
            /* Customer Register Form */ <form
              onSubmit={handleRegisterSubmit}
              className="space-y-3 text-xs"
            >
              {" "}
              <div>
                {" "}
                <label className="font-bold text-slate-700 block mb-1">
                  {" "}
                  {getT(currentLanguage, "employer_full_name_label")}{" "}
                </label>{" "}
                <input
                  type="text"
                  placeholder={t("e.g. Bhavnoor Singh")}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                  required
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
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
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600 pr-8"
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
                    {" "}
                    {getT(currentLanguage, "employer_phone_label")}{" "}
                  </label>{" "}
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-amber-600"
                    required
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    {" "}
                    <span> {t("Gmail / Email")} </span>{" "}
                    <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                       {t("Security OTP")} </span>{" "}
                  </label>{" "}
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={t("name@gmail.com")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-amber-600"
                    required
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex items-center justify-between">
                {" "}
                <label className="font-bold text-slate-700 block text-xs">
                  {" "}
                  {getT(currentLanguage, "employer_area_label")}  {t("& Address")} {" "}
                </label>{" "}
                <button
                  type="button"
                  onClick={async () => {
                    const res = await snapToRealWorldAddress();
                    if (res) {
                      setRegArea(
                        res.sublocality ||
                          res.street ||
                          currentCity.defaultArea,
                      );
                      setRegAddress(res.formattedAddress);
                    }
                  }}
                  disabled={isLocating}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 transition disabled:opacity-50"
                  title={t("Detect and snap to exact street address via GPS")}
                >
                  {" "}
                  <Crosshair className="w-3 h-3 text-amber-600" />{" "}
                  <span>
                    {isLocating
                      ? "Resolving Address..."
                      : "Snap Real-World Address"}
                  </span>{" "}
                </button>{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-2">
                {" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                    {" "}
                    {getT(currentLanguage, "employer_area_label")}{" "}
                  </label>{" "}
                  <input
                    type="text"
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                    required
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                     {t("UPI ID for Payouts")} </label>{" "}
                  <input
                    type="text"
                    value={regUpi}
                    onChange={(e) => setRegUpi(e.target.value)}
                    placeholder={t("e.g. name@okhdfcbank")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-amber-600"
                    required
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="font-bold text-slate-700 block mb-1">
                   {t("Full Delivery / Site Address")} </label>{" "}
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                  required
                />{" "}
              </div>{" "}
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-2xl shadow-md text-xs transition flex items-center justify-center gap-2 mt-3"
              >
                {" "}
                <ShieldCheck className="w-4 h-4 text-amber-300" />{" "}
                <span> {t("Verify Gmail / SMS & Register")} </span>{" "}
              </button>
              <div className="relative flex items-center py-2 mt-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                   {t("Or")} </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <GoogleSSOButton roleTarget="customer" variant="light" label={getT(currentLanguage, "auth_register_btn") + " with Google"} />
            </form>
          )}{" "}
        </div>{" "}
        {/* Security Verification Modal for registration */}{" "}
        <SecurityVerificationModal
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
          targetName={regName}
          email={regEmail}
          phone={regPhone}
          role="customer"
          onVerificationComplete={handleVerificationSuccess}
        />{" "}
      </div>
    );
  }
  /*  LOGGED IN CUSTOMER VIEW  */ const myCustomerJobs = jobs.filter(
    (j) => j.customerPhone === currentCustomer.phone,
  );
  const activeRequests = myCustomerJobs.filter(
    (j) => j.status !== "paid_and_closed",
  );
  const pastPaidJobs = myCustomerJobs.filter(
    (j) => j.status === "paid_and_closed",
  );
  const popularServiceCategories = [
    {
      trade: "Mason" as TradeType,
      label: "Mason",
      iconName: "Building2",
      subtitle: "Architecture & Brickwork",
    },
    {
      trade: "Painter" as TradeType,
      label: "Painter",
      iconName: "Paintbrush",
      subtitle: "Wall & Texture Paint",
    },
    {
      trade: "Plumber" as TradeType,
      label: "Plumber",
      iconName: "Wrench",
      subtitle: "Pipes, Taps & Motors",
    },
    {
      trade: "Electrician" as TradeType,
      label: "Electrician",
      iconName: "Zap",
      subtitle: "Wiring & Appliances",
    },
    {
      trade: "Carpenter" as TradeType,
      label: "Carpenter",
      iconName: "Hammer",
      subtitle: "Woodwork & Furniture",
    },
    {
      trade: "Construction Helper" as TradeType,
      label: "Cleaner",
      iconName: "Sparkles",
      subtitle: "Site Cleaning & Help",
    },
  ];
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans select-none rounded-none sm:rounded-3xl overflow-hidden sm:shadow-2xl sm:border border-slate-200 w-full max-w-full">
      {/* 1. Customer Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 relative lg:sticky lg:top-16 z-20 shadow-xs w-full">
        {" "}
        <div className="flex items-center gap-4 sm:gap-6">
          {" "}
          {/* Logo */}{" "}
          <div
            onClick={() => setActiveTab("find_workers")}
            className="flex items-center cursor-pointer group"
          >
            {" "}
            <Logo className="scale-[0.6] origin-left group-hover:scale-[0.65] transition-transform" />{" "}
          </div>{" "}
          {/* Sub Navigation Tabs */}{" "}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto">
            {" "}
            <button
              onClick={() => setActiveTab("find_workers")}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === "find_workers" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"}`}
            >
              {" "}
              <Users className="w-3.5 h-3.5" /> <span> {t("Find Workers")} </span>{" "}
            </button>{" "}
            <button
              onClick={() => setActiveTab("my_bookings")}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === "my_bookings" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"}`}
            >
              {" "}
              <Building2 className="w-3.5 h-3.5" /> <span> {t("My Bookings")} </span>{" "}
              {activeRequests.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === "my_bookings" ? "bg-amber-400 text-slate-950" : "bg-amber-600 text-white"}`}
                >
                  {" "}
                  {activeRequests.length}{" "}
                </span>
              )}{" "}
            </button>{" "}
            <button
              onClick={() => setActiveTab("support")}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === "support" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"}`}
            >
              {" "}
              <HelpCircle className="w-3.5 h-3.5" /> <span> {t("Support")} </span>{" "}
            </button>{" "}
            <button
              onClick={() => {
                setShowPostModal(true);
                playSound("click");
              }}
              className="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-xs border border-amber-400/80 ring-2 ring-amber-400/20 hover:scale-105 cursor-pointer shrink-0"
              title={t("Post a new job broadcast to workers within 10km")}
            >
              {" "}
              <Plus className="w-3.5 h-3.5 stroke-[3]" />{" "}
              <span> {t("Post a Job")} </span>{" "}
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {/* Right User & Quick Post Job Actions */}{" "}
        <div className="flex items-center gap-3">
          {" "}
          {/* Prominently Highlighted Post a Job Button */}{" "}
          <button
            id="header-post-job-btn"
            onClick={() => {
              setShowPostModal(true);
              playSound("click");
            }}
            className="relative group px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-black transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 shadow-lg shadow-amber-500/30 border-2 border-amber-300 ring-4 ring-amber-400/20 cursor-pointer overflow-hidden"
            title={t("Post a Job & Broadcast to Workers")}
          >
            {" "}
            <div className="w-5 h-5 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center shadow-xs shrink-0">
              {" "}
              <Plus className="w-3.5 h-3.5 stroke-[3]" />{" "}
            </div>{" "}
            <span className="tracking-wide text-xs whitespace-nowrap">
               {t("Post a Job")} </span>{" "}
            <span className="px-1.5 py-0.5 bg-slate-950/90 text-amber-300 text-[9px] font-black rounded-md uppercase tracking-wider hidden sm:inline-block">
              {" "}
               {t("10km Live")} {" "}
            </span>{" "}
          </button>{" "}
          <button
            id="header-verify-gmail-btn"
            onClick={() => setShowGmailVerifyModal(true)}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-200 cursor-pointer"
            title={t("Verify Gmail with 6-digit OTP")}
          >
            {" "}
            <Mail className="w-3.5 h-3.5 text-amber-600" />{" "}
            <span className="hidden sm:inline"> {t("Verify Gmail")} </span>{" "}
          </button>{" "}
          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />{" "}
          {/* User Profile & Sign Out */}{" "}
          <div className="flex items-center gap-2.5">
            {" "}
            <div className="text-right hidden md:block">
              {" "}
              <p className="text-xs font-black text-slate-900 uppercase">
                {currentCustomer.name}
              </p>{" "}
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-100">
                {" "}
                 {t("Customer (")} {currentCustomer.area}){" "}
              </span>{" "}
            </div>{" "}
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center border border-slate-700">
              {" "}
              {currentCustomer.name.charAt(0)}{" "}
            </div>{" "}
            <button
              onClick={logoutCustomer}
              className="px-2.5 py-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-200"
              title={t("Sign Out")}
            >
              {" "}
              <LogOut className="w-3.5 h-3.5" />{" "}
              <span className="hidden sm:inline"> {t("Sign Out")} </span>{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </nav>{" "}
      {/* 2. Main Content Area */}{" "}
      {activeTab === "find_workers" && (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
          {" "}
          {/* A. Hero Search Banner (As shown in screenshot) */}{" "}
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
            {" "}
            {/* Background Decorative Rings */}{" "}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />{" "}
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />{" "}
            <div className="max-w-2xl space-y-5 z-10">
              {" "}
              {/* Pill Tag */}{" "}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold">
                {" "}
                <ShieldCheck className="w-4 h-4 text-amber-400" />{" "}
                <span> {t("Verified Local Daily Wage Workforce")} </span>{" "}
              </div>{" "}
              {/* Headline */}{" "}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {" "}
                 {t("Find Trusted Workers.")} <br />{" "}
                <span className="text-amber-400">
                   {t("Get The Job Done With Dignity.")} </span>{" "}
              </h2>{" "}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {" "}
                 {t("Connect directly with verified electricians, plumbers, carpenters, painters, and masons for daily wage or project work.")} {" "}
              </p>{" "}
              {/* Large Search Input & Action Bar */}{" "}
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
                {" "}
                <div className="relative flex-1">
                  {" "}
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />{" "}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("Search trade or skill (e.g. Electrician, Plumbing)...")}
                    className="w-full bg-white text-slate-900 pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md placeholder:text-slate-400"
                  />{" "}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {" "}
                      <X className="w-4 h-4" />{" "}
                    </button>
                  )}{" "}
                </div>{" "}
                <button
                  type="button"
                  onClick={() => playSound("click")}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm transition shadow-md flex items-center justify-center gap-2 shrink-0 border border-slate-700 cursor-pointer"
                >
                  {" "}
                  <Search className="w-4 h-4 text-amber-400" />{" "}
                  <span> {t("Search")} </span>{" "}
                </button>{" "}
                <button
                  id="hero-post-job-btn"
                  type="button"
                  onClick={() => {
                    setShowPostModal(true);
                    playSound("click");
                  }}
                  className="relative group px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-amber-500/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 shrink-0 border-2 border-amber-200 ring-4 ring-amber-400/30 cursor-pointer overflow-hidden"
                  title={t("Broadcast a new job to verified workers in 10km radius")}
                >
                  {" "}
                  <div className="w-6 h-6 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-xs shrink-0">
                    {" "}
                    <Plus className="w-4 h-4 stroke-[3]" />{" "}
                  </div>{" "}
                  <span className="text-sm sm:text-base font-black tracking-tight">
                     {t("Post a Job Broadcast")} </span>{" "}
                  <span className="px-2 py-0.5 bg-slate-950 text-amber-300 text-[10px] font-black rounded-md uppercase tracking-wider hidden sm:inline-block">
                    {" "}
                     {t("10km Radar")} {" "}
                  </span>{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* Right Hero Image / Illustration */}{" "}
            <div className="relative z-10 shrink-0 w-full sm:w-80 lg:w-96">
              {" "}
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/60 shadow-2xl bg-slate-900">
                {" "}
                <img
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
                  alt={t("Dihadi Verified Worker")}
                  className="w-full h-56 sm:h-64 object-cover object-center"
                  referrerPolicy="no-referrer"
                />{" "}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />{" "}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  {" "}
                  <span className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/50 px-2.5 py-1 rounded-lg text-amber-300 font-bold">
                    {" "}
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />{" "}
                     {t("Strict 10km GPS Radar")} {" "}
                  </span>{" "}
                  <span className="bg-slate-900/80 px-2 py-1 rounded-lg font-mono text-[11px] text-slate-300">
                    {" "}
                     {t("Aadhaar KYC Verified")} {" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* B. Popular Services Category Chips (As shown in screenshot) */}{" "}
          <div className="space-y-3">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                {" "}
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />{" "}
                <span> {t("Popular Services")} </span>{" "}
              </h3>{" "}
              {selectedTradeFilter !== "All" && (
                <button
                  onClick={() => setSelectedTradeFilter("All")}
                  className="text-xs text-amber-600 font-bold hover:underline"
                >
                  {" "}
                   {t("Clear Selection (Show All)")} {" "}
                </button>
              )}{" "}
            </div>{" "}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {" "}
              {popularServiceCategories.map((cat) => {
                const isSelected = selectedTradeFilter === cat.trade;
                return (
                  <button
                    key={cat.trade}
                    onClick={() => {
                      setSelectedTradeFilter(isSelected ? "All" : cat.trade);
                      playSound("click");
                    }}
                    className={`p-4 rounded-2xl border transition text-center flex flex-col items-center justify-center gap-2 group ${isSelected ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-md" : "bg-white hover:bg-slate-50 border-slate-200 shadow-xs"}`}
                  >
                    {" "}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition ${isSelected ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"}`}
                    >
                      {" "}
                      {cat.trade === "Mason" && (
                        <Building2 className="w-6 h-6" />
                      )}{" "}
                      {cat.trade === "Painter" && (
                        <Paintbrush className="w-6 h-6" />
                      )}{" "}
                      {cat.trade === "Plumber" && (
                        <Wrench className="w-6 h-6" />
                      )}{" "}
                      {cat.trade === "Electrician" && (
                        <Zap className="w-6 h-6" />
                      )}{" "}
                      {cat.trade === "Carpenter" && (
                        <Hammer className="w-6 h-6" />
                      )}{" "}
                      {cat.trade === "Construction Helper" && (
                        <Sparkles className="w-6 h-6" />
                      )}{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className="text-xs font-black text-slate-900">
                        {cat.label}
                      </p>{" "}
                      <span className="text-[10px] text-slate-500 block truncate">
                        {getTradeName(cat.trade)}
                      </span>{" "}
                    </div>{" "}
                  </button>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
          {/* C. 2-Column Catalog Layout: Left Filters, Right Workers Grid */}{" "}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {" "}
            {/* Left Column: Filters Sidebar */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-5 relative lg:sticky lg:top-28">
              {" "}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                {" "}
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  {" "}
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />{" "}
                  <span> {t("Filters")} </span>{" "}
                </h4>{" "}
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-amber-600 hover:text-amber-800 transition flex items-center gap-1"
                >
                  {" "}
                  <RotateCcw className="w-3 h-3" /> <span> {t("Reset")} </span>{" "}
                </button>{" "}
              </div>{" "}
              {/* Service Trade Dropdown */}{" "}
              <div className="space-y-1.5">
                {" "}
                <label className="text-xs font-bold text-slate-700 block">
                   {t("Service Trade")} </label>{" "}
                <select
                  value={selectedTradeFilter}
                  onChange={(e) => setSelectedTradeFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-amber-600"
                >
                  {" "}
                  <option value="All"> {t("All Services & Trades")} </option>{" "}
                  <option value="Mason"> {t("Mason (राजमिस्त्री)")} </option>{" "}
                  <option value="Painter"> {t("Painter (पेंटर)")} </option>{" "}
                  <option value="Plumber"> {t("Plumber (प्लंबर)")} </option>{" "}
                  <option value="Electrician">
                     {t("Electrician (इलेक्ट्रीशियन)")} </option>{" "}
                  <option value="Carpenter"> {t("Carpenter (बढ़ई)")} </option>{" "}
                  <option value="Construction Helper">
                     {t("Helper / Cleaner (हेल्पर)")} </option>{" "}
                  <option value="Tile Worker">
                     {t("Tile Worker (टाइल मिस्त्री)")} </option>{" "}
                  <option value="Welder"> {t("Welder (वेल्डर)")} </option>{" "}
                  <option value="Loader/Mover">
                     {t("Loader / Mover (लोडर)")} </option>{" "}
                </select>{" "}
              </div>{" "}
              {/* Location Input & GPS Snap */}{" "}
              <div className="space-y-1.5">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <label className="text-xs font-bold text-slate-700">
                     {t("Location / Region")} </label>{" "}
                  <button
                    type="button"
                    onClick={refreshCustomerGpsLocation}
                    className="text-[10px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-0.5"
                    title={t("Refresh GPS location")}
                  >
                    {" "}
                    <Crosshair className="w-3 h-3" /> <span> {t("Live GPS")} </span>{" "}
                  </button>{" "}
                </div>{" "}
                <div className="relative">
                  {" "}
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder={t("e.g. Ludhiana or Delhi NCR")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold pl-8 focus:outline-amber-600"
                  />{" "}
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />{" "}
                </div>{" "}
              </div>{" "}
              {/* Strict 10km Radar Toggle */}{" "}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    {" "}
                    <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />{" "}
                     {t("Strict 10km Radar")} {" "}
                  </span>{" "}
                  <input
                    type="checkbox"
                    checked={strict10kmOnly}
                    onChange={(e) => setStrict10kmOnly(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />{" "}
                </div>{" "}
                <p className="text-[10px] text-amber-800 leading-tight">
                  {" "}
                   {t("Guarantees all shown workers are within 10 km of your live GPS coordinates.")} {" "}
                </p>{" "}
              </div>{" "}
              {/* Min Rating Slider */}{" "}
              <div className="space-y-2">
                {" "}
                <div className="flex items-center justify-between text-xs">
                  {" "}
                  <span className="font-bold text-slate-700">
                     {t("Min Rating")} </span>{" "}
                  <span className="font-black text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {" "}
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{" "}
                    {minRating.toFixed(1)} {t("+ Stars")} {" "}
                  </span>{" "}
                </div>{" "}
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />{" "}
              </div>{" "}
              {/* Daily Rate (₹) */}{" "}
              <div className="space-y-1.5">
                {" "}
                <label className="text-xs font-bold text-slate-700 block">
                   {t("Daily Rate (₹)")} </label>{" "}
                <div className="grid grid-cols-2 gap-2">
                  {" "}
                  <input
                    type="number"
                    placeholder={t("Min ₹")}
                    value={minWage}
                    onChange={(e) => setMinWage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-600"
                  />{" "}
                  <input
                    type="number"
                    placeholder={t("Max ₹")}
                    value={maxWage}
                    onChange={(e) => setMaxWage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-600"
                  />{" "}
                </div>{" "}
              </div>{" "}
              {/* Sidebar Quick Action Buttons */}{" "}
              <div className="pt-2 space-y-2">
                {" "}
                <button
                  type="button"
                  onClick={() => {
                    const sampleJob: Job = activeRequests[0] ||
                      jobs[0] || {
                        id: `job_ai_${Date.now()}`,
                        title: `Work for ${selectedTradeFilter !== "All" ? selectedTradeFilter : "Mason"} in ${currentCustomer.area}`,
                        trade: (selectedTradeFilter !== "All"
                          ? selectedTradeFilter
                          : "Mason") as TradeType,
                        description: "On-demand trade task in local radius",
                        customerName: currentCustomer.name,
                        customerPhone: currentCustomer.phone,
                        locationAddress: currentCustomer.address,
                        area: currentCustomer.area,
                        dailyWage: 850,
                        workerPayout: 680,
                        platformFee: 170,
                        distanceKm: 0.9,
                        status: "broadcast",
                        otpCode: "4481",
                        postedAt: "Just now",
                        durationDays: 1,
                        isPaid: false,
                        jobGps: currentCustomer.gpsLocation,
                      };
                    openTop5Shortlist(sampleJob);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  {" "}
                  <Sparkles className="w-4 h-4 text-amber-300" />{" "}
                  <span> {t("Top-5 AI Shortlist")} </span>{" "}
                </button>{" "}
                <button
                  type="button"
                  onClick={() => setShowPostModal(true)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {" "}
                  <Plus className="w-4 h-4" />{" "}
                  <span> {t("Broadcast New Job")} </span>{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* Right Column: Worker Catalog Grid & View Toggles */}{" "}
            <div className="lg:col-span-3 space-y-4">
              {" "}
              {/* Header Bar */}{" "}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                {" "}
                <div>
                  {" "}
                  <h4 className="text-sm font-black text-slate-900">
                    {" "}
                     {t("Showing")} {" "}
                    <span className="text-amber-600">
                      {filteredWorkers.length}
                    </span>{" "}
                     {t("available workers")} {" "}
                  </h4>{" "}
                  <p className="text-xs text-slate-500">
                    {" "}
                    {strict10kmOnly
                      ? "All workers filtered within strict 10km GPS radius"
                      : "Showing all matched workers"}{" "}
                  </p>{" "}
                </div>{" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
                    {" "}
                    <button
                      onClick={() => setWorkerViewMode("list")}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${workerViewMode === "list" ? "bg-white text-amber-600 shadow-xs" : "text-slate-600 hover:text-slate-900 "}`}
                    >
                      {" "}
                      <span> {t("Grid View")} </span>{" "}
                    </button>{" "}
                    <button
                      onClick={() => setWorkerViewMode("radar")}
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${workerViewMode === "radar" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 "}`}
                    >
                      {" "}
                      <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />{" "}
                      <span> {t("10km GPS Radar")} </span>{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* View 1: 10km GPS Radar View */}{" "}
              {workerViewMode === "radar" && (
                <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
                  {" "}
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                    {" "}
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      {" "}
                      <LocateFixed className="w-4 h-4 animate-spin text-amber-400" />{" "}
                      <span>
                         {t("LIVE HYPERLOCAL RADAR •")} {currentCustomer.area}
                      </span>{" "}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {" "}
                        ({currentCustomer.gpsLocation.lat.toFixed(4)},{" "}
                        {currentCustomer.gpsLocation.lng.toFixed(4)}){" "}
                      </span>{" "}
                    </div>{" "}
                    <span className="text-xs text-amber-300 font-mono bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40">
                      {" "}
                       {t("Range: Strict 10.0 KM")} {" "}
                    </span>{" "}
                  </div>{" "}
                  {/* Circular Radar Sweep Display */}{" "}
                  <div className="relative w-full aspect-square max-h-[380px] mx-auto bg-radial from-slate-900 to-slate-950 rounded-full border-2 border-amber-500/30 flex items-center justify-center overflow-hidden">
                    {" "}
                    <div className="absolute inset-[15%] rounded-full border border-amber-500/20" />{" "}
                    <div className="absolute inset-[32%] rounded-full border border-amber-500/20" />{" "}
                    <div className="absolute inset-[50%] rounded-full border border-amber-500/20" />{" "}
                    <div className="absolute inset-[70%] rounded-full border border-amber-500/20" />{" "}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {" "}
                      <div className="w-full h-[1px] bg-amber-500/20" />{" "}
                      <div className="h-full w-[1px] bg-amber-500/20 absolute" />{" "}
                    </div>{" "}
                    <div
                      className="absolute inset-0 bg-conic-gradient from-amber-500/20 via-transparent to-transparent animate-spin rounded-full pointer-events-none"
                      style={{ animationDuration: "4s" }}
                    />{" "}
                    {/* Center Customer Marker */}{" "}
                    <div className="relative z-10 w-9 h-9 rounded-full bg-amber-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-xs font-black">
                      {" "}
                       {t("YOU")} {" "}
                    </div>{" "}
                    {/* Worker Blips */}{" "}
                    {filteredWorkers.map((w) => {
                      const workerLat = w.gpsLocation?.lat || custLat;
                      const workerLng = w.gpsLocation?.lng || custLng;
                      const distanceKm = calculateDistanceKm(
                        custLat,
                        custLng,
                        workerLat,
                        workerLng,
                      );
                      const bearingDeg = calculateBearing(
                        custLat,
                        custLng,
                        workerLat,
                        workerLng,
                      );
                      const radiusPercent = Math.min(
                        42,
                        Math.max(12, (distanceKm / 10.0) * 42),
                      );
                      const rad = ((bearingDeg - 90) * Math.PI) / 180;
                      const x = 50 + radiusPercent * Math.cos(rad);
                      const y = 50 + radiusPercent * Math.sin(rad);
                      const isSelected = selectedRadarWorker?.id === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            setSelectedRadarWorker(w);
                            playSound("click");
                          }}
                          style={{ left: `${x}%`, top: `${y}%` }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 transition-transform ${isSelected ? "scale-125 z-30" : "hover:scale-110"}`}
                          title={`${w.name} (${w.primaryTrade}) - ${distanceKm} km away`}
                        >
                          {" "}
                          <div className="relative">
                            {" "}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${isSelected ? "bg-amber-400 text-slate-950 border-white ring-2 ring-amber-400" : "bg-slate-900 text-amber-300 border-amber-400/80 shadow-md"}`}
                            >
                              {" "}
                              {w.name.charAt(0)}{" "}
                            </div>{" "}
                            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 animate-pulse" />{" "}
                          </div>{" "}
                        </button>
                      );
                    })}{" "}
                  </div>{" "}
                  {/* Selected Worker Panel */}{" "}
                  {selectedRadarWorker ? (
                    (() => {
                      const workerLat =
                        selectedRadarWorker.gpsLocation?.lat || custLat;
                      const workerLng =
                        selectedRadarWorker.gpsLocation?.lng || custLng;
                      const trueDist = calculateDistanceKm(
                        custLat,
                        custLng,
                        workerLat,
                        workerLng,
                      );
                      return (
                        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3 animate-in slide-in-from-bottom-2">
                          {" "}
                          <div className="flex items-center justify-between">
                            {" "}
                            <div className="flex items-center gap-3">
                              {" "}
                              <div className="w-11 h-11 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg">
                                {" "}
                                {selectedRadarWorker.name.charAt(0)}{" "}
                              </div>{" "}
                              <div>
                                {" "}
                                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                                  {" "}
                                  {selectedRadarWorker.name}{" "}
                                  {selectedRadarWorker.isVerified && (
                                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                                  )}{" "}
                                </h4>{" "}
                                <p className="text-xs text-slate-400">
                                  {" "}
                                  {getTradeName(
                                    selectedRadarWorker.primaryTrade,
                                  )}{" "}
                                  • {selectedRadarWorker.phone}{" "}
                                </p>{" "}
                              </div>{" "}
                            </div>{" "}
                            <div className="text-right">
                              {" "}
                              <span className="text-base font-black text-amber-400">
                                ₹{selectedRadarWorker.dailyRate} {t("/day")} </span>{" "}
                              <span className="text-xs text-slate-400 block font-mono">
                                {trueDist}  {t("km away")} </span>{" "}
                            </div>{" "}
                          </div>{" "}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {" "}
                            <button
                              onClick={() =>
                                startCall(
                                  {
                                    name: currentCustomer.name,
                                    role: "customer",
                                    phone: currentCustomer.phone,
                                  },
                                  {
                                    name: selectedRadarWorker.name,
                                    role: "worker",
                                    phone: selectedRadarWorker.phone,
                                  },
                                  `Hiring ${selectedRadarWorker.primaryTrade}`,
                                )
                              }
                              className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                            >
                              {" "}
                              <Phone className="w-4 h-4" />{" "}
                              <span> {t("Call")} </span>{" "}
                            </button>{" "}
                            <button
                              onClick={() =>
                                openGpsRadar({
                                  id: `job_quick_${Date.now()}`,
                                  title: `Work for ${selectedRadarWorker.primaryTrade}`,
                                  description: `Direct assignment for ${selectedRadarWorker.primaryTrade}`,
                                  customerName: currentCustomer.name,
                                  customerPhone: currentCustomer.phone,
                                  assignedWorkerId: selectedRadarWorker.id,
                                  assignedWorkerName: selectedRadarWorker.name,
                                  assignedWorkerPhone:
                                    selectedRadarWorker.phone,
                                  trade: selectedRadarWorker.primaryTrade,
                                  locationAddress: currentCustomer.address,
                                  area: currentCustomer.area,
                                  distanceKm: trueDist,
                                  dailyWage: selectedRadarWorker.dailyRate,
                                  workerPayout: Math.round(
                                    selectedRadarWorker.dailyRate * 0.8,
                                  ),
                                  platformFee: Math.round(
                                    selectedRadarWorker.dailyRate * 0.2,
                                  ),
                                  status: "accepted",
                                  otpCode: "4412",
                                  postedAt: "Just now",
                                  durationDays: 1,
                                  isPaid: false,
                                  jobGps: currentCustomer.gpsLocation,
                                  workerGps: selectedRadarWorker.gpsLocation,
                                })
                              }
                              className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                            >
                              {" "}
                              <Navigation className="w-4 h-4" />{" "}
                              <span> {t("GPS Track")} </span>{" "}
                            </button>{" "}
                            <button
                              onClick={() =>
                                setBookingWorker(selectedRadarWorker)
                              }
                              className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-1.5 transition"
                            >
                              {" "}
                              <Sparkles className="w-4 h-4" />{" "}
                              <span> {t("Book Now")} </span>{" "}
                            </button>{" "}
                          </div>{" "}
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-center text-xs text-slate-400 py-2">
                      {" "}
                       {t("Tap any blip on the 10km radar to inspect distance, initiate calls, or book directly.")} {" "}
                    </p>
                  )}{" "}
                </div>
              )}{" "}
              {/* View 2: Worker Cards Grid (As shown in screenshot) */}{" "}
              {workerViewMode === "list" && (
                <div>
                  {" "}
                  {filteredWorkers.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-slate-200 shadow-sm">
                      {" "}
                      <HardHat className="w-12 h-12 text-slate-300 mx-auto" />{" "}
                      <h4 className="text-base font-black text-slate-800">
                         {t("No Workers Found Matching Filter")} </h4>{" "}
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        {" "}
                         {t("There are no workers matching your criteria within the strict 10km radar. Try resetting filters or broadcast a custom job.")} {" "}
                      </p>{" "}
                      <div className="flex items-center justify-center gap-3 pt-2">
                        {" "}
                        <button
                          onClick={resetFilters}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
                        >
                          {" "}
                           {t("Reset Filters")} {" "}
                        </button>{" "}
                        <button
                          onClick={() => setShowPostModal(true)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition"
                        >
                          {" "}
                           {t("Post a Job Broadcast")} {" "}
                        </button>{" "}
                      </div>{" "}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {" "}
                      {filteredWorkers.map((worker) => {
                        const workerLat = worker.gpsLocation?.lat || custLat;
                        const workerLng = worker.gpsLocation?.lng || custLng;
                        const distanceKm = calculateDistanceKm(
                          custLat,
                          custLng,
                          workerLat,
                          workerLng,
                        );
                        return (
                          <div
                            key={worker.id}
                            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition flex flex-col justify-between space-y-4"
                          >
                            {" "}
                            <div className="space-y-3">
                              {" "}
                              {/* Top Row: Avatar + Name + Verified Badge */}{" "}
                              <div className="flex items-start gap-3">
                                {" "}
                                <div className="w-11 h-11 rounded-full bg-slate-800 text-amber-400 font-black flex items-center justify-center text-base shrink-0 border border-slate-700 shadow-xs">
                                  {" "}
                                  {worker.name.charAt(0)}{" "}
                                </div>{" "}
                                <div className="flex-1 min-w-0">
                                  {" "}
                                  <div className="flex items-center gap-1.5">
                                    {" "}
                                    <h5 className="text-sm font-black text-slate-900 truncate">
                                      {" "}
                                      {worker.name}{" "}
                                    </h5>{" "}
                                    {worker.isVerified && (
                                      <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold text-[11px] shrink-0">
                                        {" "}
                                        <ShieldCheck className="w-3.5 h-3.5" />{" "}
                                        <span> {t("verified")} </span>{" "}
                                      </span>
                                    )}{" "}
                                  </div>{" "}
                                  {/* Rating & Jobs Count */}{" "}
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    {" "}
                                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                                      {" "}
                                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{" "}
                                      {worker.rating.toFixed(1)}{" "}
                                    </span>{" "}
                                    <span>
                                      ({worker.completedJobsCount}  {t("jobs)")} </span>{" "}
                                  </div>{" "}
                                  {/* Location with Radar Distance */}{" "}
                                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                    {" "}
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />{" "}
                                    <span>
                                      {worker.location.city || currentCity.name}
                                    </span>{" "}
                                    <span className="text-[10px] text-amber-600 font-semibold">
                                      ({distanceKm}  {t("km away)")} </span>{" "}
                                  </p>{" "}
                                </div>{" "}
                              </div>{" "}
                              {/* Trade / Skill Tags */}{" "}
                              <div className="flex flex-wrap gap-1.5">
                                {" "}
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold border border-amber-100 uppercase tracking-wide">
                                  {" "}
                                  {worker.primaryTrade}{" "}
                                </span>{" "}
                                {(
                                  ((worker as any).skills ||
                                    worker.secondaryTrades ||
                                    []) as string[]
                                )
                                  .slice(0, 2)
                                  .map((skill) => (
                                    <span
                                      key={skill}
                                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium"
                                    >
                                      {" "}
                                      {skill}{" "}
                                    </span>
                                  ))}{" "}
                              </div>{" "}
                            </div>{" "}
                            {/* Bottom Row: Rate + Book Now Button */}{" "}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              {" "}
                              <div>
                                {" "}
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                   {t("Daily Rate")} </span>{" "}
                                <span className="text-sm font-black text-slate-900">
                                  {" "}
                                  ₹{worker.dailyRate}{" "}
                                  <span className="text-[10px] font-normal text-slate-500">
                                     {t("/ day")} </span>{" "}
                                </span>{" "}
                              </div>{" "}
                              <div className="flex items-center gap-1.5">
                                {" "}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveChatJob(null);
                                    setActiveChatTarget({
                                      name: worker.name,
                                      role: "worker",
                                      phone: worker.phone,
                                      trade: worker.primaryTrade,
                                      dailyRate: worker.dailyRate,
                                      area: worker.location.area,
                                    });
                                    setShowChatModal(true);
                                    playSound("click");
                                  }}
                                  className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition shadow-2xs flex items-center justify-center cursor-pointer"
                                  title={`Chat with ${worker.name}`}
                                >
                                  {" "}
                                  <MessageSquare className="w-3.5 h-3.5" />{" "}
                                </button>{" "}
                                <button
                                  type="button"
                                  onClick={() =>
                                    startCall(
                                      {
                                        name: currentCustomer.name,
                                        role: "customer",
                                        phone: currentCustomer.phone,
                                      },
                                      {
                                        name: worker.name,
                                        role: "worker",
                                        phone: worker.phone,
                                      },
                                      `Hire ${worker.primaryTrade}`,
                                    )
                                  }
                                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                                  title={t("Voice Call Worker")}
                                >
                                  {" "}
                                  <Phone className="w-3.5 h-3.5" />{" "}
                                </button>{" "}
                                <button
                                  type="button"
                                  onClick={() => setBookingWorker(worker)}
                                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs transition flex items-center gap-1 shadow-sm"
                                >
                                  {" "}
                                  <span> {t("Book Now")} </span>{" "}
                                  <ArrowRight className="w-3.5 h-3.5" />{" "}
                                </button>{" "}
                              </div>{" "}
                            </div>{" "}
                          </div>
                        );
                      })}{" "}
                    </div>
                  )}{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* 3. My Bookings Tab */}{" "}
      {activeTab === "my_bookings" && (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <div>
              {" "}
              <h3 className="text-xl font-black text-slate-900">
                 {t("My Bookings & Active Work Orders")} </h3>{" "}
              <p className="text-xs text-slate-500">
                {" "}
                 {t("Track assigned workers, verify start OTPs, monitor 10km GPS routes, and release UPI payments.")} {" "}
              </p>{" "}
            </div>{" "}
            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              {" "}
              <Plus className="w-4 h-4" /> <span> {t("Post New Job")} </span>{" "}
            </button>{" "}
          </div>{" "}
          {activeRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200 shadow-sm">
              {" "}
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />{" "}
              <h4 className="text-base font-black text-slate-800">
                 {t("No Active Bookings")} </h4>{" "}
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {" "}
                 {t("You haven&apos;t posted any job or booked a worker yet. Browse available workers or post a requirement.")} {" "}
              </p>{" "}
              <button
                onClick={() => setActiveTab("find_workers")}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5"
              >
                {" "}
                <Users className="w-4 h-4" /> <span> {t("Find Workers Now")} </span>{" "}
              </button>{" "}
            </div>
          ) : (
            <div className="space-y-4">
              {" "}
              {activeRequests.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4"
                >
                  {" "}
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    {" "}
                    <div>
                      {" "}
                      <div className="flex items-center gap-2">
                        {" "}
                        <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[11px] font-bold rounded-md uppercase">
                          {" "}
                          {getTradeName(job.trade)}{" "}
                        </span>{" "}
                        <span
                          className={`px-2 py-0.5 text-[11px] font-bold rounded-md ${job.status === "broadcast" ? "bg-amber-100 text-amber-800" : job.status === "accepted" ? "bg-amber-100 text-amber-800" : job.status === "completed_pending_payment" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800 "}`}
                        >
                          {" "}
                          {job.status === "broadcast"
                            ? "Broadcasting to 10km Radar"
                            : job.status === "accepted"
                              ? "Worker Assigned (Share Start OTP)"
                              : job.status === "completed_pending_payment"
                                ? "Work Completed (Release Escrow)"
                                : job.status}{" "}
                        </span>{" "}
                        <span className="px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-bold rounded-md flex items-center gap-1">
                          {" "}
                          <ShieldCheck className="w-3 h-3 text-amber-600" />{" "}
                          <span> {t("Prepaid Escrow Protected")} </span>{" "}
                        </span>{" "}
                      </div>{" "}
                      <h4 className="text-base font-black text-slate-900 mt-1.5">
                        {job.title}
                      </h4>{" "}
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        {" "}
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />{" "}
                        <span>{job.locationAddress}</span>{" "}
                      </p>{" "}
                    </div>{" "}
                    <div className="text-right">
                      {" "}
                      <span className="text-lg font-black text-slate-900">
                        ₹{job.dailyWage}
                      </span>{" "}
                      {!job.isEscrowPrepaid &&
                      job.escrowStatus === "pending" ? (
                        <span className="text-[10px] text-red-600 font-bold block">
                           {t("Payment Pending")} </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-bold block">
                           {t("100% Escrow Held")} </span>
                      )}{" "}
                      {job.status !== "paid_and_closed" &&
                        job.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Worker did not arrive or wish to cancel? You will receive an immediate 100% refund.",
                                )
                              ) {
                                refundEscrowToCustomer(job.id);
                              }
                            }}
                            className="mt-1 text-[10px] text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
                          >
                            {" "}
                             {t("Worker Absent? Claim Refund")} {" "}
                          </button>
                        )}{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Worker Assignment Card */}{" "}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    {" "}
                    <div className="flex items-center gap-3">
                      {" "}
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center">
                        {" "}
                        {job.assignedWorkerName
                          ? job.assignedWorkerName.charAt(0)
                          : "W"}{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <p className="text-xs font-bold text-slate-900">
                          {" "}
                          {job.assignedWorkerName ||
                            "Waiting for Nearest Worker to Accept"}{" "}
                        </p>{" "}
                        <p className="text-[11px] text-slate-500">
                          {" "}
                          {job.assignedWorkerPhone ||
                            "Broadcasting across strict 10km radius..."}{" "}
                        </p>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="flex items-center gap-2">
                      {" "}
                      <button
                        onClick={() => openTop5Shortlist(job)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg text-xs transition border border-amber-200 flex items-center gap-1"
                      >
                        {" "}
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />{" "}
                        <span> {t("Top-5 Shortlist")} </span>{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Start-of-Work OTP Verification Hub or Payment Escrow */}{" "}
                  {job.status === "accepted" ? (
                    <div className="bg-amber-100 p-4 rounded-2xl border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {" "}
                      <div>
                        {" "}
                        <h4 className="font-black text-slate-900 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-amber-600" />{" "}
                           {t("Worker Assigned")} </h4>{" "}
                        <p className="text-xs text-slate-600 mt-1">
                           {t("Please pay the prepaid amount into escrow to approve this worker and release the start OTP.")} </p>{" "}
                      </div>{" "}
                      <div className="flex gap-2">
                        {" "}
                        <button
                          type="button"
                          onClick={() => rejectWorker(job.id)}
                          className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer"
                        >
                          {" "}
                           {t("Reject")} {" "}
                        </button>{" "}
                        <button
                          type="button"
                          onClick={() =>
                            setPrepayBooking({
                              type: "approve_escrow",
                              jobId: job.id,
                              amount: job.dailyWage * job.durationDays,
                              workerName: job.assignedWorkerName || "Worker",
                            })
                          }
                          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-sm whitespace-nowrap cursor-pointer"
                        >
                          {" "}
                           {t("Pay ₹")} {job.dailyWage * job.durationDays}  {t("to Approve")} {" "}
                        </button>{" "}
                      </div>{" "}
                    </div>
                  ) : job.status === "approved" ||
                    job.status === "broadcast" ||
                    job.status === "in_progress" ? (
                    <div className="bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-300/80 shadow-xs space-y-3">
                      {" "}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
                        {" "}
                        <div className="space-y-0.5">
                          {" "}
                          <div className="flex items-center gap-2">
                            {" "}
                            <KeyRound className="w-4 h-4 text-amber-700" />{" "}
                            <span className="text-xs font-black text-slate-950 uppercase tracking-wide">
                              {" "}
                               {t("Worker Verification Start-Passcode (OTP)")} {" "}
                            </span>{" "}
                            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px] uppercase">
                              {" "}
                              {job.status === "in_progress"
                                ? "Verified & In-Progress"
                                : "Ready to Share"}{" "}
                            </span>{" "}
                          </div>{" "}
                          <p className="text-[11px] text-slate-600 leading-snug">
                            {" "}
                             {t("Share this 4-digit code with the worker upon doorstep arrival. The worker enters it to begin the verified work clock.")} {" "}
                          </p>{" "}
                        </div>{" "}
                        {/* Large High-Contrast 4-Digit Display */}{" "}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 text-amber-400 px-4 py-2 rounded-xl shadow-md border border-slate-800">
                          {" "}
                          {job.otpCode.split("").map((digit, i) => (
                            <span
                              key={i}
                              className="font-mono font-black text-lg tracking-widest px-1"
                            >
                              {" "}
                              {digit}{" "}
                            </span>
                          ))}{" "}
                        </div>{" "}
                      </div>{" "}
                      {/* Multi-Channel 1-Tap OTP Dispatch Controls */}{" "}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                        {" "}
                        <button
                          type="button"
                          onClick={() => handleSendOtpEmail(job)}
                          disabled={isDispatchingOtp[job.id]}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
                          title={t("Dispatch OTP confirmation to your registered email")}
                        >
                          {" "}
                          {isDispatchingOtp[job.id] ? (
                            <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                          ) : dispatchedEmailOtpJobs[job.id] ? (
                            <Check className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Mail className="w-3.5 h-3.5 text-amber-600" />
                          )}{" "}
                          <span>
                            {" "}
                            {dispatchedEmailOtpJobs[job.id]
                              ? "Sent to Email (Gmail)"
                              : "Send to my Email"}{" "}
                          </span>{" "}
                        </button>{" "}
                        <button
                          type="button"
                          onClick={() => handleShareOtpWhatsApp(job)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title={t("Share OTP directly via WhatsApp")}
                        >
                          {" "}
                          <MessageCircle className="w-3.5 h-3.5 text-amber-600" />{" "}
                          <span> {t("Share on WhatsApp")} </span>{" "}
                        </button>{" "}
                        <button
                          type="button"
                          onClick={() => handleSendOtpSms(job)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title={t("Send OTP via SMS text")}
                        >
                          {" "}
                          <Phone className="w-3.5 h-3.5 text-amber-600" />{" "}
                          <span> {t("Send via SMS")} </span>{" "}
                        </button>{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveChatJob(job);
                            setActiveChatTarget(null);
                            setShowChatModal(true);
                            playSound("click");
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title={t("Open In-App Chat & Send OTP")}
                        >
                          {" "}
                          <MessageSquare className="w-3.5 h-3.5" />{" "}
                          <span> {t("Chat & Share OTP")} </span>{" "}
                        </button>{" "}
                        <button
                          type="button"
                          onClick={() => handleCopyOtp(job)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer ml-auto"
                          title={t("Copy 4-digit code")}
                        >
                          {" "}
                          {copiedOtpJobId === job.id ? (
                            <>
                              {" "}
                              <Check className="w-3.5 h-3.5 text-amber-600" />{" "}
                              <span className="text-amber-700 font-bold">
                                 {t("Copied!")} </span>{" "}
                            </>
                          ) : (
                            <>
                              {" "}
                              <Copy className="w-3.5 h-3.5 text-slate-500" />{" "}
                              <span> {t("Copy Passcode")} </span>{" "}
                            </>
                          )}{" "}
                        </button>{" "}
                      </div>{" "}
                    </div>
                  ) : null}{" "}
                  {/* Raise Complaint Action Banner for Active Jobs */}{" "}
                  {(job.status === "accepted" ||
                    job.status === "in_progress" ||
                    job.status === "broadcast") && (
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs mt-4">
                      {" "}
                      <span className="text-[11px] text-slate-600 font-medium">
                         {t("Worker not arrived or left site?")} </span>{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setComplaintJob(job);
                          playSound("click");
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 text-[11px] transition flex items-center gap-1 cursor-pointer"
                      >
                        {" "}
                        <AlertTriangle className="w-3 h-3 text-amber-600" />{" "}
                        <span> {t("Raise Complaint for Refund")} </span>{" "}
                      </button>{" "}
                    </div>
                  )}{" "}
                  {/* Disputed Job Status Banner */}{" "}
                  {job.status === "disputed" && (
                    <div className="bg-amber-50/90 border-2 border-amber-400 p-4 rounded-2xl space-y-2">
                      {" "}
                      <div className="flex items-center justify-between">
                        {" "}
                        <div className="flex items-center gap-2">
                          {" "}
                          <AlertTriangle className="w-5 h-5 text-amber-700" />{" "}
                          <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                            {" "}
                             {t("Complaint Registered for Admin Review (#")} {job.disputeId || "DISP"}){" "}
                          </span>{" "}
                        </div>{" "}
                        <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase">
                          {" "}
                           {t("Escrow Locked")} {" "}
                        </span>{" "}
                      </div>{" "}
                      <p className="text-xs text-amber-900 leading-snug">
                        {" "}
                         {t("Reported issue:")} {" "}
                        <strong>
                          {job.disputeReason ||
                            "Worker absent / site non-arrival"}
                        </strong>
                        .{" "}
                      </p>{" "}
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-[11px] text-slate-700 space-y-1">
                        {" "}
                        <div className="flex items-center justify-between font-bold">
                          {" "}
                          <span> {t("Protected Escrow Amount:")} </span>{" "}
                          <span className="font-mono text-slate-900">
                            ₹
                            {job.escrowPrepaidAmount ||
                              (job.dailyWage || 850) * (job.durationDays || 1)}
                          </span>{" "}
                        </div>{" "}
                        <p className="text-[10px] text-slate-600">
                          {" "}
                           {t("Admin Operations is auditing worker GPS timestamps & proof. Upon verification, 100% of your escrow will be refunded or wage appropriately adjusted. No direct 1-click refund allows fraudulent claims.")} {" "}
                        </p>{" "}
                      </div>{" "}
                    </div>
                  )}{" "}
                  {/* Raise Complaint Action Banner for Active Jobs */}{" "}
                  {(job.status === "accepted" ||
                    job.status === "in_progress" ||
                    job.status === "broadcast") && (
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      {" "}
                      <span className="text-[11px] text-slate-600 font-medium">
                         {t("Worker not arrived or left site?")} </span>{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setComplaintJob(job);
                          playSound("click");
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 text-[11px] transition flex items-center gap-1 cursor-pointer"
                      >
                        {" "}
                        <AlertTriangle className="w-3 h-3 text-amber-600" />{" "}
                        <span> {t("Raise Complaint for Refund")} </span>{" "}
                      </button>{" "}
                    </div>
                  )}{" "}
                  {job.status === "completed_pending_payment" &&
                    (false ? (
                      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-amber-500/10 p-4 rounded-2xl border-2 border-amber-300 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        {" "}
                        <div>
                          {" "}
                          <div className="flex items-center gap-1.5">
                            {" "}
                            <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />{" "}
                            <h5 className="text-xs font-black text-slate-950">
                               {t("Work Completed • Covered by Gold Membership")} </h5>{" "}
                          </div>{" "}
                          <p className="text-[11px] text-slate-700 mt-0.5">
                            {" "}
                             {t("Worker wage of ₹")} {job.workerPayout}  {t("will be disbursed directly from Admin Treasury.")} {" "}
                            <strong> {t("₹0 charged to your account.")} </strong>
                            <br />{" "}
                            <strong className="text-amber-800">
                               {t("The worker has completed the job. Please leave a rating and review for your experience!")} </strong>{" "}
                          </p>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          {" "}
                          <button
                            type="button"
                            onClick={() => {
                              setComplaintJob(job);
                              playSound("click");
                            }}
                            className="px-3 py-2 bg-white hover:bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-300 text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            {" "}
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />{" "}
                            <span> {t("Raise Dispute")} </span>{" "}
                          </button>{" "}
                          <button
                            type="button"
                            onClick={() => setRatingJob(job)}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            {" "}
                            <CheckCircle2 className="w-4 h-4" />{" "}
                            <span> {t("Confirm & Rate Worker")} </span>{" "}
                          </button>{" "}
                        </div>{" "}
                      </div>
                    ) : (
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                        {" "}
                        <div>
                          {" "}
                          <h5 className="text-xs font-black text-amber-950">
                             {t("Work Completed Successfully!")} </h5>{" "}
                          <p className="text-[11px] text-amber-800 font-bold mt-1">
                             {t("The worker has completed the job. Please leave a rating and review for your experience!")} </p>{" "}
                        </div>{" "}
                        <div className="flex items-center gap-2">
                          {" "}
                          <button
                            type="button"
                            onClick={() => {
                              setComplaintJob(job);
                              playSound("click");
                            }}
                            className="px-3 py-2 bg-white hover:bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-300 text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            {" "}
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />{" "}
                            <span> {t("Raise Dispute")} </span>{" "}
                          </button>{" "}
                          <button
                            type="button"
                            onClick={() => setRatingJob(job)}
                            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            {" "}
                            <CheckCircle2 className="w-4 h-4" />{" "}
                            <span> {t("Confirm Work & Rate Worker")} </span>{" "}
                          </button>{" "}
                        </div>{" "}
                      </div>
                    ))}{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </div>
      )}{" "}
      {/* 4. Support Tab */}{" "}
      {activeTab === "support" && (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                   {t("Kaamzo Customer Support & Safety Hub")} </h3>
                <p className="text-xs text-slate-500 mt-1">
                   {t("24/7 dedicated voice assistance, WhatsApp helpline, dispute resolution, and hyperlocal safety.")} </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 {t("Support Live & Active")} </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: IVR Voice & WhatsApp Helpline */}
              <div className="p-5 bg-gradient-to-br from-amber-50/80 to-amber-100/40 border border-amber-200 rounded-3xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 text-[10px] font-black uppercase rounded-full">
                     {t("Voice & WhatsApp")} </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                     {t("IVR Voice & WhatsApp Helpline")} </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                     {t("Toll-free voice assistance and instant WhatsApp messaging in Hindi, Punjabi & English.")} </p>
                </div>
                <div className="p-3 bg-white/90 rounded-2xl border border-amber-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                       {t("Helpline Number:")} </span>
                    <span className="text-sm font-mono font-black text-amber-700">
                      +91 95922 21100
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href="https://wa.me/919592221100?text=Hi%20Kaamzo%20Support,%20I%20am%20a%20Customer%20and%20need%20assistance."
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span> {t("WhatsApp")} </span>
                    </a>
                    <a
                      href="tel:+919592221100"
                      className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span> {t("Call Now")} </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 2: Official Helpline Gmail */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-xs">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-black uppercase rounded-full">
                       {t("Email Support")} </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">
                     {t("Official Helpline Gmail")} </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                     {t("Escalations, billing audits, dispute queries, and security reports.")} </p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                       {t("Official Email:")} </span>
                    <span className="text-xs font-mono font-bold text-slate-900 truncate max-w-[190px]">
                       {t("bhavnoorsinghkochar@gmail.com")} </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=bhavnoorsinghkochar@gmail.com&cc=danishwadhawan7@gmail.com&su=Kaamzo%20Customer%20Support%20Request"
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span> {t("Send Email")} </span>
                    </a>
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
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span> {t("Copy Email")} </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: 100% Aadhaar KYC Guarantee */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                       {t("100% Aadhaar KYC Guarantee")} </h4>
                    <span className="text-[10px] font-bold text-emerald-600">
                       {t("Active Protection")} </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                   {t("Every worker in your 10km radius is verified with physical trade proof and government identity documents.")} </p>
              </div>

              {/* Card 4: 100% Escrow Fund Safety */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                       {t("Prepaid Escrow Vault")} </h4>
                    <span className="text-[10px] font-bold text-purple-600">
                       {t("Zero Payment Risk")} </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                   {t("Your payments are locked safely in escrow and only released after you verify completed work on site.")} </p>
              </div>
            </div>

            {/* Embedded Gmail OTP Verification Section */}
            <div className="pt-2">
              <GmailOtpVerificationSection
                initialEmail={
                  currentCustomer?.email || "bhavnoorsinghkochar@gmail.com"
                }
                onVerified={(verifiedEmail) => {
                  showNotification(
                    "Gmail Verified",
                    `✓ Gmail (${verifiedEmail}) verified successfully!`,
                  );
                }}
              />
            </div>
          </div>
        </div>
      )}{" "}
      {/* Direct Worker Booking Modal */}{" "}
      {bookingWorker && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          {" "}
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
            {" "}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm">
                  {" "}
                  {bookingWorker.name.charAt(0)}{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h4 className="text-sm font-black text-slate-900">
                     {t("Book")} {bookingWorker.name}
                  </h4>{" "}
                  <p className="text-[11px] text-slate-500">
                    {bookingWorker.primaryTrade} • ₹{bookingWorker.dailyRate}
                     {t("/day")} </p>{" "}
                </div>{" "}
              </div>{" "}
              <button
                onClick={() => setBookingWorker(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                {" "}
                <X className="w-4 h-4" />{" "}
              </button>{" "}
            </div>{" "}
            <form
              onSubmit={handleConfirmDirectBooking}
              className="space-y-3.5 text-xs"
            >
              {" "}
              <div>
                {" "}
                <label className="font-bold text-slate-700 block mb-1">
                   {t("Work Requirement / Title")} </label>{" "}
                <input
                  type="text"
                  placeholder={`e.g. Need ${bookingWorker.primaryTrade} for 1 day work`}
                  value={directJobTitle}
                  onChange={(e) => setDirectJobTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600 font-medium"
                  required
                />{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-2">
                {" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                     {t("Duration (Days)")} </label>{" "}
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={directJobDuration}
                    onChange={(e) =>
                      setDirectJobDuration(Number(e.target.value))
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600 font-medium"
                    required
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                     {t("Daily Wage (₹)")} </label>{" "}
                  <input
                    type="number"
                    value={bookingWorker.dailyRate}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-700"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="font-bold text-slate-700 block mb-1">
                   {t("Work Address / Instructions")} </label>{" "}
                <textarea
                  rows={2}
                  value={directJobDescription}
                  onChange={(e) => setDirectJobDescription(e.target.value)}
                  placeholder={t("e.g. Bring standard tools, reach location by 9:00 AM.")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600 font-medium"
                />{" "}
              </div>
              {/* Price Breakdown */}{" "}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 mt-2 space-y-2">
                {" "}
                <div className="space-y-1.5 text-[11px] sm:text-xs">
                  {" "}
                  <div className="flex items-center justify-between text-slate-700">
                    {" "}
                    <span>
                       {t("Base Labor (")} {bookingWorker.dailyRate} ×{" "}
                      {directJobDuration}  {t("days):")} </span>{" "}
                    <span className="font-mono font-bold text-slate-900">
                      ₹{bookingWorker.dailyRate * directJobDuration}
                    </span>{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between text-slate-700">
                    {" "}
                    <span> {t("Platform Fee (20%):")} </span>{" "}
                    <span className="font-mono font-bold text-slate-900">
                      ₹
                      {Math.round(
                        bookingWorker.dailyRate * directJobDuration * 0.2,
                      )}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="border-t border-slate-200 pt-2 space-y-1.5">
                  {" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="font-black text-slate-950 text-xs sm:text-sm">
                       {t("Total Customer Payment:")} </span>{" "}
                    <span className="text-base sm:text-lg font-black text-slate-950 font-mono">
                      ₹
                      {Math.round(
                        bookingWorker.dailyRate * directJobDuration * 1.2,
                      )}
                    </span>{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between text-[11px] sm:text-xs">
                    {" "}
                    <span className="text-emerald-800 font-semibold">
                       {t("Worker Earnings (100% Base):")} </span>{" "}
                    <span className="font-mono font-bold text-emerald-800">
                      ₹{bookingWorker.dailyRate * directJobDuration}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
              <div className="pt-2 flex items-center gap-2">
                {" "}
                <button
                  type="button"
                  onClick={() => setBookingWorker(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {" "}
                   {t("Cancel")} {" "}
                </button>{" "}
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {" "}
                  <Sparkles className="w-4 h-4" />{" "}
                  <span> {t("Direct Book Worker")} </span>{" "}
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Post a Job Broadcast Modal */}{" "}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {" "}
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 border border-slate-200 shadow-2xl space-y-4 sm:space-y-5 animate-in fade-in my-auto max-h-[92vh] overflow-y-auto">
            {" "}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base shadow-sm border border-amber-300">
                  {" "}
                  <Plus className="w-5 h-5 stroke-[2.5]" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                     {t("Post Service Requirement")} </h4>{" "}
                  <p className="text-xs text-slate-500">
                     {t("Auto-broadcasts to all verified workers within 10 km.")} </p>{" "}
                </div>{" "}
              </div>{" "}
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                {" "}
                <X className="w-5 h-5" />{" "}
              </button>{" "}
            </div>{" "}
            <form onSubmit={handlePostJobSubmit} className="space-y-4 text-xs">
              {" "}
              {/* Important Platform Safety Notice */}{" "}
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 sm:p-4 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
                {" "}
                <div className="w-6 h-6 rounded-lg bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  {" "}
                  <ShieldAlert className="w-4 h-4 text-amber-800" />{" "}
                </div>{" "}
                <div className="space-y-1">
                  {" "}
                  <p className="font-black text-amber-950 text-xs tracking-tight">
                     {t("Important Platform Safety Notice:")} </p>{" "}
                  <p className="text-amber-900/90 text-[11px] sm:text-xs leading-relaxed">
                    {" "}
                     {t("&ldquo;If the worker is ordered not by the website but externally by calling or other sources, we are not responsible for any theft or damage done by him.&rdquo;")} {" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              {/* Service Category with Official Govt Mandated Tariffs */}{" "}
              <div className="space-y-2.5">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <label className="font-black text-slate-900 text-xs sm:text-sm">
                    {" "}
                     {t("Service Category (Official Hourly Rate)")} {" "}
                  </label>{" "}
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
                    {" "}
                     {t("Official Govt Tariffs")} {" "}
                  </span>{" "}
                </div>{" "}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {" "}
                  {GOV_SERVICE_CATEGORIES.map((cat) => {
                    const isSelected = trade === cat.trade;
                    return (
                      <button
                        key={cat.trade}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${isSelected ? "border-2 border-amber-600 bg-amber-50/80 shadow-sm ring-2 ring-amber-400/20" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"}`}
                      >
                        {" "}
                        <div className="min-w-0 flex-1">
                          {" "}
                          <p className="font-black text-slate-900 text-xs sm:text-sm truncate">
                            {cat.label}
                          </p>{" "}
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {cat.sublabel}
                          </p>{" "}
                        </div>{" "}
                        <div className="shrink-0 text-right">
                          {" "}
                          <span className="font-black text-xs sm:text-sm font-mono text-slate-950 bg-amber-100/90 border border-amber-300/80 px-2.5 py-1 rounded-xl block">
                            {" "}
                            ₹{cat.govHourlyRate} {t("/hr")} {" "}
                          </span>{" "}
                        </div>{" "}
                      </button>
                    );
                  })}{" "}
                </div>{" "}
              </div>{" "}
              {/* Job Title & Work Description */}{" "}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                     {t("Job Title")} </label>{" "}
                  <input
                    type="text"
                    placeholder={t("e.g. Custom Woodwork & Repair")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-amber-600 focus:bg-white transition"
                    required
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                     {t("Work Description (Optional)")} </label>{" "}
                  <input
                    type="text"
                    placeholder={t("e.g. Bring wood tools and nails")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-amber-600 focus:bg-white transition"
                  />{" "}
                </div>{" "}
              </div>{" "}
              {/* Start Date, End Date, Shift Start Time, Shift End Time */}{" "}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                     {t("Start Date")} </label>{" "}
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-amber-600"
                    required
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                     {t("End Date")} </label>{" "}
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-amber-600"
                    required
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                     {t("Shift Start Time")} </label>{" "}
                  <input
                    type="time"
                    value={shiftStartTime}
                    onChange={(e) => {
                      setShiftStartTime(e.target.value);
                      setHoursPerDay(
                        calculateHoursFromTimes(e.target.value, shiftEndTime),
                      );
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-amber-600"
                    required
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="font-bold text-slate-700 block mb-1">
                     {t("Shift End Time")} </label>{" "}
                  <input
                    type="time"
                    value={shiftEndTime}
                    onChange={(e) => {
                      setShiftEndTime(e.target.value);
                      setHoursPerDay(
                        calculateHoursFromTimes(shiftStartTime, e.target.value),
                      );
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-amber-600"
                    required
                  />{" "}
                </div>{" "}
              </div>{" "}
              {/* Hours Per Day & Total Days */}{" "}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                {" "}
                <div className="flex items-center gap-2.5">
                  {" "}
                  <span className="font-bold text-slate-700">
                     {t("Hours Per Day (Custom Duration):")} </span>{" "}
                  <input
                    type="number"
                    min="1"
                    max="24"
                    step="0.5"
                    value={hoursPerDay}
                    onChange={(e) =>
                      setHoursPerDay(Math.max(1, Number(e.target.value)))
                    }
                    className="w-16 bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-center text-xs font-mono font-bold text-slate-900 focus:outline-amber-600"
                    required
                  />{" "}
                </div>{" "}
                <div className="font-bold text-slate-700">
                  {" "}
                   {t("Calculated Total Days:")} {" "}
                  <span className="font-mono text-slate-950 font-black ml-1 bg-white border border-slate-300 px-2 py-1 rounded-lg">
                    {calculatedTotalDays}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
              {/* Worksite Address */}{" "}
              <div className="space-y-1.5">
                {" "}
                <div className="flex items-center justify-between">
                  {" "}
                  <label className="font-bold text-slate-700">
                     {t("Worksite Address")} </label>{" "}
                  <button
                    type="button"
                    onClick={async () => {
                      refreshCustomerGpsLocation();
                      if (currentCustomer?.address) {
                        setWorksiteAddress(currentCustomer.address);
                      } else if (currentCustomer?.area) {
                        setWorksiteAddress(
                          `Near ${currentCustomer.area}, ${currentCity?.name || "Ludhiana"}`,
                        );
                      }
                      showNotification(
                        "Location Detected",
                        "✓ Worksite address updated from GPS",
                      );
                      playSound("click");
                    }}
                    className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 text-[11px] cursor-pointer hover:underline"
                  >
                    {" "}
                    <Navigation className="w-3.5 h-3.5 text-amber-600" />{" "}
                    <span> {t("Detect My Location (GPS)")} </span>{" "}
                  </button>{" "}
                </div>{" "}
                <input
                  type="text"
                  value={worksiteAddress}
                  onChange={(e) => setWorksiteAddress(e.target.value)}
                  placeholder={t("Street address, colony, city...")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-amber-600 focus:bg-white transition"
                />{" "}
              </div>{" "}
              {/* Pricing Breakdown Card */}{" "}
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs text-slate-800 shadow-xs">
                {" "}
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                  {" "}
                  <div className="flex items-center gap-2">
                    {" "}
                    <Calculator className="w-4 h-4 text-amber-700" />{" "}
                    <h5 className="font-black text-sm text-slate-900">
                       {t("Pricing Breakdown")} </h5>{" "}
                  </div>{" "}
                  <span className="bg-amber-200/80 text-amber-950 font-black px-2.5 py-0.5 rounded-lg text-xs font-mono border border-amber-300/60">
                    {" "}
                    ₹{activeGovHourlyRate} {t("/hr Rate")} {" "}
                  </span>{" "}
                </div>{" "}
                <div className="space-y-1.5 pt-0.5">
                  {" "}
                  <div className="flex items-center justify-between text-slate-700">
                    {" "}
                    <span>
                       {t("Base Labor (")} {activeGovHourlyRate} × {hoursPerDay} {t("h ×")} {" "}
                      {calculatedTotalDays}  {t("days):")} </span>{" "}
                    <span className="font-mono font-bold text-slate-900">
                      ₹{baseLabor}
                    </span>{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between text-slate-700">
                    {" "}
                    <span> {t("Platform Fee (20%):")} </span>{" "}
                    <span className="font-mono font-bold text-slate-900">
                      ₹{platformFee}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="border-t border-amber-200/80 pt-2 space-y-1.5">
                  {" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <span className="font-black text-slate-950 text-xs sm:text-sm">
                       {t("Total Customer Payment:")} </span>{" "}
                    <span className="text-base sm:text-lg font-black text-slate-950 font-mono">
                      ₹{totalCustomerPayment}
                    </span>{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between text-[11px] sm:text-xs">
                    {" "}
                    <span className="text-emerald-800 font-semibold">
                       {t("Worker Earnings (100% Base):")} </span>{" "}
                    <span className="font-mono font-bold text-emerald-800">
                      ₹{workerEarnings}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Modal Action Buttons */}{" "}
              <div className="pt-2 flex items-center gap-3">
                {" "}
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition cursor-pointer"
                >
                  {" "}
                   {t("Cancel")} {" "}
                </button>{" "}
                <button
                  type="submit"
                  className="flex-2 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
                >
                  {" "}
                  <Sparkles className="w-4 h-4 text-slate-950" />{" "}
                  <span>
                     {t("Post Job & Broadcast (₹")} {totalCustomerPayment})
                  </span>{" "}
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Raise Dispute & Complaint Modal */}{" "}
      {complaintJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          {" "}
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
            {" "}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center text-sm shadow-xs">
                  {" "}
                  <AlertTriangle className="w-5 h-5" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h4 className="text-base font-black text-slate-900">
                     {t("Raise Complaint / Dispute")} </h4>{" "}
                  <p className="text-xs text-slate-500">
                     {t("Official review by Kaamzo Operations & Admin")} </p>{" "}
                </div>{" "}
              </div>{" "}
              <button
                onClick={() => setComplaintJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                {" "}
                <X className="w-4 h-4" />{" "}
              </button>{" "}
            </div>{" "}
            {/* Job Summary Pill */}{" "}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1 text-xs">
              {" "}
              <p className="font-bold text-slate-900">
                {complaintJob.title}
              </p>{" "}
              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                {" "}
                <span>
                   {t("Assigned Worker:")} {" "}
                  <strong>
                    {complaintJob.assignedWorkerName || "Broadcasting"}
                  </strong>
                </span>{" "}
                <span className="font-mono text-amber-700 font-bold">
                   {t("Escrow: ₹")} {complaintJob.escrowPrepaidAmount ||
                    (complaintJob.dailyWage || 850) *
                      (complaintJob.durationDays || 1)}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <form
              onSubmit={handleSubmitComplaint}
              className="space-y-3.5 text-xs"
            >
              {" "}
              <div>
                {" "}
                <label className="font-bold text-slate-700 block mb-1">
                   {t("Reason for Complaint")} </label>{" "}
                <select
                  value={complaintReason}
                  onChange={(e) => setComplaintReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-amber-600"
                  required
                >
                  {" "}
                  <option value="Worker did not arrive at site / Absent">
                     {t("Worker did not arrive at site / Absent (ਗੈਰ-ਹਾਜ਼ਰ)")} </option>{" "}
                  <option value="Worker left site without completing work">
                     {t("Worker left site early without finishing work")} </option>{" "}
                  <option value="Severe quality defect or property damage">
                     {t("Substandard work / Quality defect / Damage")} </option>{" "}
                  <option value="Worker demanded unauthorized extra cash">
                     {t("Worker demanded unauthorized extra cash outside app")} </option>{" "}
                  <option value="Other complaint"> {t("Other grievance")} </option>{" "}
                </select>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="font-bold text-slate-700 block mb-1">
                   {t("Additional Details (Optional)")} </label>{" "}
                <textarea
                  rows={3}
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  placeholder={t("Provide any additional context, e.g. waited 2 hours, worker phone switched off, etc.")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-amber-600"
                />{" "}
              </div>{" "}
              {/* Admin Verification Notice */}{" "}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                {" "}
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  {" "}
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />{" "}
                  <span> {t("Admin Fair Audit Guarantee")} </span>{" "}
                </div>{" "}
                <p className="text-amber-800">
                  {" "}
                   {t("To prevent fraudulent disputes, Kaamzo Admin will cross-verify worker GPS location logs and timestamps.")} {" "}
                  <strong>
                     {t("100% of your escrow funds are held safely locked in escrow vault")} </strong>{" "}
                   {t("and will be refunded upon verification.")} {" "}
                </p>{" "}
              </div>{" "}
              <div className="pt-2 flex items-center gap-2">
                {" "}
                <button
                  type="button"
                  onClick={() => setComplaintJob(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {" "}
                   {t("Cancel")} {" "}
                </button>{" "}
                <button
                  type="submit"
                  disabled={isSubmittingComplaint}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {" "}
                  {isSubmittingComplaint ? (
                    <span> {t("Registering...")} </span>
                  ) : (
                    <>
                      {" "}
                      <AlertTriangle className="w-4 h-4" />{" "}
                      <span> {t("Submit for Admin Audit")} </span>{" "}
                    </>
                  )}{" "}
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* Quick Chat Modal */}{" "}
      <QuickChatModal
        isOpen={showChatModal}
        onClose={() => {
          setShowChatModal(false);
          setActiveChatJob(null);
          setActiveChatTarget(null);
        }}
        job={activeChatJob}
        targetPerson={activeChatTarget}
        currentUserRole="customer"
        currentUserName={currentCustomer.name}
        currentUserPhone={currentCustomer.phone}
        onStartCall={() => {
          if (activeChatJob) {
            startCall(
              {
                name: currentCustomer.name,
                role: "customer",
                phone: currentCustomer.phone,
              },
              {
                name: activeChatJob.assignedWorkerName || "Worker",
                role: "worker",
                phone: activeChatJob.assignedWorkerPhone || "+91 98101 55678",
              },
              activeChatJob.title,
            );
          } else if (activeChatTarget) {
            startCall(
              {
                name: currentCustomer.name,
                role: "customer",
                phone: currentCustomer.phone,
              },
              {
                name: activeChatTarget.name,
                role: "worker",
                phone: activeChatTarget.phone || "+91 98101 55678",
              },
              `Direct Call with ${activeChatTarget.name}`,
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
      {/* Rating & Review Modal */}{" "}
      {ratingJob && (
        <RateEmployeeModal
          isOpen={!!ratingJob}
          onClose={() => setRatingJob(null)}
          jobId={ratingJob.id}
          jobTitle={ratingJob.title}
          workerName={ratingJob.assignedWorkerName || "Worker"}
          workerTrade={ratingJob.trade}
          existingRating={ratingJob.rating}
          existingReview={ratingJob.review}
          existingTags={ratingJob.ratingTags}
          onSubmitRating={(jobId, stars, review, tags) => {
            releasePaymentByCustomer(
              jobId,
              stars,
              review,
              "ESCROW_WALLET",
              `ESCROW-${Date.now()}`,
              tags,
            );
            setRatingJob(null);
          }}
        />
      )}{" "}
      {/* Standalone Gmail OTP Verification Modal */}{" "}
      <GmailOtpVerificationModal
        isOpen={showGmailVerifyModal}
        onClose={() => setShowGmailVerifyModal(false)}
        initialEmail={currentCustomer?.email || "bhavnoorsinghkochar@gmail.com"}
        targetName={currentCustomer?.name || "Customer"}
        role="customer"
        onVerified={(verifiedEmail) => {
          showNotification(
            "Gmail Verified",
            `✓ Gmail (${verifiedEmail}) verified successfully!`,
          );
        }}
      />{" "}
      {/* Prepay Escrow Payment Modal during booking */}{" "}
      {prepayBooking && (
        <UpiQrPaymentModal
          isOpen={!!prepayBooking}
          onClose={() => setPrepayBooking(null)}
          amount={prepayBooking.amount}
          totalWage={prepayBooking.amount}
          workerName={prepayBooking.workerName}
          workerTrade={
            prepayBooking.type === "direct" && bookingWorker
              ? bookingWorker.primaryTrade
              : trade
          }
          isWorkerReceiving={false}
          isPrepaidEscrowPayment={true}
          isCustomerSubscriptionActive={false}
          jobTitle={prepayBooking.type === "direct" ? directJobTitle : title}
          onPaymentSuccess={() => {
            processPrepaidBooking();
          }}
        />
      )}{" "}
      {/* Sticky Highlighted Floating Action Button (FAB) */}{" "}
      <div className="fixed bottom-6 right-6 z-40">
        {" "}
        <button
          id="fab-post-job-floating"
          type="button"
          onClick={() => {
            setShowPostModal(true);
            playSound("click");
          }}
          className="group relative flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-2xl font-black text-xs sm:text-sm shadow-2xl shadow-amber-500/50 border-2 border-amber-200 ring-4 ring-amber-400/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={t("Post a Job Broadcast to 10km Verified Workers")}
        >
          {" "}
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            {" "}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />{" "}
            <span className="relative inline-flex rounded-full h-4 w-4 bg-slate-950 text-[9px] text-amber-300 items-center justify-center font-black">
              ⚡
            </span>{" "}
          </span>{" "}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-inner shrink-0">
            {" "}
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />{" "}
          </div>{" "}
          <div className="text-left">
            {" "}
            <span className="block leading-none font-black text-slate-950 text-xs sm:text-sm">
               {t("Post a Job")} </span>{" "}
            <span className="text-[10px] text-slate-900 font-bold block mt-0.5">
               {t("Broadcast to 10km")} </span>{" "}
          </div>{" "}
          <Sparkles className="w-4 h-4 text-slate-950 animate-pulse ml-0.5 hidden xs:block" />{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
};
