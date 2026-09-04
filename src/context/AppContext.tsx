import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AppRole,
  Language,
  Job,
  WorkerProfile,
  CustomerProfile,
  AdminProfile,
  AdminTransaction,
  VerificationRequest,
  DisputeItem,
  TradeType,
  CallSession,
  GpsCoordinates,
  CityInfo,
  ChatNotificationItem,
  HyperlocalMatchResult,
} from "../types";
import { playSound, speakText } from "../utils/audio";
import { matchHyperlocalWorkers, getTop5Shortlist } from "../utils/aiMatching";
import {
  calculateDistanceKm,
  calculateBearing,
  getCoordinatesForArea,
  SUPPORTED_CITIES,
  detectCityFromCoords,
  reverseGeocodeLocation,
  ResolvedAddress,
} from "../utils/geo";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  COLLECTIONS,
  syncWorkerToFirestore,
  syncJobToFirestore,
  syncVerificationToFirestore,
  syncDisputeToFirestore,
  syncAccountToFirestore,
  clearAllFirestoreData,
  handleFirestoreError,
  OperationType,
} from "../lib/firestoreSync";
import { sendOtpToGmail } from "../lib/gmailService";
import { applyGoogleTranslateLanguage } from "../utils/googleTranslate";
export interface UserAccount {
  id: string;
  phone: string;
  password: string;
  name: string;
  role: "worker" | "customer" | "admin";
  extraData?: any;
}

interface AppContextType {
  currentRole: AppRole;
  setCurrentRole: (role: AppRole) => void;
  currentLanguage: Language;
  setCurrentLanguage: (lang: Language) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;

  // City & Live Geolocation
  currentCity: CityInfo;
  setCurrentCity: (city: CityInfo) => void;
  supportedCities: CityInfo[];
  detectAndSetLiveLocation: () => Promise<boolean>;
  snapToRealWorldAddress: () => Promise<ResolvedAddress | null>;
  currentResolvedAddress: ResolvedAddress | null;
  isLocating: boolean;

  // Platform collections
  workers: WorkerProfile[];
  jobs: Job[];
  verifications: VerificationRequest[];
  disputes: DisputeItem[];

  // Logged in user states
  currentWorker: WorkerProfile | null;
  currentCustomer: CustomerProfile | null;
  currentAdmin: AdminProfile | null;

  // Real-time Calling State
  activeCall: CallSession | null;
  startCall: (
    caller: {
      name: string;
      role: "worker" | "customer" | "admin";
      phone: string;
    },
    receiver: {
      name: string;
      role: "worker" | "customer" | "admin";
      phone: string;
    },
    jobTitle?: string,
  ) => void;
  endCall: () => void;

  // Active GPS Radar modal trigger
  activeGpsJob: Job | null;
  openGpsRadar: (job: Job) => void;
  closeGpsRadar: () => void;

  // Active UPI QR modal trigger
  activeUpiPaymentJob: Job | null;
  openUpiPayment: (job: Job) => void;
  closeUpiPayment: () => void;

  // Active Multi-Channel Alert modal trigger
  activeMultiChannelJob: Job | null;
  activeMultiChannelWorker: WorkerProfile | null;
  openMultiChannelModal: (job: Job, worker?: WorkerProfile) => void;
  closeMultiChannelModal: () => void;

  // Active Top-5 Shortlist & Automated Job Matching Engine
  activeShortlistJob: Job | null;
  openTop5Shortlist: (job: Job) => void;
  closeTop5Shortlist: () => void;
  latestMatchedJob: Job | null;
  latestTop5Matches: HyperlocalMatchResult[];
  getTop5WorkersForJob: (
    jobOrCriteria:
      | Job
      | {
          trade: TradeType;
          jobGps?: GpsCoordinates;
          lat?: number;
          lng?: number;
          area?: string;
          dailyWage?: number;
          maxRadiusKm?: number;
        },
  ) => HyperlocalMatchResult[];
  matchJobWithWorkers: (job: Job) => {
    matches: HyperlocalMatchResult[];
    totalEligible: number;
    topMatch: HyperlocalMatchResult | null;
  };
  clearMatchedSuggestions: () => void;

  // Real-time Chat Notifications & Global Chat Modal
  chatNotifications: ChatNotificationItem[];
  triggerChatNotification: (item: ChatNotificationItem) => void;
  dismissChatNotification: (id: string) => void;
  activeGlobalChat: {
    isOpen: boolean;
    job?: Job | null;
    targetPerson?: any;
    role?: "worker" | "customer" | "admin";
  } | null;
  openGlobalChat: (
    job?: Job | null,
    targetPerson?: any,
    role?: "worker" | "customer" | "admin",
  ) => void;
  closeGlobalChat: () => void;

  // Worker Auth & Accounts
  workerAccounts: UserAccount[];
  loginWorkerWithAuth: (
    userIdOrPhone: string,
    password: string,
  ) => { success: boolean; error?: string };
  registerWorkerWithAuth: (data: {
    userId: string;
    password: string;
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    primaryTrade: TradeType;
    dailyRate: number;
    experienceYears: number;
    area: string;
    aadhaarNumber: string;
    upiId?: string;
  }) => void;
  loginWorker: (data: {
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    primaryTrade: TradeType;
    dailyRate: number;
    experienceYears: number;
    area: string;
    aadhaarNumber: string;
    upiId?: string;
  }) => void;
  logoutWorker: () => void;
  toggleWorkerStatus: () => void;
  updateWorkerUpi: (
    upiId: string,
    bankName?: string,
    ifscCode?: string,
  ) => void;
  updateWorkerGps: (coords: Partial<GpsCoordinates>) => void;
  updateWorkerAvatar: (avatarUrl: string) => void;
  updateWorkerProfile: (updates: Partial<WorkerProfile>) => void;
  acceptJobByWorker: (jobId: string, workerToAssign?: WorkerProfile) => void;
  approveAndFundEscrow: (jobId: string) => void;
  approveWorker: (jobId: string) => void;
  rejectWorker: (jobId: string) => void;
  startJobWithOtp: (jobId: string, otp: string) => boolean;
  completeJobByWorker: (jobId: string) => void;
  withdrawWorkerEarnings: (customUpi?: string) => void;

  // Customer Auth & Accounts
  customerAccounts: UserAccount[];
  loginCustomerWithAuth: (
    userIdOrPhone: string,
    password: string,
  ) => { success: boolean; error?: string };
  registerCustomerWithAuth: (data: {
    userId: string;
    password: string;
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    area: string;
    address: string;
    upiId?: string;
  }) => void;
  loginCustomer: (data: {
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    area: string;
    address: string;
    upiId?: string;
  }) => void;
  logoutCustomer: () => void;
  updateCustomerGps: (coords: Partial<GpsCoordinates>) => void;
  refreshCustomerGpsLocation: () => void;
  postJob: (jobData: {
    title: string;
    trade: TradeType;
    description: string;
    customerName: string;
    customerPhone: string;
    locationAddress: string;
    area: string;
    dailyWage: number;
    durationDays: number;
    startDate?: string;
    endDate?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
    hoursPerDay?: number;
    hourlyRate?: number;
    baseLabor?: number;
  }) => Job;
  dispatchJobStartOtp: (
    job: Job,
    targetEmail?: string,
    targetPhone?: string,
  ) => Promise<boolean>;
  releasePaymentByCustomer: (
    jobId: string,
    rating: number,
    review: string,
    paidVia?: "UPI_QR" | "UPI_DIRECT" | "ESCROW_WALLET" | "CASH",
    txnRef?: string,
    tags?: string[],
  ) => void;
  rateWorkerJob: (
    jobId: string,
    rating: number,
    review: string,
    tags?: string[],
  ) => void;

  // Premium Subscriptions
  subscribeWorkerPremium: (
    workerId: string,
    paymentMethod?: "WALLET" | "UPI",
  ) => { success: boolean; message: string };
  subscribeCustomerPremium: (
    customerId: string,
    paymentMethod?: "UPI" | "CARD" | "NET_BANKING",
  ) => { success: boolean; message: string };
  topUpWorkerWallet: (amount: number) => void;
  disburseWorkerWageFromAdmin: (
    workerId: string,
    wage: number,
    jobId?: string,
    customerName?: string,
  ) => boolean;

  // Subscription Promo Modal
  isSubscriptionPromoOpen: boolean;
  promoInitialRole: "customer" | "worker";
  openSubscriptionPromo: (initialRole?: "customer" | "worker") => void;
  closeSubscriptionPromo: () => void;

  // Platform Safety
  isProtectionModalOpen: boolean;
  protectionModalData: {
    variant: "post_rating" | "post_login";
    workerName?: string;
    workerTrade?: string;
    workerAadhaarMasked?: string;
    refundAmount?: number;
  } | null;
  openProtectionModal: (data: {
    variant: "post_rating" | "post_login";
    workerName?: string;
    workerTrade?: string;
    workerAadhaarMasked?: string;
    refundAmount?: number;
  }) => void;
  closeProtectionModal: () => void;

  // Escrow Complaints
  raiseJobComplaint: (
    jobId: string,
    reason: string,
    detailedExplanation?: string,
  ) => { success: boolean; disputeId?: string };
  adminApproveRefund: (disputeId: string, resolutionNote?: string) => void;
  adminRejectDisputeAndReleaseToWorker: (
    disputeId: string,
    resolutionNote?: string,
  ) => void;
  refundEscrowToCustomer: (jobId: string) => boolean;

  // Admin Auth & Treasury
  adminTreasuryBalance: number;
  adminSubscriptionRevenue: number;
  adminWorkerPayoutsDisbursed: number;
  adminTransactions: AdminTransaction[];
  loginAdminWithAuth: (
    adminIdOrEmail: string,
    password: string,
  ) => { success: boolean; error?: string };
  loginAdmin: (data: { name: string; email: string }) => void;
  logoutAdmin: () => void;
  verifyWorkerByAdmin: (id: string, status: "approved" | "rejected") => void;
  verifyWorkerDirectly: (
    workerId: string,
    status?: "approved" | "rejected",
  ) => void;
  verifyCurrentWorker: (status?: "approved" | "rejected") => void;
  submitWorkerKyc: (data: {
    workerName: string;
    trade: TradeType;
    phone: string;
    aadhaarNumber: string;
    experienceYears: number;
  }) => void;
  seedMoreWorkersForVerification: () => void;
  refreshWorkerGpsLocation: () => void;
  resolveDispute: (id: string) => void;

  // Global Controls & SSO
  signInWithGoogleSSO: (
    preferredRole?: "worker" | "customer" | "admin",
  ) => Promise<{
    success: boolean;
    user?: any;
    isNewUser?: boolean;
    error?: string;
  }>;
  ssoGoogleUser: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    uid: string;
  } | null;
  setSsoGoogleUser: (user: any | null) => void;
  isSSORoleModalOpen: boolean;
  setIsSSORoleModalOpen: (open: boolean) => void;
  isFirebaseConnected: boolean;
  connectedCluster: { connectUrl: string; controlUrl: string; workUrl: string };
  resetToZero: () => void;
  seedSampleData: () => void;
  speak: (text: string) => void;
  notification: string | null;
  setNotification: (msg: string | null) => void;
  showNotification: (msgOrTitle: string, maybeMessage?: string) => void;
}
const AppContext = createContext<AppContextType | undefined>(
  undefined,
); /* Default initial workers in Ludhiana, Punjab */
const DEFAULT_INITIAL_WORKERS: WorkerProfile[] = [
  {
    id: "w-harpreet",
    name: "Harpreet Singh",
    phone: "+91 98101 55678",
    avatar:
      "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=150&auto=format&fit=crop&q=80",
    primaryTrade: "Mason",
    secondaryTrades: ["Tile Worker"],
    dailyRate: 850,
    experienceYears: 6,
    rating: 5.0,
    reviewCount: 3,
    completedJobsCount: 14,
    isOnline: true,
    location: { area: "Model Town", city: "Ludhiana", distanceKm: 0.6 },
    gpsLocation: {
      lat: 30.8926,
      lng: 75.8415,
      area: "Model Town",
      city: "Ludhiana",
      accuracyMeters: 4,
      heading: 45,
      speedKmh: 0,
      lastUpdated: "Just now",
    },
    isSharingLiveGps: true,
    aadhaarNumberMasked: "XXXX-XXXX-9901",
    isVerified: true,
    todayEarnings: 850,
    totalEarnings: 3400,
    walletBalance: 2500,
    badge: "Top Rated",
    upiId: "harpreet.k@upi",
    bankName: "State Bank of India",
    accountNumberMasked: "•••• •••• 9912",
    ifscCode: "SBIN0001234",
  },
];
const DEFAULT_INITIAL_VERIFICATIONS: VerificationRequest[] = [
  {
    id: "v-101",
    workerName: "Harpreet Singh",
    trade: "Mason",
    phone: "+91 98101 55678",
    aadhaarNumber: "7829-4412-9901",
    experienceYears: 6,
    submittedAt: "Just now",
    status: "pending",
  },
  {
    id: "v-102",
    workerName: "Sunil Sharma",
    trade: "Painter",
    phone: "+91 98101 22334",
    aadhaarNumber: "6612-9901-4412",
    experienceYears: 4,
    submittedAt: "5 mins ago",
    status: "pending",
  },
  {
    id: "v-103",
    workerName: "Deepak Kumar",
    trade: "Plumber",
    phone: "+91 98101 99887",
    aadhaarNumber: "8821-3312-5567",
    experienceYears: 5,
    submittedAt: "12 mins ago",
    status: "pending",
  },
  {
    id: "v-104",
    workerName: "Manpreet Singh",
    trade: "Carpenter",
    phone: "+91 98101 33445",
    aadhaarNumber: "5521-8890-1123",
    experienceYears: 7,
    submittedAt: "30 mins ago",
    status: "pending",
  },
  {
    id: "v-105",
    workerName: "Asif Ali",
    trade: "Electrician",
    phone: "+91 98101 77665",
    aadhaarNumber: "4412-5567-7766",
    experienceYears: 5,
    submittedAt: "45 mins ago",
    status: "pending",
  },
];
import i18n from "../i18n";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentRole, setCurrentRole] = useState<AppRole>("select_role");
  const [currentLanguage, setCurrentLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("kaamzo_language") as Language) || "en";
  });

  const setCurrentLanguage = (lang: Language) => {
    setCurrentLanguageState(lang);
    i18n.changeLanguage(lang);
    applyGoogleTranslateLanguage(lang);
  };

  useEffect(() => {
    localStorage.setItem("kaamzo_language", currentLanguage);
    i18n.changeLanguage(currentLanguage);
    applyGoogleTranslateLanguage(currentLanguage);
  }, [currentLanguage]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("kaamzo_theme") === "dark";
  });
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("kaamzo_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("kaamzo_theme", "light");
    }
  }, [isDarkMode]);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  /*  Platform collections  */ const [workers, setWorkers] = useState<
    WorkerProfile[]
  >(() => {
    const isReset = localStorage.getItem("dihadi_is_reset_state_v8") === "true";
    if (isReset) return [];
    const saved = localStorage.getItem("dihadi_workers_zero_v8");
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return DEFAULT_INITIAL_WORKERS;
  });
  const [jobs, setJobs] = useState<Job[]>(() => {
    const isReset = localStorage.getItem("dihadi_is_reset_state_v8") === "true";
    if (isReset) return [];
    const saved = localStorage.getItem("dihadi_jobs_zero_v8");
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });
  const [verifications, setVerifications] = useState<VerificationRequest[]>(
    () => {
      const isReset =
        localStorage.getItem("dihadi_is_reset_state_v8") === "true";
      if (isReset) return [];
      const saved = localStorage.getItem("dihadi_verifications_zero_v8");
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return DEFAULT_INITIAL_VERIFICATIONS;
    },
  );
  const [disputes, setDisputes] = useState<DisputeItem[]>(() => {
    const isReset = localStorage.getItem("dihadi_is_reset_state_v8") === "true";
    if (isReset) return [];
    const saved = localStorage.getItem("dihadi_disputes_zero_v8");
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });
  /*  Current Logged-in Entities  */ const [currentWorker, setCurrentWorker] =
    useState<WorkerProfile | null>(() => {
      const isReset =
        localStorage.getItem("dihadi_is_reset_state_v8") === "true";
      if (isReset) return null;
      const saved = localStorage.getItem("dihadi_current_worker_v8");
      if (!saved) return null;
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed?.id === "ramesh" ||
          parsed?.id === "w-ramesh" ||
          parsed?.name?.toLowerCase()?.includes("ramesh")
        ) {
          localStorage.removeItem("dihadi_current_worker_v8");
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    });
  const [currentCustomer, setCurrentCustomer] =
    useState<CustomerProfile | null>(() => {
      const isReset =
        localStorage.getItem("dihadi_is_reset_state_v8") === "true";
      if (isReset) return null;
      const saved = localStorage.getItem("dihadi_current_customer_v8");
      if (!saved) return null;
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed?.id === "pooja" ||
          parsed?.id === "c-demo-1" ||
          parsed?.name?.toLowerCase()?.includes("pooja")
        ) {
          localStorage.removeItem("dihadi_current_customer_v8");
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    });
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(() => {
    const isReset = localStorage.getItem("dihadi_is_reset_state_v8") === "true";
    if (isReset) return null;
    const saved = localStorage.getItem("dihadi_current_admin_v8");
    return saved ? JSON.parse(saved) : null;
  });
  /* SSO Google User & Role Selection Modal State */
  const [ssoGoogleUser, setSsoGoogleUser] = useState<{
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    uid: string;
  } | null>(null);
  const [isSSORoleModalOpen, setIsSSORoleModalOpen] = useState<boolean>(false);
  /*  Admin Treasury & Automated Payouts State  */ const [
    adminTreasuryBalance,
    setAdminTreasuryBalance,
  ] = useState<number>(() => {
    const saved = localStorage.getItem("dihadi_admin_treasury_v8");
    return saved ? Number(saved) : 65000;
  });
  const [adminSubscriptionRevenue, setAdminSubscriptionRevenue] =
    useState<number>(() => {
      const saved = localStorage.getItem("dihadi_admin_sub_rev_v8");
      return saved ? Number(saved) : 45000;
    });
  const [adminWorkerPayoutsDisbursed, setAdminWorkerPayoutsDisbursed] =
    useState<number>(() => {
      const saved = localStorage.getItem("dihadi_admin_disbursed_v8");
      return saved ? Number(saved) : 18500;
    });
  const [adminTransactions, setAdminTransactions] = useState<
    AdminTransaction[]
  >(() => {
    const saved = localStorage.getItem("dihadi_admin_txs_v8");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "tx-sub-1",
        type: "SUBSCRIPTION_CREDIT",
        amount: 15000,
        description: "Customer Gold Membership (1 Month Free Service)",
        timestamp: "Today, 09:30 AM",
        customerName: "Dummy Customer",
      },
      {
        id: "tx-sub-2",
        type: "SUBSCRIPTION_CREDIT",
        amount: 2000,
        description: "Worker VIP Pass & Instant Aadhaar Verification",
        timestamp: "Today, 10:15 AM",
        workerName: "Harpreet Singh",
      },
      {
        id: "tx-payout-1",
        type: "WORKER_PAYOUT_DISBURSEMENT",
        amount: 850,
        description:
          "Admin Treasury Auto-Disbursed wage to Harpreet Singh on behalf of Gold Member Dummy Customer",
        timestamp: "Today, 11:00 AM",
        customerName: "Dummy Customer",
        workerName: "Harpreet Singh",
      },
    ];
  });
  /*  YouTube-Style Subscription Promo Ad State  */ const [
    isSubscriptionPromoOpen,
    setIsSubscriptionPromoOpen,
  ] = useState<boolean>(false);
  const [promoInitialRole, setPromoInitialRole] = useState<
    "customer" | "worker"
  >("customer");
  const openSubscriptionPromo = (
    initialRole: "customer" | "worker" = "customer",
  ) => {
    setPromoInitialRole(initialRole);
    setIsSubscriptionPromoOpen(true);
    playSound("incoming_job");
  };
  const closeSubscriptionPromo = () => {
    setIsSubscriptionPromoOpen(false);
    sessionStorage.setItem("dihadi_promo_shown_session_v8", "true");
    sessionStorage.setItem(`dihadi_promo_shown_${promoInitialRole}_v8`, "true");
  };
  /*  Platform Safety, Direct Hiring Warning & Trust Guarantee Modal State  */ const [
    isProtectionModalOpen,
    setIsProtectionModalOpen,
  ] = useState<boolean>(false);
  const [protectionModalData, setProtectionModalData] = useState<{
    variant: "post_rating" | "post_login";
    workerName?: string;
    workerTrade?: string;
    workerAadhaarMasked?: string;
    refundAmount?: number;
  } | null>(null);
  const openProtectionModal = (data: {
    variant: "post_rating" | "post_login";
    workerName?: string;
    workerTrade?: string;
    workerAadhaarMasked?: string;
    refundAmount?: number;
  }) => {
    setProtectionModalData(data);
    setIsProtectionModalOpen(true);
    playSound("alert");
  };
  const closeProtectionModal = () => {
    setIsProtectionModalOpen(false);
    setProtectionModalData(null);
  }; // Subscription promo ad on app start/reopen is disabled as requested by the user /* useEffect(() => { Promo logic removed }, [currentRole]); */
  /*  Registered credentials database  */
  const [workerAccounts, setWorkerAccounts] = useState<UserAccount[]>(() => {
    const isReset = localStorage.getItem("dihadi_is_reset_state_v8") === "true";
    if (isReset) return [];
    const saved = localStorage.getItem("dihadi_worker_accounts_v8");
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: "harpreet",
        phone: "9810155678",
        password: "123",
        name: "Harpreet Singh",
        role: "worker",
        extraData: {
          trade: "Mason",
          rate: 850,
          area: "Model Town, Ludhiana",
          aadhaar: "7829-4412-9901",
          upi: "harpreet.mason@okaxis",
        },
      },
      {
        id: "sunil",
        phone: "9810122334",
        password: "123",
        name: "Sunil Sharma",
        role: "worker",
        extraData: {
          trade: "Painter",
          rate: 900,
          area: "Sarabha Nagar, Ludhiana",
          aadhaar: "6612-9901-4412",
          upi: "sunil.painter@paytm",
        },
      },
      {
        id: "deepak",
        phone: "9810199887",
        password: "123",
        name: "Deepak Kumar",
        role: "worker",
        extraData: {
          trade: "Plumber",
          rate: 850,
          area: "Civil Lines, Ludhiana",
          aadhaar: "8821-3312-5567",
          upi: "deepak.plumber@okaxis",
        },
      },
    ];
  });
  const [customerAccounts, setCustomerAccounts] = useState<UserAccount[]>(
    () => {
      const isReset =
        localStorage.getItem("dihadi_is_reset_state_v8") === "true";
      if (isReset) return [];
      const saved = localStorage.getItem("dihadi_customer_accounts_v8");
      if (saved !== null) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return [
        {
          id: "bhavnoor",
          phone: "9910088221",
          password: "123",
          name: "Dummy Customer",
          role: "customer",
          extraData: {
            area: "Model Town",
            address: "House 142, Model Town, Ludhiana, Punjab",
            upi: "bhavnoor.verma@okhdfcbank",
          },
        },
        {
          id: "vikram",
          phone: "9910077665",
          password: "123",
          name: "Vikram Sethi",
          role: "customer",
          extraData: {
            area: "Sarabha Nagar",
            address: "House 18, Block B, Sarabha Nagar, Ludhiana, Punjab",
            upi: "vikram.sethi@okicici",
          },
        },
      ];
    },
  );
  /*  City & Live Geolocation State  */ const [
    currentCity,
    setCurrentCityState,
  ] = useState<CityInfo>(() => {
    const saved = localStorage.getItem("dihadi_current_city_v8");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      } catch (e) {}
    }
    return SUPPORTED_CITIES[0]; /*  Ludhiana, Punjab  */
  });
  const [currentResolvedAddress, setCurrentResolvedAddress] =
    useState<ResolvedAddress | null>(() => {
      const saved = localStorage.getItem("dihadi_resolved_address_v8");
      return saved ? JSON.parse(saved) : null;
    });
  const [isLocating, setIsLocating] = useState(false);
  const setCurrentCity = (city: CityInfo) => {
    setCurrentCityState(city);
    localStorage.setItem("dihadi_current_city_v8", JSON.stringify(city));
    playSound("gps_ping");
    showNotification(`City set to ${city.name}, ${city.state}`);
    /*  Synchronize current worker location & GPS to new city  */ if (
      currentWorker
    ) {
      const areaCoords = getCoordinatesForArea(city.defaultArea, city.name);
      const updatedGps: GpsCoordinates = {
        ...currentWorker.gpsLocation,
        lat: areaCoords.lat,
        lng: areaCoords.lng,
        city: city.name,
        area: city.defaultArea,
        lastUpdated: "Just now",
      };
      const updated: WorkerProfile = {
        ...currentWorker,
        location: {
          ...currentWorker.location,
          city: city.name,
          area: city.defaultArea,
        },
        gpsLocation: updatedGps,
      };
      setCurrentWorker(updated);
      setWorkers((prev) =>
        prev.map((w) => (w.id === currentWorker.id ? updated : w)),
      );
    }
    /*  Synchronize current customer location & GPS to new city  */ if (
      currentCustomer
    ) {
      const areaCoords = getCoordinatesForArea(city.defaultArea, city.name);
      const updatedCustomer: CustomerProfile = {
        ...currentCustomer,
        city: city.name,
        area: city.defaultArea,
        address: `${city.defaultArea}, ${city.name}, ${city.state}`,
        gpsLocation: {
          ...currentCustomer.gpsLocation,
          lat: areaCoords.lat,
          lng: areaCoords.lng,
          city: city.name,
          area: city.defaultArea,
          address: `${city.defaultArea}, ${city.name}, ${city.state}`,
          lastUpdated: "Just now",
        },
      };
      setCurrentCustomer(updatedCustomer);
    }
  };
  /** * Snap to Real-World Address: * Combines HTML5 Geolocation with Reverse Geocoding API to pinpoint * exact street-level coordinates and update active city & profiles. */ const snapToRealWorldAddress =
    async (): Promise<ResolvedAddress | null> => {
      if (!("geolocation" in navigator)) {
        showNotification("Geolocation is not supported by your browser.");
        return null;
      }
      setIsLocating(true);
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = +pos.coords.latitude.toFixed(6);
            const lng = +pos.coords.longitude.toFixed(6);
            const accuracy = Math.round(pos.coords.accuracy) || 4;
            try {
              const resolved = await reverseGeocodeLocation(lat, lng, accuracy);
              setCurrentResolvedAddress(resolved);
              localStorage.setItem(
                "dihadi_resolved_address_v8",
                JSON.stringify(resolved),
              );
              const detectedCity = detectCityFromCoords(lat, lng);
              const activeCityInfo: CityInfo = {
                id: detectedCity.id,
                name: resolved.city || detectedCity.name,
                state: resolved.state || detectedCity.state,
                lat,
                lng,
                defaultArea: resolved.sublocality || detectedCity.defaultArea,
              };
              setCurrentCityState(activeCityInfo);
              localStorage.setItem(
                "dihadi_current_city_v8",
                JSON.stringify(activeCityInfo),
              );
              if (currentWorker) {
                updateWorkerGps({
                  lat,
                  lng,
                  city: activeCityInfo.name,
                  area: resolved.sublocality || activeCityInfo.defaultArea,
                  accuracyMeters: accuracy,
                  heading: pos.coords.heading
                    ? Math.round(pos.coords.heading)
                    : 45,
                  lastUpdated: "Just now",
                });
              }
              if (currentCustomer) {
                updateCustomerGps({
                  lat,
                  lng,
                  city: activeCityInfo.name,
                  area: resolved.sublocality || activeCityInfo.defaultArea,
                  address: resolved.formattedAddress,
                  accuracyMeters: accuracy,
                  lastUpdated: "Just now",
                });
              }
              setIsLocating(false);
              playSound("gps_ping");
              showNotification(`📍 Snapped to: ${resolved.formattedAddress}`);
              resolve(resolved);
            } catch (err) {
              console.error("Reverse geocode resolution failed:", err);
              setIsLocating(false);
              resolve(null);
            }
          },
          (err) => {
            console.debug(
              "Geolocation request error or permission denied:",
              err,
            );
            setIsLocating(
              false,
            ); /* Fallback to active city coordinates without throwing error */
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 8000 },
        );
      });
    };
  const detectAndSetLiveLocation = async (): Promise<boolean> => {
    const res = await snapToRealWorldAddress();
    return !!res;
  };
  useEffect(() => {
    detectAndSetLiveLocation();
  }, []);
  /*  Calling & Modal states  */ const [activeCall, setActiveCall] =
    useState<CallSession | null>(null);
  const [activeGpsJob, setActiveGpsJob] = useState<Job | null>(null);
  const [activeUpiPaymentJob, setActiveUpiPaymentJob] = useState<Job | null>(
    null,
  );
  const [activeMultiChannelJob, setActiveMultiChannelJob] =
    useState<Job | null>(null);
  const [activeMultiChannelWorker, setActiveMultiChannelWorker] =
    useState<WorkerProfile | null>(null);
  const [activeShortlistJob, setActiveShortlistJob] = useState<Job | null>(
    null,
  );
  /*  Automated Job Matching Engine state  */ const [
    latestMatchedJob,
    setLatestMatchedJob,
  ] = useState<Job | null>(null);
  const [latestTop5Matches, setLatestTop5Matches] = useState<
    HyperlocalMatchResult[]
  >([]);
  const [chatNotifications, setChatNotifications] = useState<
    ChatNotificationItem[]
  >([]);
  const [pendingRoleNotifications, setPendingRoleNotifications] = useState<
    ChatNotificationItem[]
  >(() => {
    try {
      const saved = localStorage.getItem("dihadi_pending_chat_notifs_v1");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeGlobalChat, setActiveGlobalChat] = useState<{
    isOpen: boolean;
    job?: Job | null;
    targetPerson?: any;
    role?: "worker" | "customer" | "admin";
  } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const connectedCluster = {
    connectUrl: "https://dihadi-connect.vercel.app/",
    controlUrl: "https://dihadi-control.vercel.app/",
    workUrl: "https://dihadi-work.vercel.app/",
  };
  /*  1. Real-time Firestore synchronization for Workers  */ useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, COLLECTIONS.WORKERS),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteWorkers: WorkerProfile[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as WorkerProfile;
              if (data && data.id) {
                remoteWorkers.push(data);
              }
            });
            setWorkers(remoteWorkers);
            setIsFirebaseConnected(true);
          } else {
            const isReset =
              localStorage.getItem("dihadi_is_reset_state_v8") === "true";
            if (isReset) {
              setWorkers([]);
            }
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, COLLECTIONS.WORKERS);
        },
      );
      return () => unsub();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLLECTIONS.WORKERS);
    }
  }, []);
  /* Real-time Firestore synchronization for Jobs */ useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, COLLECTIONS.JOBS),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteJobs: Job[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Job;
              if (data && data.id) {
                remoteJobs.push(data);
              }
            });
            setJobs(remoteJobs);
            setIsFirebaseConnected(true);
          } else {
            setJobs([]);
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, COLLECTIONS.JOBS);
        },
      );
      return () => unsub();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLLECTIONS.JOBS);
    }
  }, []);
  /* Real-time Firestore synchronization for KYC Verifications */ useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, COLLECTIONS.VERIFICATIONS),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteVerifs: VerificationRequest[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as VerificationRequest;
              if (data && data.id) {
                remoteVerifs.push(data);
              }
            });
            setVerifications(remoteVerifs);
          } else {
            const isReset =
              localStorage.getItem("dihadi_is_reset_state_v8") === "true";
            if (isReset) {
              setVerifications([]);
            }
          }
        },
        (err) => {
          handleFirestoreError(
            err,
            OperationType.LIST,
            COLLECTIONS.VERIFICATIONS,
          );
        },
      );
      return () => unsub();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLLECTIONS.VERIFICATIONS);
    }
  }, []);
  /* Real-time Firestore synchronization for Disputes */ useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, COLLECTIONS.DISPUTES),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteDisputes: DisputeItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as DisputeItem;
              if (data && data.id) {
                remoteDisputes.push(data);
              }
            });
            setDisputes(remoteDisputes);
          } else {
            setDisputes([]);
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, COLLECTIONS.DISPUTES);
        },
      );
      return () => unsub();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLLECTIONS.DISPUTES);
    }
  }, []);
  /* Real-time Firestore synchronization for Registered Accounts (Credentials & Passwords) */ useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, COLLECTIONS.ACCOUNTS),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteAccounts: UserAccount[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as UserAccount;
              if (data && (data.id || data.phone)) {
                remoteAccounts.push(data);
              }
            });
            if (remoteAccounts.length > 0) {
              /*  Merge worker accounts  */ setWorkerAccounts((prev) => {
                const updated = [...prev];
                remoteAccounts
                  .filter((a) => a.role === "worker")
                  .forEach((rem) => {
                    const idx = updated.findIndex(
                      (u) =>
                        u.id?.toLowerCase() === rem.id?.toLowerCase() ||
                        (u.phone &&
                          rem.phone &&
                          u.phone.replace(/[^0-9]/g, "").slice(-10) ===
                            rem.phone.replace(/[^0-9]/g, "").slice(-10)),
                    );
                    if (idx >= 0) {
                      updated[idx] = { ...updated[idx], ...rem };
                    } else {
                      updated.push(rem);
                    }
                  });
                return updated;
              });
              /*  Merge customer accounts  */ setCustomerAccounts((prev) => {
                const updated = [...prev];
                remoteAccounts
                  .filter((a) => a.role === "customer")
                  .forEach((rem) => {
                    const idx = updated.findIndex(
                      (u) =>
                        u.id?.toLowerCase() === rem.id?.toLowerCase() ||
                        (u.phone &&
                          rem.phone &&
                          u.phone.replace(/[^0-9]/g, "").slice(-10) ===
                            rem.phone.replace(/[^0-9]/g, "").slice(-10)),
                    );
                    if (idx >= 0) {
                      updated[idx] = { ...updated[idx], ...rem };
                    } else {
                      updated.push(rem);
                    }
                  });
                return updated;
              });
            }
          } else {
            const isReset =
              localStorage.getItem("dihadi_is_reset_state_v8") === "true";
            if (isReset) {
              setWorkerAccounts([]);
              setCustomerAccounts([]);
            }
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, COLLECTIONS.ACCOUNTS);
        },
      );
      return () => unsub();
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLLECTIONS.ACCOUNTS);
    }
  }, []);
  // Persistence hooks
  useEffect(() => {
    localStorage.setItem("dihadi_workers_zero_v8", JSON.stringify(workers));
  }, [workers]);
  useEffect(() => {
    localStorage.setItem("dihadi_jobs_zero_v8", JSON.stringify(jobs));
  }, [jobs]);
  useEffect(() => {
    localStorage.setItem(
      "dihadi_verifications_zero_v8",
      JSON.stringify(verifications),
    );
  }, [verifications]);
  useEffect(() => {
    localStorage.setItem("dihadi_disputes_zero_v8", JSON.stringify(disputes));
  }, [disputes]);
  useEffect(() => {
    localStorage.setItem(
      "dihadi_worker_accounts_v8",
      JSON.stringify(workerAccounts),
    );
  }, [workerAccounts]);
  useEffect(() => {
    localStorage.setItem(
      "dihadi_customer_accounts_v8",
      JSON.stringify(customerAccounts),
    );
  }, [customerAccounts]);
  useEffect(() => {
    if (currentWorker) {
      localStorage.setItem(
        "dihadi_current_worker_v8",
        JSON.stringify(currentWorker),
      );
    } else {
      localStorage.removeItem("dihadi_current_worker_v8");
    }
  }, [currentWorker]);
  /* Keep currentWorker synchronized whenever workers list or verifications list updates */ useEffect(() => {
    if (!currentWorker) return;
    const cleanPhone = currentWorker.phone.replace(/[^0-9]/g, "").slice(-10);
    const cleanName = currentWorker.name.trim().toLowerCase();
    const matchedWorker = workers.find((w) => {
      if (w.id === currentWorker.id) return true;
      const wCleanPhone = w.phone.replace(/[^0-9]/g, "").slice(-10);
      return (wCleanPhone && cleanPhone && wCleanPhone === cleanPhone);
    });
    const matchedVerification = verifications.find((v) => {
      const vCleanPhone = v.phone.replace(/[^0-9]/g, "").slice(-10);
      return (vCleanPhone && cleanPhone && vCleanPhone === cleanPhone);
    });
    const isVerifiedNow = matchedWorker
      ? matchedWorker.isVerified
      : matchedVerification?.status === "approved";
    const targetBadge = isVerifiedNow
      ? "Aadhaar Verified"
      : matchedWorker?.badge ||
        (matchedVerification?.status === "pending"
          ? "KYC Under Review"
          : "Registered Worker");
    if (
      currentWorker.isVerified !== isVerifiedNow ||
      currentWorker.badge !== targetBadge
    ) {
      setCurrentWorker((curr) =>
        curr
          ? { ...curr, isVerified: isVerifiedNow, badge: targetBadge }
          : null,
      );
    }
  }, [workers, verifications]);
  // Ensure worker & customer location stay strictly aligned with city & GPS
  useEffect(() => {
    if (currentWorker) {
      const lat = currentWorker.gpsLocation?.lat;
      const lng = currentWorker.gpsLocation?.lng;
      const currentCityName = currentCity?.name || "Ludhiana";
      const isLudhiana = currentCityName.toLowerCase().includes("ludhiana");
      const isStaleDelhi =
        currentWorker.location?.city?.toLowerCase().includes("delhi") ||
        currentWorker.location?.area?.toLowerCase().includes("okhla") ||
        currentWorker.gpsLocation?.city?.toLowerCase().includes("delhi") ||
        currentWorker.gpsLocation?.area?.toLowerCase().includes("okhla");
      if (isLudhiana && isStaleDelhi) {
        const area = currentCity.defaultArea || "Model Town";
        const coords = getCoordinatesForArea(area, "Ludhiana");
        const updatedGps: GpsCoordinates = {
          ...currentWorker.gpsLocation,
          lat: lat && lat > 30 && lat < 32 ? lat : coords.lat,
          lng: lng && lng > 74 && lng < 77 ? lng : coords.lng,
          city: "Ludhiana",
          area: area,
          lastUpdated: "Just now",
        };
        const updated: WorkerProfile = {
          ...currentWorker,
          location: { ...currentWorker.location, city: "Ludhiana", area: area },
          gpsLocation: updatedGps,
        };
        setCurrentWorker(updated);
        setWorkers((prev) =>
          prev.map((w) => (w.id === currentWorker.id ? updated : w)),
        );
      }
    }
  }, [currentCity]);
  useEffect(() => {
    if (currentCustomer) {
      localStorage.setItem(
        "dihadi_current_customer_v8",
        JSON.stringify(currentCustomer),
      );
    } else {
      localStorage.removeItem("dihadi_current_customer_v8");
    }
  }, [currentCustomer]);
  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem(
        "dihadi_current_admin_v8",
        JSON.stringify(currentAdmin),
      );
    } else {
      localStorage.removeItem("dihadi_current_admin_v8");
    }
  }, [currentAdmin]);
  const showNotification = (msgOrTitle: string, maybeMessage?: string) => {
    const formatted = maybeMessage
      ? `${msgOrTitle}: ${maybeMessage}`
      : msgOrTitle;
    setNotification(formatted);
    setTimeout(() => {
      setNotification((curr) => (curr === formatted ? null : curr));
    }, 4500);
  };
  const speak = (text: string) => {
    speakText(text, currentLanguage);
  };
  /*  Calling handlers  */ const startCall = (
    caller: {
      name: string;
      role: "worker" | "customer" | "admin";
      phone: string;
    },
    receiver: {
      name: string;
      role: "worker" | "customer" | "admin";
      phone: string;
    },
    jobTitle?: string,
  ) => {
    const session: CallSession = {
      id: `call-${Date.now().toString().slice(-4)}`,
      callerName: caller.name,
      callerRole: caller.role,
      callerPhone: caller.phone,
      receiverName: receiver.name,
      receiverRole: receiver.role,
      receiverPhone: receiver.phone,
      jobTitle,
      status: "calling",
      startedAt: Date.now(),
      durationSeconds: 0,
      isMuted: false,
      isSpeaker: true,
    };
    setActiveCall(session);
    showNotification(`📞 Calling ${receiver.name}...`);
  };
  const endCall = () => {
    setActiveCall(null);
  };
  const openGpsRadar = (job: Job) => {
    setActiveGpsJob(job);
    playSound("gps_ping");
  };
  const closeGpsRadar = () => {
    setActiveGpsJob(null);
  };
  const openUpiPayment = (job: Job) => {
    setActiveUpiPaymentJob(job);
    playSound("click");
  };
  const closeUpiPayment = () => {
    setActiveUpiPaymentJob(null);
  };
  const openMultiChannelModal = (job: Job, worker?: WorkerProfile) => {
    setActiveMultiChannelJob(job);
    const target =
      worker ||
      (job.assignedWorkerId
        ? workers.find((w) => w.id === job.assignedWorkerId)
        : null) ||
      workers[0] ||
      currentWorker;
    setActiveMultiChannelWorker(target || null);
    playSound("incoming_job");
  };
  const closeMultiChannelModal = () => {
    setActiveMultiChannelJob(null);
    setActiveMultiChannelWorker(null);
  };
  const openTop5Shortlist = (job: Job) => {
    setActiveShortlistJob(job);
    playSound("click");
  };
  const closeTop5Shortlist = () => {
    setActiveShortlistJob(null);
  };
  /*  Automated Job Matching Engine Helpers  */ const getTop5WorkersForJob = (
    jobOrCriteria:
      | Job
      | {
          trade: TradeType;
          jobGps?: GpsCoordinates;
          lat?: number;
          lng?: number;
          area?: string;
          dailyWage?: number;
          maxRadiusKm?: number;
        },
  ): HyperlocalMatchResult[] => {
    const jobLat =
      (jobOrCriteria as Job).jobGps?.lat ??
      (jobOrCriteria as any).lat ??
      currentCustomer?.gpsLocation.lat ??
      currentCity.lat;
    const jobLng =
      (jobOrCriteria as Job).jobGps?.lng ??
      (jobOrCriteria as any).lng ??
      currentCustomer?.gpsLocation.lng ??
      currentCity.lng;
    const maxRadius = (jobOrCriteria as any).maxRadiusKm || 10.0;
    return getTop5Shortlist(workers, {
      trade: jobOrCriteria.trade,
      lat: jobLat,
      lng: jobLng,
      maxRadiusKm: maxRadius,
      budget: (jobOrCriteria as any).dailyWage,
      language: currentLanguage,
    });
  };
  const matchJobWithWorkers = (job: Job) => {
    const jobLat =
      job.jobGps?.lat || currentCustomer?.gpsLocation.lat || currentCity.lat;
    const jobLng =
      job.jobGps?.lng || currentCustomer?.gpsLocation.lng || currentCity.lng;
    const allMatches = matchHyperlocalWorkers(workers, {
      trade: job.trade,
      lat: jobLat,
      lng: jobLng,
      maxRadiusKm: 10.0,
      budget: job.dailyWage,
      language: currentLanguage,
    });
    const top5 = allMatches.slice(0, 5);
    return {
      matches: top5,
      totalEligible: allMatches.length,
      topMatch: top5.length > 0 ? top5[0] : null,
    };
  };
  const clearMatchedSuggestions = () => {
    setLatestMatchedJob(null);
    setLatestTop5Matches([]);
  };
  /*  Real-time Chat Notifications System  */ const triggerChatNotification = (
    item: ChatNotificationItem,
  ) => {
    const targetRecipientRole = (
      item.recipientRole || "customer"
    ).toLowerCase();
    const activeRole = (currentRole || "").toLowerCase();
    /* Only display popup if the user is currently viewing the recipient's screen */ if (
      activeRole === targetRecipientRole
    ) {
      setChatNotifications((prev) => {
        const filtered = prev.filter((p) => p.id !== item.id);
        return [item, ...filtered].slice(0, 3);
      });
      playSound("message");
    } else {
      /* Otherwise store in pending queue so it pops up when the user switches to the recipient side! */ setPendingRoleNotifications(
        (prev) => {
          const updated = [item, ...prev.filter((p) => p.id !== item.id)].slice(
            0,
            10,
          );
          try {
            localStorage.setItem(
              "dihadi_pending_chat_notifs_v1",
              JSON.stringify(updated),
            );
          } catch (err) {}
          return updated;
        },
      );
    }
  };
  const dismissChatNotification = (id: string) => {
    setChatNotifications((prev) => prev.filter((item) => item.id !== id));
    setPendingRoleNotifications((prev) => {
      const remaining = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(
          "dihadi_pending_chat_notifs_v1",
          JSON.stringify(remaining),
        );
      } catch (err) {}
      return remaining;
    });
  };
  // Check and display pending notifications when the user switches role
  useEffect(() => {
    if (!currentRole || currentRole === "select_role") return;
    const activeRole = currentRole.toLowerCase();
    setPendingRoleNotifications((prev) => {
      const matching = prev.filter(
        (item) => (item.recipientRole || "").toLowerCase() === activeRole,
      );
      if (matching.length > 0) {
        setChatNotifications((curr) => {
          const combined = [...matching, ...curr];
          const unique = Array.from(
            new Map(combined.map((m) => [m.id, m])).values(),
          ).slice(0, 3);
          return unique;
        });
        playSound("message");
        const remaining = prev.filter(
          (item) => (item.recipientRole || "").toLowerCase() !== activeRole,
        );
        try {
          localStorage.setItem(
            "dihadi_pending_chat_notifs_v1",
            JSON.stringify(remaining),
          );
        } catch (err) {}
        return remaining;
      }
      return prev;
    });
  }, [currentRole]);
  const openGlobalChat = (
    job?: Job | null,
    targetPerson?: any,
    role?: "worker" | "customer" | "admin",
  ) => {
    setActiveGlobalChat({
      isOpen: true,
      job: job || null,
      targetPerson: targetPerson || null,
      role:
        role ||
        (currentRole === "customer"
          ? "customer"
          : currentRole === "worker"
            ? "worker"
            : "customer"),
    });
    playSound("click");
  };
  const closeGlobalChat = () => {
    setActiveGlobalChat(null);
  };
  /* Listen globally to all chat message dispatch events */
  useEffect(() => {
    const handleGlobalChatMsgEvent = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      const notifItem: ChatNotificationItem = {
        id:
          detail.id ||
          `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        senderRole: detail.senderRole || "worker",
        senderName: detail.senderName || "Contact",
        senderPhone: detail.senderPhone || "+91 98100 00000",
        recipientRole: detail.recipientRole || "customer",
        recipientName: detail.recipientName || "You",
        text: detail.text || "New message received",
        timestamp: detail.timestamp || "Just now",
        jobTitle: detail.jobTitle,
        jobId: detail.jobId,
        job: detail.job,
        targetPerson: detail.targetPerson,
        isSender: false,
      };
      triggerChatNotification(notifItem);
    };
    window.addEventListener(
      "dihadi_chat_message_event",
      handleGlobalChatMsgEvent,
    );
    return () => {
      window.removeEventListener(
        "dihadi_chat_message_event",
        handleGlobalChatMsgEvent,
      );
    };
  }, [currentRole]);
  /* Completely Reset All Data to ZERO */ const resetToZero = async () => {
    // 1. Mark explicit persistent reset flag
    localStorage.setItem("dihadi_is_reset_state_v8", "true");
    localStorage.setItem("dihadi_workers_zero_v8", "[]");
    localStorage.setItem("dihadi_jobs_zero_v8", "[]");
    localStorage.setItem("dihadi_verifications_zero_v8", "[]");
    localStorage.setItem("dihadi_disputes_zero_v8", "[]");
    localStorage.setItem("dihadi_worker_accounts_v8", "[]");
    localStorage.setItem("dihadi_customer_accounts_v8", "[]");
    localStorage.setItem("dihadi_admin_txs_v8", "[]");
    localStorage.removeItem("dihadi_current_worker_v8");
    localStorage.removeItem("dihadi_current_customer_v8");
    localStorage.removeItem("dihadi_current_admin_v8");
    localStorage.removeItem("dihadi_pending_chat_notifs_v1");

    // Clear all dynamic chat storage keys from local storage
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("dihadi_chat_") || k.startsWith("dihadi_otp_")) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {}

    // 2. Clear all React states immediately
    setWorkers([]);
    setJobs([]);
    setCustomerAccounts([]);
    setWorkerAccounts([]);
    setVerifications([]);
    setDisputes([]);
    setCurrentWorker(null);
    setCurrentCustomer(null);
    setCurrentAdmin(null);
    setActiveCall(null);
    setActiveGpsJob(null);
    setActiveUpiPaymentJob(null);
    setCurrentRole("select_role");

    // 3. Clear all Firestore remote database collections permanently
    try {
      await clearAllFirestoreData();
    } catch (err) {
      console.warn("Firestore collection purge notice:", err);
    }

    playSound("click");
    showNotification(
      "Platform permanently reset: 0 workers, 0 customers, 0 jobs.",
    );
  };
  /* Seed sample demo data if explicitly requested */ const seedSampleData =
    () => {
      localStorage.removeItem("dihadi_is_reset_state_v8");
      const demoWorker: WorkerProfile = {
        id: "w-demo-1",
        name: "Harpreet Singh",
        phone: "+91 98101 55678",
        avatar:
          "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=150&auto=format&fit=crop&q=80",
        primaryTrade: "Mason",
        secondaryTrades: ["Tile Worker"],
        dailyRate: 850,
        experienceYears: 6,
        rating: 5.0,
        reviewCount: 1,
        completedJobsCount: 0,
        isOnline: true,
        location: { area: "Model Town", city: "Ludhiana", distanceKm: 1.2 },
        gpsLocation: {
          lat: 30.8926,
          lng: 75.8415,
          area: "Model Town",
          city: "Ludhiana",
          accuracyMeters: 4,
          heading: 45,
          speedKmh: 0,
          lastUpdated: "Just now",
        },
        isSharingLiveGps: true,
        aadhaarNumberMasked: "XXXX-XXXX-9901",
        isVerified: true,
        todayEarnings: 0,
        totalEarnings: 0,
        walletBalance: 0,
        badge: "Verified Mason",
        upiId: "harpreet.mason@okaxis",
        bankName: "State Bank of India",
        accountNumberMasked: "•••• •••• 4819",
        ifscCode: "SBIN0004921",
      };
      const demoCustomer: CustomerProfile = {
        id: "c-demo-1",
        name: "Dummy Customer",
        phone: "+91 00000 00000",
        area: "Model Town",
        city: "Ludhiana",
        address: "House 142, Model Town, Ludhiana, Punjab",
        gpsLocation: {
          lat: 30.895,
          lng: 75.843,
          area: "Model Town",
          city: "Ludhiana",
          address: "House 142, Model Town, Ludhiana, Punjab",
        },
        upiId: "bhavnoor.verma@okhdfcbank",
      };
      const demoAdmin: AdminProfile = {
        id: "adm-demo-1",
        name: "Dihadi Operations",
        email: "ops@dihadi.co",
        role: "Super Admin",
      };
      setWorkers([demoWorker]);
      setCurrentWorker(demoWorker);
      setCurrentCustomer(demoCustomer);
      setCurrentAdmin(demoAdmin);
      const demoJob: Job = {
        id: "job-demo-101",
        title: "Wall Plastering & Brick Repair",
        trade: "Mason",
        description: "Daily boundary wall brickwork and plastering.",
        customerName: "Dummy Customer",
        customerPhone: "+91 00000 00000",
        locationAddress: "House 142, Model Town, Ludhiana, Punjab",
        area: "Model Town",
        distanceKm: 1.2,
        jobGps: {
          lat: 30.895,
          lng: 75.843,
          area: "Model Town",
          city: "Ludhiana",
          address: "House 142, Model Town, Ludhiana, Punjab",
        },
        dailyWage: 850,
        durationDays: 1,
        status: "broadcast",
        otpCode: "4829",
        postedAt: "Just now",
        platformFee: 170,
        workerPayout: 680,
        isPaid: false,
        assignedWorkerUpi: "harpreet.mason@okaxis",
      };
      setJobs([demoJob]);
      setVerifications([
        {
          id: "v-demo-1",
          workerName: "Harpreet Singh",
          trade: "Mason",
          phone: "+91 98101 55678",
          aadhaarNumber: "7829-4412-9901",
          experienceYears: 6,
          submittedAt: "Just now",
          status: "approved",
        },
      ]);
      syncWorkerToFirestore(demoWorker);
      syncJobToFirestore(demoJob);
      syncAccountToFirestore({
        id: "harpreet",
        phone: "9810155678",
        password: "123",
        name: "Harpreet Singh",
        role: "worker",
      });
      syncAccountToFirestore({
        id: "bhavnoor",
        phone: "9910088221",
        password: "123",
        name: "Dummy Customer",
        role: "customer",
      });
      playSound("success");
      showNotification("Demo test environment created with UPI & GPS active.");
    };
  /*  Helper to match user credentials by User ID, Email, Phone number (last 10 digits), or Name  */ const findAccountMatch =
    (accounts: UserAccount[], input: string): UserAccount | undefined => {
      const clean = input.trim().toLowerCase();
      if (!clean) return undefined;
      const digits = input.replace(/[^0-9]/g, "");
      const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
      /*  1. Direct ID match (case-insensitive)  */ let match = accounts.find(
        (a) => a.id && a.id.trim().toLowerCase() === clean,
      );
      if (match) return match;
      // 2. Email match
      match = accounts.find((a) => {
        const email = (a.extraData?.email || (a as any).email || "")
          .trim()
          .toLowerCase();
        return email && (email === clean || clean === email.split("@")[0]);
      });
      if (match) return match;
      /*  3. Normalized Phone match  */ if (digits.length >= 7) {
        match = accounts.find((a) => {
          const aDigits = (a.phone || "").replace(/[^0-9]/g, "");
          const aLast10 = aDigits.length >= 10 ? aDigits.slice(-10) : aDigits;
          return (
            aDigits === digits || (last10.length >= 10 && aLast10 === last10)
          );
        });
        if (match) return match;
      }
      // 4. Name match (case-insensitive)
      match = accounts.find(
        (a) => a.name && a.name.trim().toLowerCase() === clean,
      );
      if (match) return match;
      return undefined;
    };
  /*  Worker Login with Auth (ID & Password)  */ const loginWorkerWithAuth = (
    userIdOrPhone: string,
    password: string,
  ): { success: boolean; error?: string } => {
    const cleanInput = userIdOrPhone.trim();
    if (!cleanInput) {
      return {
        success: false,
        error: "Please enter your User ID, Mobile number, or Email.",
      };
    }
    const found = findAccountMatch(workerAccounts, cleanInput);
    if (!found) {
      /*  Auto-fallback demo match  */ if (
        cleanInput.toLowerCase() === "harpreet" ||
        cleanInput.replace(/[^0-9]/g, "").endsWith("55678")
      ) {
        loginWorker({
          name: "Harpreet Singh",
          phone: "+91 98101 55678",
          primaryTrade: "Mason",
          dailyRate: 850,
          experienceYears: 6,
          area: `${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
          aadhaarNumber: "7829-4412-9901",
          upiId: "harpreet.mason@okaxis",
        });
        return { success: true };
      }
      return {
        success: false,
        error: `Worker account"${cleanInput}" not found. Please click Register to create your account or check your User ID / Phone.`,
      };
    }
    const savedPassword = (found.password || "123").trim();
    if (savedPassword !== password.trim()) {
      return {
        success: false,
        error: `Incorrect password for ${found.name} (${found.id}). Please check the password you entered.`,
      };
    }
    /*  Login worker profile  */ const extra = found.extraData || {};
    loginWorker({
      name: found.name,
      phone: found.phone,
      email: extra.email || (found as any).email,
      isPhoneVerified: extra.isPhoneVerified ?? true,
      isEmailVerified: extra.isEmailVerified ?? true,
      primaryTrade: extra.trade || "Mason",
      dailyRate: extra.rate || 850,
      experienceYears: extra.exp || 4,
      area:
        extra.area ||
        `${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
      aadhaarNumber: extra.aadhaar || "7829-4412-9901",
      upiId: extra.upi || `${found.id}@upi`,
    });
    return { success: true };
  };
  /*  Register Worker with Auth  */ const registerWorkerWithAuth = (data: {
    userId: string;
    password: string;
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    primaryTrade: TradeType;
    dailyRate: number;
    experienceYears: number;
    area: string;
    aadhaarNumber: string;
    upiId?: string;
  }) => {
    const rawId =
      data.userId?.trim().toLowerCase() ||
      (data.email ? data.email.split("@")[0].toLowerCase() : "") ||
      data.phone.replace(/[^0-9]/g, "").slice(-10) ||
      data.name.trim().toLowerCase().replace(/\s+/g, "_");
    const newAcc: UserAccount = {
      id: rawId,
      password: (data.password || "123").trim(),
      name: data.name.trim(),
      phone: data.phone.trim(),
      role: "worker",
      extraData: {
        trade: data.primaryTrade,
        rate: data.dailyRate,
        exp: data.experienceYears,
        area: data.area,
        aadhaar: data.aadhaarNumber,
        upi: data.upiId,
        email: data.email?.trim(),
        isPhoneVerified: data.isPhoneVerified ?? true,
        isEmailVerified: data.isEmailVerified ?? true,
      },
    };
    setWorkerAccounts((prev) => {
      const updated = [
        ...prev.filter(
          (a) =>
            a.id?.toLowerCase() !== newAcc.id &&
            (!a.phone ||
              a.phone.replace(/[^0-9]/g, "").slice(-10) !==
                newAcc.phone.replace(/[^0-9]/g, "").slice(-10)),
        ),
        newAcc,
      ];
      localStorage.setItem(
        "dihadi_worker_accounts_v8",
        JSON.stringify(updated),
      );
      return updated;
    });
    syncAccountToFirestore(newAcc);
    loginWorker({
      name: data.name,
      phone: data.phone,
      email: data.email,
      isPhoneVerified: data.isPhoneVerified ?? true,
      isEmailVerified: data.isEmailVerified ?? true,
      primaryTrade: data.primaryTrade,
      dailyRate: data.dailyRate,
      experienceYears: data.experienceYears,
      area: data.area,
      aadhaarNumber: data.aadhaarNumber,
      upiId: data.upiId,
    });
    showNotification(
      `Account created! User ID:"${newAcc.id}". You are now logged in.`,
    );
  };
  /*  Worker Login / Register helper  */ const loginWorker = (data: {
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    primaryTrade: TradeType;
    dailyRate: number;
    experienceYears: number;
    area: string;
    aadhaarNumber: string;
    upiId?: string;
  }) => {
    const maskedAadhaar = `XXXX-XXXX-${data.aadhaarNumber.slice(-4) || "1234"}`;
    const cleanPhone =
      data.phone.replace(/[^0-9]/g, "").slice(-10) || "9810155678";
    const fallbackUpi =
      data.upiId ||
      `${data.name.toLowerCase().replace(/\s+/g, ".") || "worker"}@upi`;
    /* Check if worker already exists in workers list */ const existingWorker =
      workers.find((w) => {
        const wClean = w.phone.replace(/[^0-9]/g, "").slice(-10);
        return (wClean && wClean === cleanPhone);
      });
    /* Check if verification record already exists */ const existingVerification =
      verifications.find((v) => {
        const vClean = v.phone.replace(/[^0-9]/g, "").slice(-10);
        return (vClean && vClean === cleanPhone);
      });
    const isAlreadyVerified =
      existingWorker?.isVerified || existingVerification?.status === "approved";
    const areaCoords = getCoordinatesForArea(
      data.area || currentCity?.defaultArea || "Model Town",
      currentCity?.name,
    );
    const activeWorker: WorkerProfile = {
      id: existingWorker?.id || `w-${Date.now().toString().slice(-4)}`,
      name: data.name,
      phone: data.phone,
      email:
        data.email ||
        existingWorker?.email ||
        `${data.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      isPhoneVerified:
        data.isPhoneVerified ?? existingWorker?.isPhoneVerified ?? true,
      isEmailVerified:
        data.isEmailVerified ?? existingWorker?.isEmailVerified ?? true,
      avatar:
        existingWorker?.avatar ||
        "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=150&auto=format&fit=crop&q=80",
      primaryTrade: data.primaryTrade,
      secondaryTrades: existingWorker?.secondaryTrades || [
        "Construction Helper",
      ],
      dailyRate: data.dailyRate || existingWorker?.dailyRate || 850,
      experienceYears:
        data.experienceYears || existingWorker?.experienceYears || 3,
      rating: existingWorker ? existingWorker.rating : 0,
      reviewCount: existingWorker ? existingWorker.reviewCount : 0,
      completedJobsCount: existingWorker
        ? existingWorker.completedJobsCount
        : 0,
      isOnline: true,
      location: {
        area:
          data.area ||
          existingWorker?.location.area ||
          currentCity?.defaultArea ||
          "Model Town",
        city: currentCity?.name || "Ludhiana",
        distanceKm: existingWorker?.location.distanceKm || 1.0,
      },
      gpsLocation: existingWorker?.gpsLocation || {
        lat: areaCoords.lat + (Math.random() - 0.5) * 0.01,
        lng: areaCoords.lng + (Math.random() - 0.5) * 0.01,
        area: data.area || areaCoords.area,
        city: currentCity?.name || "Ludhiana",
        accuracyMeters: 4,
        heading: 60,
        speedKmh: 0,
        lastUpdated: "Just now",
      },
      isSharingLiveGps: true,
      aadhaarNumberMasked: maskedAadhaar,
      isVerified: isAlreadyVerified,
      todayEarnings: existingWorker?.todayEarnings || 0,
      totalEarnings: existingWorker?.totalEarnings || 0,
      walletBalance: existingWorker?.walletBalance || 0,
      badge: isAlreadyVerified ? "Aadhaar Verified" : "Registered Worker",
      upiId: fallbackUpi,
      bankName: existingWorker?.bankName || "State Bank of India",
      accountNumberMasked:
        existingWorker?.accountNumberMasked ||
        `•••• •••• ${cleanPhone.slice(-4)}`,
      ifscCode: existingWorker?.ifscCode || "SBIN0004921",
    };
    setCurrentWorker(activeWorker);
    setWorkers((prev) => [
      activeWorker,
      ...prev.filter((w) => {
        const wClean = w.phone.replace(/[^0-9]/g, "").slice(-10);
        return !(wClean && wClean === cleanPhone);
      }),
    ]);
    /*  Handle Admin Verification queue  */ if (!existingVerification) {
      const newVerification: VerificationRequest = {
        id: `v-${Date.now().toString().slice(-4)}`,
        workerName: data.name,
        trade: data.primaryTrade,
        phone: data.phone,
        aadhaarNumber: data.aadhaarNumber || "7829-4412-9901",
        experienceYears: data.experienceYears || 3,
        submittedAt: "Just now",
        status: isAlreadyVerified ? "approved" : "pending",
      };
      setVerifications((prev) => [newVerification, ...prev]);
      syncVerificationToFirestore(newVerification);
    }
    syncWorkerToFirestore(activeWorker);
    playSound("success");
    showNotification(`Welcome ${data.name}! Worker Portal Active.`);
  };
  const logoutWorker = () => {
    setCurrentWorker(null);
    playSound("click");
    showNotification("Worker logged out.");
  };
  /*  Update Worker UPI handle  */ const updateWorkerUpi = (
    upiId: string,
    bankName?: string,
    ifscCode?: string,
  ) => {
    if (!currentWorker) return;
    const updated: WorkerProfile = {
      ...currentWorker,
      upiId: upiId.trim(),
      bankName: bankName || currentWorker.bankName,
      ifscCode: ifscCode || currentWorker.ifscCode,
    };
    setCurrentWorker(updated);
    setWorkers((prev) =>
      prev.map((w) => (w.id === currentWorker.id ? updated : w)),
    );
    syncWorkerToFirestore(updated);
    playSound("success");
    showNotification(`Worker UPI updated to: ${upiId}`);
  };
  /*  Update Worker GPS location  */ const updateWorkerGps = (
    coords: Partial<GpsCoordinates>,
  ) => {
    if (!currentWorker) return;
    let resolvedCity =
      coords.city ||
      currentWorker.gpsLocation?.city ||
      currentWorker.location?.city ||
      currentCity.name;
    let resolvedArea =
      coords.area ||
      currentWorker.gpsLocation?.area ||
      currentWorker.location?.area ||
      currentCity.defaultArea;
    if (coords.lat && coords.lng) {
      const detectedCity = detectCityFromCoords(coords.lat, coords.lng);
      if (
        !coords.city ||
        (resolvedCity.toLowerCase().includes("delhi") &&
          detectedCity.id === "ludhiana")
      ) {
        resolvedCity = detectedCity.name;
        if (!coords.area || resolvedArea.toLowerCase().includes("okhla")) {
          resolvedArea = detectedCity.defaultArea;
        }
      }
    }
    const updatedGps: GpsCoordinates = {
      ...currentWorker.gpsLocation,
      ...coords,
      city: resolvedCity,
      area: resolvedArea,
      lastUpdated: "Just now",
    };
    const updated: WorkerProfile = {
      ...currentWorker,
      location: {
        ...currentWorker.location,
        area: resolvedArea,
        city: resolvedCity,
      },
      gpsLocation: updatedGps,
    };
    setCurrentWorker(updated);
    setWorkers((prev) =>
      prev.map((w) => (w.id === currentWorker.id ? updated : w)),
    );
    syncWorkerToFirestore(updated);
  };
  /*  Toggle online/offline for current worker  */ const toggleWorkerStatus =
    () => {
      if (!currentWorker) return;
      const nextState = !currentWorker.isOnline;
      const updated = { ...currentWorker, isOnline: nextState };
      setCurrentWorker(updated);
      setWorkers((prev) =>
        prev.map((w) => (w.id === currentWorker.id ? updated : w)),
      );
      syncWorkerToFirestore(updated);
      playSound("click");
      if (nextState) {
        showNotification(`${currentWorker.name} is ONLINE.`);
      } else {
        showNotification(`${currentWorker.name} is OFFLINE.`);
      }
    };
  /*  Update Worker Profile Photo / Avatar  */ const updateWorkerAvatar = (
    avatarUrl: string,
  ) => {
    if (!currentWorker) return;
    const updated: WorkerProfile = { ...currentWorker, avatar: avatarUrl };
    setCurrentWorker(updated);
    setWorkers((prev) =>
      prev.map((w) => (w.id === currentWorker.id ? updated : w)),
    );
    syncWorkerToFirestore(updated);
    playSound("success");
    showNotification("Worker profile photo updated successfully.");
  };
  /*  Update arbitrary Worker Profile properties  */ const updateWorkerProfile =
    (updates: Partial<WorkerProfile>) => {
      if (!currentWorker) return;
      const updated: WorkerProfile = { ...currentWorker, ...updates };
      setCurrentWorker(updated);
      setWorkers((prev) =>
        prev.map((w) => (w.id === currentWorker.id ? updated : w)),
      );
      syncWorkerToFirestore(updated);
      playSound("success");
    };
  /*  Customer Login with Auth (ID & Password)  */ const loginCustomerWithAuth =
    (
      userIdOrPhone: string,
      password: string,
    ): { success: boolean; error?: string } => {
      const cleanInput = userIdOrPhone.trim();
      if (!cleanInput) {
        return {
          success: false,
          error: "Please enter your User ID, Mobile number, or Email.",
        };
      }
      const found = findAccountMatch(customerAccounts, cleanInput);
      if (!found) {
        if (
          cleanInput.toLowerCase() === "bhavnoor" ||
          cleanInput.replace(/[^0-9]/g, "").endsWith("88221")
        ) {
          loginCustomer({
            name: "Dummy Customer",
            phone: "+91 00000 00000",
            area: currentCity?.defaultArea || "Model Town",
            address: `House 142, ${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}, ${currentCity?.state || "Punjab"}`,
            upiId: "bhavnoor.verma@okhdfcbank",
          });
          return { success: true };
        }
        return {
          success: false,
          error: `Customer account"${cleanInput}" not found. Please click Register to create your account or check your User ID / Phone.`,
        };
      }
      const savedPassword = (found.password || "123").trim();
      if (savedPassword !== password.trim()) {
        return {
          success: false,
          error: `Incorrect password for ${found.name} (${found.id}). Please check the password you entered.`,
        };
      }
      const extra = found.extraData || {};
      loginCustomer({
        name: found.name,
        phone: found.phone,
        email: extra.email || (found as any).email,
        isPhoneVerified: extra.isPhoneVerified ?? true,
        isEmailVerified: extra.isEmailVerified ?? true,
        area: extra.area || currentCity?.defaultArea || "Model Town",
        address:
          extra.address ||
          `${extra.area || currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
        upiId: extra.upi || `${found.id}@upi`,
      });
      return { success: true };
    };
  /*  Register Customer with Auth  */ const registerCustomerWithAuth = (data: {
    userId: string;
    password: string;
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    area: string;
    address: string;
    upiId?: string;
  }) => {
    const rawId =
      data.userId?.trim().toLowerCase() ||
      (data.email ? data.email.split("@")[0].toLowerCase() : "") ||
      data.phone.replace(/[^0-9]/g, "").slice(-10) ||
      data.name.trim().toLowerCase().replace(/\s+/g, "_");
    const newAcc: UserAccount = {
      id: rawId,
      password: (data.password || "123").trim(),
      name: data.name.trim(),
      phone: data.phone.trim(),
      role: "customer",
      extraData: {
        area: data.area,
        address: data.address,
        upi: data.upiId,
        email: data.email?.trim(),
        isPhoneVerified: data.isPhoneVerified ?? true,
        isEmailVerified: data.isEmailVerified ?? true,
      },
    };
    setCustomerAccounts((prev) => {
      const updated = [
        ...prev.filter(
          (a) =>
            a.id?.toLowerCase() !== newAcc.id &&
            (!a.phone ||
              a.phone.replace(/[^0-9]/g, "").slice(-10) !==
                newAcc.phone.replace(/[^0-9]/g, "").slice(-10)),
        ),
        newAcc,
      ];
      localStorage.setItem(
        "dihadi_customer_accounts_v8",
        JSON.stringify(updated),
      );
      return updated;
    });
    syncAccountToFirestore(newAcc);
    loginCustomer({
      name: data.name,
      phone: data.phone,
      email: data.email,
      isPhoneVerified: data.isPhoneVerified ?? true,
      isEmailVerified: data.isEmailVerified ?? true,
      area: data.area,
      address: data.address,
      upiId: data.upiId,
    });
    showNotification(
      `Account created! User ID:"${newAcc.id}". Employer Portal active.`,
    );
  };
  /*  Customer Login / Register helper  */ const loginCustomer = (data: {
    name: string;
    phone: string;
    email?: string;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
    area: string;
    address: string;
    upiId?: string;
  }) => {
    const areaCoords = getCoordinatesForArea(
      data.area || data.address || currentCity?.defaultArea || "Model Town",
      currentCity?.name,
    );
    const customer: CustomerProfile = {
      id: `c-${Date.now().toString().slice(-4)}`,
      name: data.name,
      phone: data.phone,
      email:
        data.email ||
        `${data.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      isPhoneVerified: data.isPhoneVerified ?? true,
      isEmailVerified: data.isEmailVerified ?? true,
      area: data.area || currentCity?.defaultArea || "Model Town",
      city: currentCity?.name || "Ludhiana",
      address:
        data.address ||
        `${data.area || currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
      gpsLocation: {
        lat: areaCoords.lat,
        lng: areaCoords.lng,
        area: data.area || areaCoords.area,
        city: currentCity?.name || "Ludhiana",
        address: data.address,
        accuracyMeters: 4,
        lastUpdated: "Just now",
      },
      upiId:
        data.upiId ||
        `${data.name.toLowerCase().replace(/\s+/g, ".")}@okhdfcbank`,
    };
    setCurrentCustomer(customer);
    playSound("success");
    showNotification(`Welcome ${data.name}! Employer Portal Active.`);
    /*  Automatically display Safety & Accountability Guarantee Modal on customer login  */ setTimeout(
      () => {
        openProtectionModal({
          variant: "post_login",
          workerName: "Verified Kaamzo Worker",
          workerAadhaarMasked: "Govt. Aadhaar Verified",
        });
      },
      600,
    );
  };
  const logoutCustomer = () => {
    setCurrentCustomer(null);
    playSound("click");
    showNotification("Employer logged out.");
  };
  const updateCustomerGps = (coords: Partial<GpsCoordinates>) => {
    if (!currentCustomer) return;
    const updated: CustomerProfile = {
      ...currentCustomer,
      gpsLocation: {
        ...currentCustomer.gpsLocation,
        ...coords,
        lastUpdated: "Just now",
      },
    };
    setCurrentCustomer(updated);
  };
  const refreshCustomerGpsLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateCustomerGps({
            lat: +pos.coords.latitude.toFixed(4),
            lng: +pos.coords.longitude.toFixed(4),
            accuracyMeters: Math.round(pos.coords.accuracy) || 4,
            lastUpdated: "Just now",
          });
          playSound("gps_ping");
          showNotification(
            "Employer GPS calibrated with live device coordinates!",
          );
        },
        () => {
          if (currentCustomer) {
            const coords = getCoordinatesForArea(currentCustomer.area);
            updateCustomerGps({
              lat: coords.lat,
              lng: coords.lng,
              accuracyMeters: 4,
              lastUpdated: "Just now",
            });
          }
          playSound("gps_ping");
          showNotification("GPS calibrated to local area coordinates.");
        },
        { enableHighAccuracy: true, timeout: 4000 },
      );
    }
  };
  /*  Admin Login with Auth  */ const loginAdminWithAuth = (
    adminIdOrEmail: string,
    password: string,
  ): { success: boolean; error?: string } => {
    const clean = adminIdOrEmail.trim().toLowerCase();

    // Strict Gmail Verification for Admin Access
    if (clean.includes("@gmail.com")) {
      const isAllowed =
        clean === "bhavnoorsinghkochar@gmail.com" ||
        clean === "bhavnoorsinghkochar@gmail.com";
      if (!isAllowed) {
        return {
          success: false,
          error:
            "Access Denied: Only bhavnoorsinghkochar@gmail.com is authorized to access the Admin Platform. No other Gmail account has admin privileges.",
        };
      }
      loginAdmin({
        name: "Dummy Customer Kochar",
        email: clean,
      });
      return { success: true };
    }

    if (
      clean === "admin" ||
      clean === "ops@dihadi.co" ||
      clean === "admin@dihadi.co" ||
      clean.includes("ops")
    ) {
      if (
        password &&
        password !== "admin" &&
        password !== "admin123" &&
        password !== "123"
      ) {
        return { success: false, error: "Incorrect Admin password." };
      }
      loginAdmin({ name: "Dihadi Operations Admin", email: "ops@dihadi.co" });
      return { success: true };
    }

    // Reject any other unauthorized email
    return {
      success: false,
      error:
        "Access Denied: Only bhavnoorsinghkochar@gmail.com is authorized to access the Admin Platform.",
    };
  };
  /*  Admin Login helper  */ const loginAdmin = (data: {
    name: string;
    email: string;
  }) => {
    const cleanEmail = (data.email || "").toLowerCase().trim();
    const isBhavnoor =
      cleanEmail === "bhavnoorsinghkochar@gmail.com" ||
      cleanEmail === "bhavnoorsinghkochar@gmail.com";

    const admin: AdminProfile = {
      id: `adm-${Date.now().toString().slice(-4)}`,
      name: isBhavnoor
        ? data.name || "Dummy Customer Kochar"
        : data.name || "Dihadi Operations Admin",
      email: data.email || "bhavnoorsinghkochar@gmail.com",
      role: isBhavnoor ? "Super Admin / Platform Owner" : "Operations Lead",
    };
    setCurrentAdmin(admin);
    playSound("success");
    showNotification("Admin logged in to Operations Dashboard.");
  };
  const logoutAdmin = () => {
    setCurrentAdmin(null);
    playSound("click");
    showNotification("Admin logged out.");
  };

  /* =========================================================================
     Single Sign-On (SSO) with Google Auth Provider
     ========================================================================= */
  const signInWithGoogleSSO = async (
    preferredRole?: "worker" | "customer" | "admin",
  ): Promise<{
    success: boolean;
    user?: any;
    isNewUser?: boolean;
    error?: string;
  }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || `${user.uid}@gmail.com`;
      const name = user.displayName || email.split("@")[0] || "Kaamzo User";
      const photoURL = user.photoURL || undefined;

      const googleUserPayload = {
        displayName: name,
        email: email,
        photoURL: photoURL,
        uid: user.uid,
      };
      setSsoGoogleUser(googleUserPayload);

      // 1. If explicit role requested:
      if (preferredRole === "worker") {
        const found = workerAccounts.find(
          (a) =>
            a.id.toLowerCase() === email.toLowerCase() ||
            (user.email && a.id.toLowerCase() === user.email.toLowerCase()),
        );
        if (found) {
          loginWorkerWithAuth(found.id, found.password || "google_sso_123");
        } else {
          const tempPass = "google_sso_123";
          registerWorkerWithAuth({
            userId: email,
            password: tempPass,
            name: name,
            phone: user.phoneNumber || "+91 98101 55678",
            email: email,
            isEmailVerified: true,
            primaryTrade: "Mason",
            dailyRate: 850,
            experienceYears: 4,
            area: currentCity?.defaultArea || "Model Town",
            aadhaarNumber: "7829-4412-9901",
            upiId: `${email.split("@")[0]}@okaxis`,
          });
          loginWorkerWithAuth(email, tempPass);
        }
        if (photoURL) {
          updateWorkerAvatar(photoURL);
        }
        setCurrentRole("worker");
        playSound("success");
        return { success: true, user: googleUserPayload, isNewUser: !found };
      }

      if (preferredRole === "customer") {
        const found = customerAccounts.find(
          (a) =>
            a.id.toLowerCase() === email.toLowerCase() ||
            (user.email && a.id.toLowerCase() === user.email.toLowerCase()),
        );
        if (found) {
          loginCustomerWithAuth(found.id, found.password || "google_sso_123");
        } else {
          const tempPass = "google_sso_123";
          registerCustomerWithAuth({
            userId: email,
            password: tempPass,
            name: name,
            phone: user.phoneNumber || "+91 00000 00000",
            email: email,
            isEmailVerified: true,
            area: currentCity?.defaultArea || "Model Town",
            address: `House 142, ${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
            upiId: `${email.split("@")[0]}@okhdfcbank`,
          });
          loginCustomerWithAuth(email, tempPass);
        }
        setCurrentRole("customer");
        playSound("success");
        return { success: true, user: googleUserPayload, isNewUser: !found };
      }

      if (preferredRole === "admin") {
        const cleanEmail = email.trim().toLowerCase();
        const isAuthorizedAdmin =
          cleanEmail === "bhavnoorsinghkochar@gmail.com" ||
          cleanEmail === "bhavnoorsinghkochar@gmail.com" ||
          cleanEmail === "ops@dihadi.co" ||
          cleanEmail === "admin@dihadi.co";

        if (!isAuthorizedAdmin) {
          return {
            success: false,
            error: `Access Denied: Only bhavnoorsinghkochar@gmail.com is authorized to access the Admin Platform. (${email} is not authorized).`,
          };
        }

        loginAdmin({
          name: name || "Dummy Customer Kochar",
          email: email,
        });
        setCurrentRole("admin");
        playSound("success");
        return { success: true, user: googleUserPayload };
      }

      // 2. Auto-detect from role selector without pre-selection
      const foundWorker = workerAccounts.find(
        (a) =>
          a.id.toLowerCase() === email.toLowerCase() ||
          (user.email && a.id.toLowerCase() === user.email.toLowerCase()),
      );
      const foundCustomer = customerAccounts.find(
        (a) =>
          a.id.toLowerCase() === email.toLowerCase() ||
          (user.email && a.id.toLowerCase() === user.email.toLowerCase()),
      );

      if (foundWorker && !foundCustomer) {
        loginWorkerWithAuth(
          foundWorker.id,
          foundWorker.password || "google_sso_123",
        );
        if (photoURL) updateWorkerAvatar(photoURL);
        setCurrentRole("worker");
        playSound("success");
        return { success: true, user: googleUserPayload, isNewUser: false };
      }

      if (foundCustomer && !foundWorker) {
        loginCustomerWithAuth(
          foundCustomer.id,
          foundCustomer.password || "google_sso_123",
        );
        setCurrentRole("customer");
        playSound("success");
        return { success: true, user: googleUserPayload, isNewUser: false };
      }

      // If user hasn't chosen role yet or both exist, prompt with SSO Role Selection modal
      setIsSSORoleModalOpen(true);
      return { success: true, user: googleUserPayload, isNewUser: true };
    } catch (err: any) {
      if (
        err?.code === "auth/cancelled-popup-request" ||
        err?.code === "auth/popup-closed-by-user"
      ) {
        console.warn("User cancelled the Google popup sign-in.");
        return { success: false, error: "Popup closed by user." };
      }
      if (err?.code === "auth/unauthorized-domain") {
        const domain = typeof window !== "undefined" ? window.location.hostname : "your Vercel domain";
        const msg = `Unauthorized Domain (${domain}). To fix: In Firebase Console -> Authentication -> Settings -> Authorized domains, add "${domain}".`;
        console.warn("Google SSO Unauthorized Domain:", msg);
        return { success: false, error: msg };
      }
      console.error("Google SSO Login Error:", err);
      return {
        success: false,
        error: err?.message || "Failed to sign in with Google SSO.",
      };
    }
  };

  /* Employer posts a job */ const postJob = (jobData: {
    title: string;
    trade: TradeType;
    description: string;
    customerName: string;
    customerPhone: string;
    locationAddress: string;
    area: string;
    dailyWage: number;
    durationDays: number;
    startDate?: string;
    endDate?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
    hoursPerDay?: number;
    hourlyRate?: number;
    baseLabor?: number;
  }) => {
    const daily = Number(jobData.dailyWage) || 850;
    const days = Number(jobData.durationDays) || 1;
    const baseLabor =
      jobData.baseLabor !== undefined ? jobData.baseLabor : daily * days;
    const platformFee = Math.round(baseLabor * 0.2);
    const totalGross = baseLabor + platformFee;
    const workerPayout = baseLabor; // Worker receives 100% of base labor rate
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const areaCoords = getCoordinatesForArea(
      jobData.area ||
        jobData.locationAddress ||
        currentCity?.defaultArea ||
        "Model Town",
      currentCity?.name,
    );
    const resolvedCity =
      currentCustomer?.city || currentCity?.name || "Ludhiana";
    const custGps = currentCustomer?.gpsLocation;
    const jobLat =
      custGps && custGps.lat && (!custGps.city || custGps.city === resolvedCity)
        ? custGps.lat
        : areaCoords.lat;
    const jobLng =
      custGps && custGps.lng && (!custGps.city || custGps.city === resolvedCity)
        ? custGps.lng
        : areaCoords.lng;
    /* Calculate realistic distance */ const workerGps =
      currentWorker?.gpsLocation || {
        lat: currentCity?.lat || 30.8926,
        lng: currentCity?.lng || 75.8415,
        city: currentCity?.name || "Ludhiana",
      };
    let calculatedDist = calculateDistanceKm(
      workerGps.lat,
      workerGps.lng,
      jobLat,
      jobLng,
    );
    if (
      calculatedDist > 25.0 &&
      (workerGps.city === resolvedCity || !workerGps.city)
    ) {
      /* Re-center around worker */
      calculatedDist = +(0.8 + Math.random() * 2.5).toFixed(1);
    }
    const newJob: Job = {
      id: `job-${Date.now().toString().slice(-4)}`,
      title: jobData.title,
      trade: jobData.trade,
      description: jobData.description,
      customerName: jobData.customerName,
      customerPhone: jobData.customerPhone,
      locationAddress: jobData.locationAddress,
      area: jobData.area || areaCoords.area,
      distanceKm: Math.max(0.4, calculatedDist),
      jobGps: {
        lat: jobLat,
        lng: jobLng,
        area: jobData.area || areaCoords.area,
        city: resolvedCity,
        address: jobData.locationAddress,
        accuracyMeters: 4,
        lastUpdated: "Just now",
      },
      dailyWage: Math.round(totalGross / days),
      durationDays: days,
      startDate: jobData.startDate,
      endDate: jobData.endDate,
      shiftStartTime: jobData.shiftStartTime,
      shiftEndTime: jobData.shiftEndTime,
      hoursPerDay: jobData.hoursPerDay,
      hourlyRate: jobData.hourlyRate,
      baseLabor: jobData.baseLabor,
      status: "broadcast",
      otpCode,
      postedAt: "Just now",
      platformFee,
      workerPayout,
      isPaid: false,
      isEscrowPrepaid: false,
      escrowPrepaidAmount: totalGross,
      escrowStatus: "pending",
      escrowPrepaidAt: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);
    syncJobToFirestore(newJob);
    playSound("incoming_job"); /* === AUTOMATED JOB MATCHING ENGINE === */
    const matchResult = matchJobWithWorkers(newJob);
    const topMatches = matchResult.matches;
    setLatestMatchedJob(newJob);
    setLatestTop5Matches(topMatches);
    if (topMatches.length > 0) {
      const topPick = topMatches[0];
      showNotification(
        "🎯 Top 5 Matches Suggested!",
        `Matched ${topMatches.length} verified ${newJob.trade}s nearby. Top pick: ${topPick.worker.name} (${topPick.matchScore}% Match, ${topPick.distanceKm}km away, ${topPick.worker.rating}★)`,
      );
      /* Spoken voice assistant feedback */ speak(
        `New ${newJob.trade} job posted. Top 5 compatible workers suggested near ${newJob.area}.`,
      );
    } else {
      showNotification(`New ${newJob.trade} job broadcasted.`);
    }
    return newJob;
  };
  /* Dispatch OTP */ const dispatchJobStartOtp = async (
    job: Job,
    targetEmail?: string,
    targetPhone?: string,
  ): Promise<boolean> => {
    const email =
      targetEmail || currentCustomer?.email || "bhavnoorsinghkochar@gmail.com";
    const phone = targetPhone || currentCustomer?.phone || "+91 00000 00000";
    playSound("gps_ping");
    /* Trigger system notification */ if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification("🔑 Worker Verification Start OTP", {
          body: `Start Passcode: ${job.otpCode} for ${job.title}. Share with worker upon arrival.`,
          icon: "/icon.png",
        });
      } catch (e) {}
    }
    try {
      const res = await sendOtpToGmail({
        recipient: email,
        code: job.otpCode,
        purpose: "job_start_otp",
        jobTitle: job.title,
        trade: job.trade,
        workerName: job.assignedWorkerName || "Assigned Worker",
        customerName: job.customerName || currentCustomer?.name || "Customer",
        location: job.locationAddress || job.area,
        wage: job.dailyWage,
        role: "customer",
      });
      if (res.method === "gmail_api_oauth") {
        showNotification(
          `🔑 Start OTP #${job.otpCode} sent directly via Google Workspace to ${email}!`,
        );
      } else {
        showNotification(
          `🔑 Start OTP #${job.otpCode} dispatched to Customer Email (${email})!`,
        );
      }
      return true;
    } catch (err) {
      console.debug("OTP dispatch note:", err);
      showNotification(
        `🔑 Start OTP: ${job.otpCode} (Share with worker upon arrival)`,
      );
      return false;
    }
  };
  /* Worker accepts job */ const approveWorker = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const updated = { ...job, status: "approved" as const };
    setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    syncJobToFirestore(updated);
    /* Dispatch OTP now */ setTimeout(() => dispatchJobStartOtp(updated), 500);
    /* Auto-inject OTP into in-app chat */ if (
      updated.otpCode &&
      updated.customerPhone &&
      updated.assignedWorkerId
    ) {
      let customerId = updated.customerPhone;
      let workerId = updated.assignedWorkerId;
      let jobOtp = updated.otpCode;
      try {
        const conversationId = [customerId, workerId].sort().join("_");
        const storageKey = `dihadi_chat_v8_${conversationId}`;
        const existingRaw = localStorage.getItem(storageKey);
        const history = existingRaw ? JSON.parse(existingRaw) : [];
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          senderId: customerId,
          text: `SYSTEM: Customer approved! Your secure Start OTP is ${jobOtp}`,
          timestamp: Date.now(),
        };
        history.push(newMessage);
        localStorage.setItem(storageKey, JSON.stringify(history));
        window.dispatchEvent(
          new CustomEvent("dihadi_chat_sync", { detail: { key: storageKey } }),
        );
        window.dispatchEvent(
          new CustomEvent("dihadi_chat_message_event", {
            detail: {
              conversationId,
              senderId: customerId,
              senderName: "System",
              receiverId: workerId,
              text: newMessage.text,
              jobId: jobId,
            },
          }),
        );
      } catch (err) {
        console.warn("Could not inject OTP to chat", err);
      }
    }
    playSound("success");
    showNotification(
      "Worker Approved",
      "Worker approved! OTP automatically sent to in-app chat.",
    );
  };
  const rejectWorker = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const updated = {
            ...job,
            status: "broadcast" as const,
            assignedWorkerId: null,
            assignedWorkerName: null,
            assignedWorkerPhone: null,
          };
          syncJobToFirestore(updated);
          return updated;
        }
        return job;
      }),
    );
    playSound("alert");
    showNotification(
      "Worker Rejected",
      "Job has been re-broadcasted to other workers.",
    );
  };
  const approveAndFundEscrow = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const updated = {
      ...job,
      status: "approved" as const,
      isEscrowPrepaid: true,
      escrowStatus: "held_in_escrow" as const,
      escrowPrepaidAt: new Date().toISOString(),
    };
    setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    syncJobToFirestore(updated);
    /* Dispatch OTP now */ setTimeout(() => dispatchJobStartOtp(updated), 500);
    /* Auto-inject OTP into in-app chat */ if (
      updated.otpCode &&
      updated.customerPhone &&
      updated.assignedWorkerId
    ) {
      let customerId = updated.customerPhone;
      let workerId = updated.assignedWorkerId;
      let jobOtp = updated.otpCode;
      try {
        const conversationId = [customerId, workerId].sort().join("_");
        const storageKey = `dihadi_chat_v8_${conversationId}`;
        const existingRaw = localStorage.getItem(storageKey);
        const history = existingRaw ? JSON.parse(existingRaw) : [];
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          senderId: customerId,
          text: `SYSTEM: Customer approved & paid escrow! Your secure Start OTP is ${jobOtp}`,
          timestamp: Date.now(),
        };
        history.push(newMessage);
        localStorage.setItem(storageKey, JSON.stringify(history));
        window.dispatchEvent(
          new CustomEvent("dihadi_chat_sync", { detail: { key: storageKey } }),
        );
        window.dispatchEvent(
          new CustomEvent("dihadi_chat_message_event", {
            detail: {
              conversationId,
              senderId: customerId,
              senderName: "System",
              receiverId: workerId,
              text: newMessage.text,
              jobId: jobId,
            },
          }),
        );
      } catch (err) {
        console.warn("Could not inject OTP to chat", err);
      }
    }
    playSound("success");
    showNotification(
      "Worker Approved & Escrow Funded",
      "Worker approved! OTP automatically sent to in-app chat.",
    );
  };
  const acceptJobByWorker = (jobId: string, workerToAssign?: WorkerProfile) => {
    const worker = workerToAssign || currentWorker;
    if (!worker) {
      showNotification(
        "Please select or log in as a worker to accept this job.",
      );
      return;
    }
    const targetJob = jobs.find((j) => j.id === jobId);
    if (targetJob) {
      const wLat = worker.gpsLocation?.lat || 30.8926;
      const wLng = worker.gpsLocation?.lng || 75.8415;
      const jLat = targetJob.jobGps?.lat || wLat;
      const jLng = targetJob.jobGps?.lng || wLng;
      const dist = calculateDistanceKm(wLat, wLng, jLat, jLng);
      if (dist > 30.0 && targetJob.jobGps?.city !== worker.gpsLocation?.city) {
        playSound("alert");
        showNotification(
          `Notice: Job is ${dist} km away in ${targetJob.jobGps?.city || "another area"}.`,
        );
      }
    }
    let updatedAcceptedJob: Job | null = null;
    const isGoldCustomer = Boolean(
      (currentCustomer && currentCustomer.isPremiumCustomer) ||
      (targetJob?.customerPhone &&
        customerAccounts.some(
          (c) =>
            c.phone === targetJob.customerPhone &&
            c.extraData?.isPremiumCustomer,
        )),
    );
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const updated = {
            ...job,
            status: "accepted" as const,
            assignedWorkerId: worker.id,
            assignedWorkerName: worker.name,
            assignedWorkerPhone: worker.phone,
            assignedWorkerTrade: worker.primaryTrade,
            assignedWorkerUpi: worker.upiId,
            adminFundedPayout: isGoldCustomer ? true : job.adminFundedPayout,
            zeroCommissionApplied: isGoldCustomer
              ? true
              : job.zeroCommissionApplied,
          };
          updatedAcceptedJob = updated;
          return updated;
        }
        return job;
      }),
    );
    if (updatedAcceptedJob) {
      syncJobToFirestore(updatedAcceptedJob);
    }
    /* If customer has Gold Membership, auto-disburse worker wage to worker wallet */ if (
      isGoldCustomer &&
      targetJob
    ) {
      const wage = (targetJob.dailyWage || 850) * (targetJob.durationDays || 1);
      disburseWorkerWageFromAdmin(
        worker.id,
        wage,
        targetJob.id,
        targetJob.customerName,
      );
    }
    playSound("success");
    showNotification(
      `Your job has been accepted by ${worker.name}. Do you want to approve or reject this worker?`,
    );
  };
  /* Worker starts work */ const startJobWithOtp = (
    jobId: string,
    inputOtp: string,
  ): boolean => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return false;
    if (targetJob.otpCode === inputOtp.trim()) {
      const updated = {
        ...targetJob,
        status: "in_progress" as const,
        escrowStatus: "released_to_worker" as const,
      };

      const fullGross =
        (targetJob.dailyWage || 850) * (targetJob.durationDays || 1);
      const workerId = targetJob.assignedWorkerId;
      const workerName = targetJob.assignedWorkerName;
      const workerPhone = targetJob.assignedWorkerPhone;

      // Find worker profile from workers state or current logged-in worker
      const targetWorker =
        workers.find(
          (w) =>
            (workerId && w.id === workerId) ||
            (workerPhone && w.phone === workerPhone) ||
            (workerName &&
              w.name.trim().toLowerCase() === workerName.trim().toLowerCase()),
        ) ||
        (currentWorker &&
        (currentWorker.id === workerId ||
          currentWorker.name === workerName ||
          currentWorker.phone === workerPhone)
          ? currentWorker
          : null);

      let payoutAmount = targetJob.workerPayout || Math.round(fullGross * 0.8);
      if (targetWorker) {
        if (
          (targetWorker.zeroCommissionJobsRemaining || 0) > 0 ||
          targetWorker.isPremiumWorker
        ) {
          payoutAmount = fullGross;
        }

        const updatedWorker: WorkerProfile = {
          ...targetWorker,
          walletBalance: (targetWorker.walletBalance || 0) + payoutAmount,
          todayEarnings: (targetWorker.todayEarnings || 0) + payoutAmount,
          totalEarnings: (targetWorker.totalEarnings || 0) + payoutAmount,
        };

        setWorkers((prev) =>
          prev.map((w) =>
            w.id === updatedWorker.id ||
            (workerPhone && w.phone === workerPhone) ||
            w.name.trim().toLowerCase() ===
              updatedWorker.name.trim().toLowerCase()
              ? updatedWorker
              : w,
          ),
        );
        syncWorkerToFirestore(updatedWorker);

        if (
          currentWorker &&
          (currentWorker.id === updatedWorker.id ||
            currentWorker.name.trim().toLowerCase() ===
              updatedWorker.name.trim().toLowerCase() ||
            currentWorker.phone === updatedWorker.phone)
        ) {
          setCurrentWorker(updatedWorker);
        }
      } else if (currentWorker) {
        const updatedWorker: WorkerProfile = {
          ...currentWorker,
          walletBalance: (currentWorker.walletBalance || 0) + payoutAmount,
          todayEarnings: (currentWorker.todayEarnings || 0) + payoutAmount,
          totalEarnings: (currentWorker.totalEarnings || 0) + payoutAmount,
        };
        setCurrentWorker(updatedWorker);
        setWorkers((prev) =>
          prev.map((w) => (w.id === updatedWorker.id ? updatedWorker : w)),
        );
        syncWorkerToFirestore(updatedWorker);
      }

      // Also update workerAccounts list
      setWorkerAccounts((prev) =>
        prev.map((w) => {
          if (
            (workerId && w.id === workerId) ||
            (workerPhone && w.phone === workerPhone) ||
            (workerName &&
              w.name.trim().toLowerCase() === workerName.trim().toLowerCase())
          ) {
            return {
              ...w,
              walletBalance: ((w as any).walletBalance || 0) + payoutAmount,
              todayEarnings: ((w as any).todayEarnings || 0) + payoutAmount,
              totalEarnings: ((w as any).totalEarnings || 0) + payoutAmount,
            };
          }
          return w;
        }),
      );

      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
      syncJobToFirestore(updated);
      playSound("cash");
      showNotification(
        `✓ Start OTP Verified! Prepaid wage of ₹${payoutAmount} transferred to worker wallet immediately.`,
      );
      return true;
    } else {
      playSound("alert");
      showNotification("Invalid OTP. Please check with employer.");
      return false;
    }
  };
  /* Worker marks job finished */ const completeJobByWorker = (
    jobId: string,
  ) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    const updated = targetJob
      ? { ...targetJob, status: "completed_pending_payment" as const }
      : null;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? updated || { ...j, status: "completed_pending_payment" }
          : j,
      ),
    );
    if (updated) {
      syncJobToFirestore(updated);
    }
    playSound("success");
    showNotification("Job marked completed. Awaiting customer rating.");
  };

  /* Customer releases payment */ const releasePaymentByCustomer = (
    jobId: string,
    rating: number,
    review: string,
    paidVia: "UPI_QR" | "UPI_DIRECT" | "ESCROW_WALLET" | "CASH" = "UPI_QR",
    txnRef?: string,
    tags?: string[],
  ) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    // Prepaid funds were already credited to worker wallet immediately upon OTP verification.

    const updatedJob: Job = {
      ...job,
      status: "paid_and_closed",
      isPaid: true,
      rating: rating,
      review: review,
      customerRating: rating,
      customerReview: review,
      ratingTags: tags || ["⚡ Punctual & On-Time", "🛠️ Expert Craftsmanship"],
      ratedAt: new Date().toISOString(),
      paidVia: paidVia,
      transactionRef: txnRef || `UPI-DIHADI-${Date.now().toString().slice(-6)}`,
    };

    setJobs((prev) => prev.map((j) => (j.id === jobId ? updatedJob : j)));
    syncJobToFirestore(updatedJob);

    /* Update worker average rating */
    const targetWorker = workers.find(
      (w) => w.id === job.assignedWorkerId || w.name === job.assignedWorkerName,
    );
    if (targetWorker) {
      const prevReviews = targetWorker.reviewCount || 0;
      const newCount = prevReviews + 1;
      const newRating =
        prevReviews === 0
          ? rating
          : Number(
              (
                ((targetWorker.rating || rating) * prevReviews + rating) /
                newCount
              ).toFixed(1),
            );

      const updatedWorker: WorkerProfile = {
        ...targetWorker,
        reviewCount: newCount,
        rating: Math.min(5.0, Math.max(1.0, newRating)),
        completedJobsCount: (targetWorker.completedJobsCount || 0) + 1,
      };

      setWorkers((prev) =>
        prev.map((w) =>
          w.id === updatedWorker.id || w.name === updatedWorker.name
            ? updatedWorker
            : w,
        ),
      );
      syncWorkerToFirestore(updatedWorker);
      setWorkerAccounts((prev) =>
        prev.map((w) => {
          if (w.id === updatedWorker.id || w.phone === updatedWorker.phone) {
            return {
              ...w,
              extraData: {
                ...w.extraData,
                rating: updatedWorker.rating,
                reviewCount: updatedWorker.reviewCount,
                completedJobsCount: updatedWorker.completedJobsCount,
              },
            };
          }
          return w;
        }),
      );
      syncWorkerToFirestore(updatedWorker);
      if (
        currentWorker &&
        (currentWorker.id === targetWorker.id ||
          currentWorker.name === targetWorker.name)
      ) {
        setCurrentWorker(updatedWorker);
      }
    }

    playSound("success");
    showNotification(
      `Job finalized & rated ${rating}★ for ${job.assignedWorkerName || "Worker"}!`,
    );
  };
  /* Rate or update review */ const rateWorkerJob = (
    jobId: string,
    rating: number,
    review: string,
    tags?: string[],
  ) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const updatedJob: Job = {
      ...job,
      rating: rating,
      review: review,
      customerRating: rating,
      customerReview: review,
      ratingTags: tags || job.ratingTags,
      ratedAt: new Date().toISOString(),
    };
    setJobs((prev) => prev.map((j) => (j.id === jobId ? updatedJob : j)));
    syncJobToFirestore(updatedJob);
    if (job.assignedWorkerId) {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id === job.assignedWorkerId) {
            const count = w.reviewCount || 0;
            const isNewRating = job.rating === undefined;
            let newCount = count;
            let updatedRating = w.rating;
            if (isNewRating) {
              newCount = count + 1;
              updatedRating =
                count === 0
                  ? rating
                  : Number(((w.rating * count + rating) / newCount).toFixed(1));
            } else {
              const safeCount = Math.max(1, count);
              updatedRating = Number(
                (
                  (w.rating * safeCount - (job.rating || 5.0) + rating) /
                  safeCount
                ).toFixed(1),
              );
            }
            const updatedW: WorkerProfile = {
              ...w,
              rating: Math.min(5.0, Math.max(1.0, updatedRating)),
              reviewCount: newCount,
            };
            syncWorkerToFirestore(updatedW);
            /* Sync state */ if (
              currentWorker &&
              currentWorker.id === updatedW.id
            ) {
              setCurrentWorker(updatedW);
            }
            return updatedW;
          }
          return w;
        }),
      );
    }
    playSound("success");
    showNotification(`Rating of ${rating}★ recorded successfully!`);
  };
  /* Top-up worker wallet */ const topUpWorkerWallet = (amount: number) => {
    if (!currentWorker) return;
    const updated: WorkerProfile = {
      ...currentWorker,
      walletBalance: (currentWorker.walletBalance || 0) + amount,
    };
    setCurrentWorker(updated);
    setWorkers((prev) =>
      prev.map((w) => (w.id === currentWorker.id ? updated : w)),
    );
    syncWorkerToFirestore(updated);
    playSound("cash");
    showNotification(
      `₹${amount} added to wallet balance! New balance: ₹${updated.walletBalance}`,
    );
  };
  /* Disburse Worker Wage */ const disburseWorkerWageFromAdmin = (
    workerId: string,
    wage: number,
    jobId?: string,
    customerName?: string,
  ): boolean => {
    const target = workers.find((w) => w.id === workerId);
    if (!target) return false;
    /* Deduct wage */ setAdminTreasuryBalance((prev) => {
      const next = Math.max(0, prev - wage);
      localStorage.setItem("dihadi_admin_treasury_v8", String(next));
      return next;
    });
    /* Increase total disbursed */ setAdminWorkerPayoutsDisbursed((prev) => {
      const next = prev + wage;
      localStorage.setItem("dihadi_admin_disbursed_v8", String(next));
      return next;
    });
    /* Record detailed admin */ const newTx: AdminTransaction = {
      id: `tx-payout-${Date.now()}`,
      type: "WORKER_PAYOUT_DISBURSEMENT",
      amount: wage,
      description: `Admin Treasury Auto-Disbursed ₹${wage} to ${target.name} (Hired by Gold Customer ${customerName || "Gold Member"})`,
      timestamp: "Just now",
      customerName: customerName || "Gold Member",
      workerName: target.name,
      jobId: jobId,
    };
    setAdminTransactions((prev) => {
      const updated = [newTx, ...prev];
      localStorage.setItem("dihadi_admin_txs_v8", JSON.stringify(updated));
      return updated;
    });
    /* Directly credit wallet */ const updatedWorker: WorkerProfile = {
      ...target,
      walletBalance: (target.walletBalance || 0) + wage,
      todayEarnings: (target.todayEarnings || 0) + wage,
      totalEarnings: (target.totalEarnings || 0) + wage,
    };
    setWorkers((prev) =>
      prev.map((w) => (w.id === target.id ? updatedWorker : w)),
    );
    syncWorkerToFirestore(updatedWorker);
    if (currentWorker && currentWorker.id === target.id) {
      setCurrentWorker(updatedWorker);
    }
    playSound("cash");
    showNotification(
      `💰 Admin Auto-Payout: ₹${wage} transferred directly into ${target.name}'s wallet!`,
    );
    return true;
  };
  /* Worker purchases VIP Pass & Aadhaar Verification */ const subscribeWorkerPremium =
    (
      workerId: string,
      paymentMethod: "WALLET" | "UPI" = "WALLET",
    ): { success: boolean; message: string } => {
      const target = workers.find((w) => w.id === workerId) || currentWorker;
      if (!target) {
        return { success: false, message: "Worker profile not found." };
      }
      const PRICE = 2000;
      const JOBS_ADDED = 6;
      if (paymentMethod === "WALLET") {
        if ((target.walletBalance || 0) < PRICE) {
          playSound("alert");
          showNotification(
            `Insufficient wallet balance. You have ₹${target.walletBalance}, need ₹${PRICE}.`,
          );
          return { success: false, message: "Insufficient wallet balance." };
        }
      }
      const newBalance =
        paymentMethod === "WALLET"
          ? target.walletBalance - PRICE
          : target.walletBalance;
      const newZeroJobs =
        (target.zeroCommissionJobsRemaining || 0) + JOBS_ADDED;
      /* Instant Aadhaar verification */ const updatedWorker: WorkerProfile = {
        ...target,
        walletBalance: newBalance,
        isPremiumWorker: true,
        zeroCommissionJobsRemaining: newZeroJobs,
        isVerified: true,
        badge: "Aadhaar Verified",
        premiumWorkerExpiresAt: new Date(
          Date.now() + 60 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };
      setWorkers((prev) =>
        prev.map((w) => (w.id === target.id ? updatedWorker : w)),
      );
      syncWorkerToFirestore(updatedWorker);
      if (currentWorker && currentWorker.id === target.id) {
        setCurrentWorker(updatedWorker);
      }
      /* Auto-approve worker */ setVerifications((prev) =>
        prev.map((v) =>
          v.workerName.toLowerCase() === target.name.toLowerCase() ||
          v.phone === target.phone
            ? { ...v, status: "approved" }
            : v,
        ),
      );
      /* Credit Admin Treasury */ setAdminTreasuryBalance((prev) => {
        const next = prev + PRICE;
        localStorage.setItem("dihadi_admin_treasury_v8", String(next));
        return next;
      });
      setAdminSubscriptionRevenue((prev) => {
        const next = prev + PRICE;
        localStorage.setItem("dihadi_admin_sub_rev_v8", String(next));
        return next;
      });
      /* Record Admin transaction */ const newTx: AdminTransaction = {
        id: `tx-worker-sub-${Date.now()}`,
        type: "SUBSCRIPTION_CREDIT",
        amount: PRICE,
        description: `Worker VIP Pass & Instant Aadhaar Verification (₹${PRICE})`,
        timestamp: "Just now",
        workerName: target.name,
      };
      setAdminTransactions((prev) => {
        const updated = [newTx, ...prev];
        localStorage.setItem("dihadi_admin_txs_v8", JSON.stringify(updated));
        return updated;
      });
      playSound("cash");
      showNotification(
        "🎉 VIP Pass & Quick Aadhaar Verification Activated!",
        `₹${PRICE} received. You are now Govt. Aadhaar Verified with 6 Zero-Commission Jobs and Priority Ranking!`,
      );
      return {
        success: true,
        message: "VIP Pass & Aadhaar Verification Activated Successfully!",
      };
    }; /* Customer purchases Dihadi Gold */
  const subscribeCustomerPremium = (
    customerId: string,
    paymentMethod: "UPI" | "CARD" | "NET_BANKING" = "UPI",
  ): { success: boolean; message: string } => {
    const PRICE = 15000;
    const expiry = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    /* 1 Month Free Service */ if (currentCustomer) {
      const updatedCustomer: CustomerProfile = {
        ...currentCustomer,
        isPremiumCustomer: true,
        premiumFreeServiceMonths: 1,
        premiumFeePaid: PRICE,
        premiumCustomerExpiresAt: expiry,
      };
      setCurrentCustomer(updatedCustomer);
      localStorage.setItem(
        "dihadi_current_customer_v8",
        JSON.stringify(updatedCustomer),
      );
    }
    /* Credit Admin Account */ setAdminTreasuryBalance((prev) => {
      const next = prev + PRICE;
      localStorage.setItem("dihadi_admin_treasury_v8", String(next));
      return next;
    });
    setAdminSubscriptionRevenue((prev) => {
      const next = prev + PRICE;
      localStorage.setItem("dihadi_admin_sub_rev_v8", String(next));
      return next;
    });
    /* Record in Admin Transactions */ const newTx: AdminTransaction = {
      id: `tx-cust-sub-${Date.now()}`,
      type: "SUBSCRIPTION_CREDIT",
      amount: PRICE,
      description: `Customer Gold Membership (₹${PRICE.toLocaleString("en-IN")}) - 1 Month Free Service & Auto Worker Payouts`,
      timestamp: "Just now",
      customerName: currentCustomer?.name || "Customer",
    };
    setAdminTransactions((prev) => {
      const updated = [newTx, ...prev];
      localStorage.setItem("dihadi_admin_txs_v8", JSON.stringify(updated));
      return updated;
    });
    playSound("success");
    showNotification(
      "👑 Dihadi Gold Membership Activated!",
      `₹${PRICE.toLocaleString("en-IN")} received in Admin Account. Worker hiring wages will now be automatically disbursed directly into worker wallets by Admin!`,
    );
    return { success: true, message: "Dihadi Gold Membership Activated!" };
  };
  /* Worker withdraws wallet */ const withdrawWorkerEarnings = (
    customUpi?: string,
  ) => {
    if (!currentWorker || currentWorker.walletBalance <= 0) {
      showNotification("Wallet balance is ₹0.");
      return;
    }
    const amount = currentWorker.walletBalance;
    const targetUpi = customUpi || currentWorker.upiId || "worker@upi";
    const updated = { ...currentWorker, walletBalance: 0 };
    setCurrentWorker(updated);
    setWorkers((prev) =>
      prev.map((w) => (w.id === currentWorker.id ? updated : w)),
    );
    syncWorkerToFirestore(updated);
    playSound("cash");
    showNotification(`₹${amount} transferred to ${targetUpi}!`);
  };
  /* Admin verifies worker */ const verifyWorkerByAdmin = (
    id: string,
    status: "approved" | "rejected",
  ) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v)),
    );
    const vReq = verifications.find((v) => v.id === id);
    if (vReq) {
      const updatedV: VerificationRequest = { ...vReq, status };
      syncVerificationToFirestore(updatedV);
      const vReqCleanPhone = vReq.phone.replace(/[^0-9]/g, "").slice(-10);
      const vReqName = vReq.workerName.trim().toLowerCase();
      setWorkers((prev) =>
        prev.map((w) => {
          const wCleanPhone = w.phone.replace(/[^0-9]/g, "").slice(-10);
          const isMatch =
            (wCleanPhone && vReqCleanPhone && wCleanPhone === vReqCleanPhone) ||
            w.name.trim().toLowerCase() === vReqName;
          if (isMatch) {
            const updatedW: WorkerProfile = {
              ...w,
              isVerified: status === "approved",
              badge:
                status === "approved"
                  ? "Aadhaar Verified"
                  : "Registered Worker",
            };
            syncWorkerToFirestore(updatedW);
            return updatedW;
          }
          return w;
        }),
      );
      if (currentWorker) {
        const currCleanPhone = currentWorker.phone
          .replace(/[^0-9]/g, "")
          .slice(-10);
        const isMatch =
          (currCleanPhone &&
            vReqCleanPhone &&
            currCleanPhone === vReqCleanPhone) ||
          currentWorker.name.trim().toLowerCase() === vReqName;
        if (isMatch) {
          setCurrentWorker((curr) =>
            curr
              ? {
                  ...curr,
                  isVerified: status === "approved",
                  badge:
                    status === "approved"
                      ? "Aadhaar Verified"
                      : "Registered Worker",
                }
              : null,
          );
        }
      }
    }
    playSound("click");
    showNotification(
      `KYC verification for ${vReq?.workerName || "worker"} marked ${status}.`,
    );
  };
  /* Direct verification */ const verifyWorkerDirectly = (
    workerId: string,
    status: "approved" | "rejected" = "approved",
  ) => {
    const targetWorker = workers.find((w) => w.id === workerId);
    if (!targetWorker) return;
    const targetPhoneClean = targetWorker.phone
      .replace(/[^0-9]/g, "")
      .slice(-10);
    const targetName = targetWorker.name.trim().toLowerCase();
    const updatedWorker: WorkerProfile = {
      ...targetWorker,
      isVerified: status === "approved",
      badge: status === "approved" ? "Aadhaar Verified" : "Registered Worker",
    };
    syncWorkerToFirestore(updatedWorker);
    /* Update workers */ setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId ||
        (targetPhoneClean &&
          w.phone.replace(/[^0-9]/g, "").slice(-10) === targetPhoneClean) ||
        w.name.trim().toLowerCase() === targetName
          ? updatedWorker
          : w,
      ),
    );
    if (currentWorker) {
      const currCleanPhone = currentWorker.phone
        .replace(/[^0-9]/g, "")
        .slice(-10);
      const isMatch =
        currentWorker.id === workerId ||
        (currCleanPhone &&
          targetPhoneClean &&
          currCleanPhone === targetPhoneClean) ||
        currentWorker.name.trim().toLowerCase() === targetName;
      if (isMatch) {
        setCurrentWorker((curr) =>
          curr
            ? {
                ...curr,
                isVerified: status === "approved",
                badge:
                  status === "approved"
                    ? "Aadhaar Verified"
                    : "Registered Worker",
              }
            : null,
        );
      }
    }
    /* Update verification */ setVerifications((prev) => {
      const match = prev.find((v) => {
        const vClean = v.phone.replace(/[^0-9]/g, "").slice(-10);
        return (
          (vClean && targetPhoneClean && vClean === targetPhoneClean) ||
          v.workerName.trim().toLowerCase() === targetName
        );
      });
      if (match) {
        const updatedV: VerificationRequest = { ...match, status };
        syncVerificationToFirestore(updatedV);
        return prev.map((v) => (v.id === match.id ? updatedV : v));
      } else {
        const newV: VerificationRequest = {
          id: `v-${Date.now().toString().slice(-4)}`,
          workerName: targetWorker.name,
          trade: targetWorker.primaryTrade,
          phone: targetWorker.phone,
          aadhaarNumber: targetWorker.aadhaarNumberMasked || "7829-4412-9901",
          experienceYears: targetWorker.experienceYears || 3,
          submittedAt: "Just now",
          status,
        };
        syncVerificationToFirestore(newV);
        return [newV, ...prev];
      }
    });
    playSound("click");
    showNotification(
      `Worker ${targetWorker.name} verification marked ${status}.`,
    );
  };
  /* Verify current worker */ const verifyCurrentWorker = (
    status: "approved" | "rejected" = "approved",
  ) => {
    if (!currentWorker) return;
    verifyWorkerDirectly(currentWorker.id, status);
  };
  /* Worker submits KYC */ const submitWorkerKyc = (data: {
    workerName: string;
    trade: TradeType;
    phone: string;
    aadhaarNumber: string;
    experienceYears: number;
  }) => {
    const cleanPhone = data.phone.replace(/[^0-9]/g, "").slice(-10);
    const maskedAadhaar = `XXXX-XXXX-${data.aadhaarNumber.replace(/[^0-9]/g, "").slice(-4) || "9901"}`;
    /* Update in worker list */ setWorkers((prev) =>
      prev.map((w) => {
        const wClean = w.phone.replace(/[^0-9]/g, "").slice(-10);
        if (
          (wClean && cleanPhone && wClean === cleanPhone)
        ) {
          return {
            ...w,
            primaryTrade: data.trade,
            experienceYears: data.experienceYears,
            aadhaarNumberMasked: maskedAadhaar,
            badge: "KYC Under Review",
          };
        }
        return w;
      }),
    );
    if (currentWorker) {
      setCurrentWorker((curr) =>
        curr
          ? {
              ...curr,
              primaryTrade: data.trade,
              experienceYears: data.experienceYears,
              aadhaarNumberMasked: maskedAadhaar,
              badge: "KYC Under Review",
            }
          : null,
      );
    }
    /* Add verification */ setVerifications((prev) => {
      const match = prev.find((v) => {
        const vClean = v.phone.replace(/[^0-9]/g, "").slice(-10);
        return (vClean && cleanPhone && vClean === cleanPhone);
      });
      if (match) {
        const updatedV: VerificationRequest = {
          ...match,
          workerName: data.workerName,
          trade: data.trade,
          phone: data.phone,
          aadhaarNumber: data.aadhaarNumber,
          experienceYears: data.experienceYears,
          submittedAt: "Just now",
          status: "pending",
        };
        syncVerificationToFirestore(updatedV);
        return prev.map((v) => (v.id === match.id ? updatedV : v));
      } else {
        const newV: VerificationRequest = {
          id: `v-${Date.now().toString().slice(-4)}`,
          workerName: data.workerName,
          trade: data.trade,
          phone: data.phone,
          aadhaarNumber: data.aadhaarNumber,
          experienceYears: data.experienceYears,
          submittedAt: "Just now",
          status: "pending",
        };
        syncVerificationToFirestore(newV);
        return [newV, ...prev];
      }
    });
    const targetW = workers.find((w) => {
      const wClean = w.phone.replace(/[^0-9]/g, "").slice(-10);
      return (wClean && cleanPhone && wClean === cleanPhone);
    });
    if (targetW) {
      syncWorkerToFirestore({
        ...targetW,
        primaryTrade: data.trade,
        experienceYears: data.experienceYears,
        aadhaarNumberMasked: maskedAadhaar,
        badge: "KYC Under Review",
      });
    }
    playSound("success");
    showNotification(
      `Aadhaar KYC request for ${data.workerName} submitted to Admin queue!`,
    );
  };
  /* Seed workers */ const seedMoreWorkersForVerification = () => {
    const isLudhiana =
      !currentCity?.name || currentCity.name.toLowerCase().includes("ludhiana");
    const candidateNames = isLudhiana
      ? [
          {
            name: "Kishan Lal",
            trade: "Mason" as TradeType,
            rate: 850,
            exp: 5,
            area: "Model Town",
            phone: "+91 98101 11223",
            aadhaar: "8912-3344-5566",
          },
          {
            name: "Vijay Verma",
            trade: "Electrician" as TradeType,
            rate: 900,
            exp: 6,
            area: "Sarabha Nagar",
            phone: "+91 98101 44556",
            aadhaar: "7788-9900-1122",
          },
          {
            name: "Balwant Singh",
            trade: "Carpenter" as TradeType,
            rate: 950,
            exp: 8,
            area: "Civil Lines",
            phone: "+91 98101 66778",
            aadhaar: "4433-2211-9988",
          },
          {
            name: "Santosh Yadav",
            trade: "Painter" as TradeType,
            rate: 850,
            exp: 4,
            area: "Dugri Phase 1",
            phone: "+91 98101 88990",
            aadhaar: "6655-4433-2211",
          },
          {
            name: "Mohd Imran",
            trade: "Plumber" as TradeType,
            rate: 900,
            exp: 5,
            area: "Gill Road",
            phone: "+91 98101 33221",
            aadhaar: "1122-3344-5566",
          },
        ]
      : [
          {
            name: "Kishan Lal",
            trade: "Mason" as TradeType,
            rate: 850,
            exp: 5,
            area: currentCity.defaultArea || "Central Market",
            phone: "+91 98101 11223",
            aadhaar: "8912-3344-5566",
          },
          {
            name: "Vijay Verma",
            trade: "Electrician" as TradeType,
            rate: 900,
            exp: 6,
            area: currentCity.defaultArea || "Main Road",
            phone: "+91 98101 44556",
            aadhaar: "7788-9900-1122",
          },
          {
            name: "Balwant Singh",
            trade: "Carpenter" as TradeType,
            rate: 950,
            exp: 8,
            area: currentCity.defaultArea || "Market Block A",
            phone: "+91 98101 66778",
            aadhaar: "4433-2211-9988",
          },
          {
            name: "Santosh Yadav",
            trade: "Painter" as TradeType,
            rate: 850,
            exp: 4,
            area: currentCity.defaultArea || "Sector 2",
            phone: "+91 98101 88990",
            aadhaar: "6655-4433-2211",
          },
          {
            name: "Mohd Imran",
            trade: "Plumber" as TradeType,
            rate: 900,
            exp: 5,
            area: currentCity.defaultArea || "Civil Area",
            phone: "+91 98101 33221",
            aadhaar: "1122-3344-5566",
          },
        ];
    const randomPick =
      candidateNames[Math.floor(Math.random() * candidateNames.length)];
    const newWorkerId = `w-cand-${Date.now().toString().slice(-4)}`;
    const areaCoords = getCoordinatesForArea(
      randomPick.area,
      currentCity?.name || "Ludhiana",
    );
    const newWorker: WorkerProfile = {
      id: newWorkerId,
      name: randomPick.name,
      phone: randomPick.phone,
      avatar:
        "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=150&auto=format&fit=crop&q=80",
      primaryTrade: randomPick.trade,
      secondaryTrades: ["Construction Helper"],
      dailyRate: randomPick.rate,
      experienceYears: randomPick.exp,
      rating: 5.0,
      reviewCount: 1,
      completedJobsCount: 0,
      isOnline: true,
      location: {
        area: randomPick.area,
        city: currentCity?.name || "Ludhiana",
        distanceKm: +(0.5 + Math.random() * 2).toFixed(1),
      },
      gpsLocation: {
        lat: areaCoords.lat + (Math.random() - 0.5) * 0.02,
        lng: areaCoords.lng + (Math.random() - 0.5) * 0.02,
        area: randomPick.area,
        city: currentCity?.name || "Ludhiana",
        accuracyMeters: 4,
        heading: Math.floor(Math.random() * 360),
        speedKmh: 0,
        lastUpdated: "Just now",
      },
      isSharingLiveGps: true,
      aadhaarNumberMasked: `XXXX-XXXX-${randomPick.aadhaar.slice(-4)}`,
      isVerified: false,
      todayEarnings: 0,
      totalEarnings: 0,
      walletBalance: 0,
      badge: "Aadhaar Pending",
      upiId: `${randomPick.name.toLowerCase().replace(/\s+/g, ".")}@upi`,
      bankName: "State Bank of India",
      accountNumberMasked: "•••• •••• 9912",
      ifscCode: "SBIN0001234",
    };
    const newV: VerificationRequest = {
      id: `v-${Date.now().toString().slice(-4)}`,
      workerName: randomPick.name,
      trade: randomPick.trade,
      phone: randomPick.phone,
      aadhaarNumber: randomPick.aadhaar,
      experienceYears: randomPick.exp,
      submittedAt: "Just now",
      status: "pending",
    };
    setWorkers((prev) => [newWorker, ...prev]);
    setVerifications((prev) => [newV, ...prev]);
    syncWorkerToFirestore(newWorker);
    syncVerificationToFirestore(newV);
    playSound("success");
    showNotification(
      `New worker ${randomPick.name} (${randomPick.trade}) submitted KYC for Admin review!`,
    );
  };
  /* Refresh GPS */ const refreshWorkerGpsLocation = async () => {
    const res = await snapToRealWorldAddress();
    if (res) {
      playSound("gps_ping");
      showNotification(
        `📍 Live GPS calibrated: ${res.sublocality || res.street || res.city}!`,
      );
    } else {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const detected = detectCityFromCoords(
              pos.coords.latitude,
              pos.coords.longitude,
            );
            updateWorkerGps({
              lat: +pos.coords.latitude.toFixed(4),
              lng: +pos.coords.longitude.toFixed(4),
              city: detected.name,
              area: detected.defaultArea,
              accuracyMeters: Math.round(pos.coords.accuracy) || 4,
              heading: pos.coords.heading ? Math.round(pos.coords.heading) : 45,
              lastUpdated: "Just now",
            });
            playSound("gps_ping");
            showNotification(
              "Live GPS coordinates calibrated with high accuracy!",
            );
          },
          () => {
            const defaultCoords = getCoordinatesForArea(
              currentCity.defaultArea,
              currentCity.name,
            );
            updateWorkerGps({
              lat: defaultCoords.lat,
              lng: defaultCoords.lng,
              city: currentCity.name,
              area: currentCity.defaultArea,
              accuracyMeters: 4,
              lastUpdated: "Just now",
            });
            playSound("gps_ping");
            showNotification(
              `Live GPS coordinates locked to ${currentCity.name}.`,
            );
          },
        );
      }
    }
  };
  /* Resolve a dispute */ const resolveDispute = (id: string) => {
    const dMatch = disputes.find((d) => d.id === id);
    if (dMatch) {
      const updatedD: DisputeItem = { ...dMatch, status: "resolved" };
      syncDisputeToFirestore(updatedD);
    }
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "resolved" } : d)),
    );
    playSound("click");
    showNotification("Dispute marked resolved.");
  };
  /* Raise a Job Complaint */ const raiseJobComplaint = (
    jobId: string,
    reason: string,
    detailedExplanation?: string,
  ): { success: boolean; disputeId?: string } => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) {
      showNotification("Job not found.");
      return { success: false };
    }
    const disputeId = `DISP-${Date.now().toString().slice(-6)}`;
    const escrowAmount =
      targetJob.escrowPrepaidAmount ||
      (targetJob.dailyWage || 850) * (targetJob.durationDays || 1);
    const updatedJob: Job = {
      ...targetJob,
      status: "disputed",
      escrowStatus: "refund_requested_dispute",
      disputeId: disputeId,
      disputeReason: reason,
    };
    setJobs((prev) => prev.map((j) => (j.id === jobId ? updatedJob : j)));
    syncJobToFirestore(updatedJob);
    const newDispute: DisputeItem = {
      id: disputeId,
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      workerId: targetJob.assignedWorkerId,
      workerName: targetJob.assignedWorkerName || "Assigned Worker",
      workerPhone: targetJob.assignedWorkerPhone || "+91 98101 55678",
      customerName:
        targetJob.customerName || currentCustomer?.name || "Customer",
      customerPhone:
        targetJob.customerPhone || currentCustomer?.phone || "+91 98101 00000",
      reason: reason || "Worker did not arrive at site",
      detailedReason:
        detailedExplanation ||
        "Employer reported worker absence or issue. Escrow locked for admin audit.",
      status: "open",
      amount: escrowAmount,
      reportedAt: "Just now",
    };
    setDisputes((prev) => [newDispute, ...prev]);
    syncDisputeToFirestore(newDispute);
    playSound("alert");
    showNotification(
      "🛡️ Complaint Registered for Admin Review!",
      `Complaint #${disputeId} logged. Escrow funds of ₹${escrowAmount} remain safely locked. Admin Ops will audit GPS logs and approve refund upon verification.`,
    );
    return { success: true, disputeId };
  };
  /* Admin Approves Refund */ const adminApproveRefund = (
    disputeId: string,
    resolutionNote?: string,
  ) => {
    const dispute = disputes.find((d) => d.id === disputeId);
    if (!dispute) return;
    const note =
      resolutionNote ||
      "Complaint verified: 100% Escrow refund approved by Admin.";
    const updatedDispute: DisputeItem = {
      ...dispute,
      status: "resolved",
      resolutionNote: note,
      resolvedAt: "Just now",
    };
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? updatedDispute : d)),
    );
    syncDisputeToFirestore(updatedDispute);
    /* Cancel job */ const targetJob = jobs.find((j) => j.id === dispute.jobId);
    if (targetJob) {
      const refundedJob: Job = {
        ...targetJob,
        status: "cancelled",
        escrowStatus: "refunded_to_customer",
      };
      setJobs((prev) =>
        prev.map((j) => (j.id === targetJob.id ? refundedJob : j)),
      );
      syncJobToFirestore(refundedJob);
    }
    /* Log in Admin Transactions */ const refundTx: AdminTransaction = {
      id: `tx-refund-${Date.now()}`,
      type: "REFUND_DISBURSEMENT",
      amount: dispute.amount,
      description: `Escrow Refund (₹${dispute.amount}) to ${dispute.customerName} - ${note}`,
      timestamp: "Just now",
      customerName: dispute.customerName,
      workerName: dispute.workerName,
      jobId: dispute.jobId,
    };
    setAdminTransactions((prev) => {
      const updated = [refundTx, ...prev];
      localStorage.setItem("dihadi_admin_txs_v8", JSON.stringify(updated));
      return updated;
    });
    playSound("cash");
    showNotification(
      "✅ Refund Approved by Admin",
      `₹${dispute.amount} 100% Escrow refund processed for ${dispute.customerName}.`,
    );
  };
  /* Admin Rejects Complaint */ const adminRejectDisputeAndReleaseToWorker = (
    disputeId: string,
    resolutionNote?: string,
  ) => {
    const dispute = disputes.find((d) => d.id === disputeId);
    if (!dispute) return;
    const note =
      resolutionNote ||
      "Audit complete: Worker presence verified. Escrow wage released.";
    const updatedDispute: DisputeItem = {
      ...dispute,
      status: "rejected",
      resolutionNote: note,
      resolvedAt: "Just now",
    };
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? updatedDispute : d)),
    );
    syncDisputeToFirestore(updatedDispute);
    const targetJob = jobs.find((j) => j.id === dispute.jobId);
    if (targetJob) {
      releasePaymentByCustomer(
        targetJob.id,
        5,
        `Admin resolution: ${note}`,
        "ESCROW_WALLET",
        `ADMIN-RES-${Date.now().toString().slice(-5)}`,
      );
    }
    playSound("success");
    showNotification(
      "⚖️ Complaint Dismissed: Escrow payment released to worker.",
    );
  };
  /* Escrow Refund Handler */ const refundEscrowToCustomer = (
    jobId: string,
  ): boolean => {
    const target = jobs.find((j) => j.id === jobId);
    if (!target) return false;
    /* Route to complaint / dispute for admin verification */
    raiseJobComplaint(
      jobId,
      "Worker did not arrive / Cancelled",
      "Escrow refund requested by customer.",
    );
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentLanguage,
        setCurrentLanguage,
        isDarkMode,
        toggleTheme,
        currentCity,
        setCurrentCity,
        supportedCities: SUPPORTED_CITIES,
        detectAndSetLiveLocation,
        snapToRealWorldAddress,
        currentResolvedAddress,
        isLocating,
        workers,
        jobs,
        verifications,
        disputes,
        currentWorker,
        currentCustomer,
        currentAdmin,
        activeCall,
        startCall,
        endCall,
        activeGpsJob,
        openGpsRadar,
        closeGpsRadar,
        activeUpiPaymentJob,
        openUpiPayment,
        closeUpiPayment,
        activeMultiChannelJob,
        activeMultiChannelWorker,
        openMultiChannelModal,
        closeMultiChannelModal,
        activeShortlistJob,
        openTop5Shortlist,
        closeTop5Shortlist,
        latestMatchedJob,
        latestTop5Matches,
        getTop5WorkersForJob,
        matchJobWithWorkers,
        clearMatchedSuggestions,
        chatNotifications,
        triggerChatNotification,
        dismissChatNotification,
        activeGlobalChat,
        openGlobalChat,
        closeGlobalChat,
        workerAccounts,
        loginWorkerWithAuth,
        registerWorkerWithAuth,
        loginWorker,
        logoutWorker,
        toggleWorkerStatus,
        updateWorkerUpi,
        updateWorkerGps,
        updateWorkerAvatar,
        updateWorkerProfile,
        acceptJobByWorker,
        approveAndFundEscrow,
        approveWorker,
        rejectWorker,
        startJobWithOtp,
        completeJobByWorker,
        withdrawWorkerEarnings,
        customerAccounts,
        loginCustomerWithAuth,
        registerCustomerWithAuth,
        loginCustomer,
        logoutCustomer,
        updateCustomerGps,
        refreshCustomerGpsLocation,
        postJob,
        dispatchJobStartOtp,
        releasePaymentByCustomer,
        rateWorkerJob,
        subscribeWorkerPremium,
        subscribeCustomerPremium,
        topUpWorkerWallet,
        disburseWorkerWageFromAdmin,
        isSubscriptionPromoOpen,
        promoInitialRole,
        openSubscriptionPromo,
        closeSubscriptionPromo,
        isProtectionModalOpen,
        protectionModalData,
        openProtectionModal,
        closeProtectionModal,
        raiseJobComplaint,
        adminApproveRefund,
        adminRejectDisputeAndReleaseToWorker,
        refundEscrowToCustomer,
        adminTreasuryBalance,
        adminSubscriptionRevenue,
        adminWorkerPayoutsDisbursed,
        adminTransactions,
        loginAdminWithAuth,
        loginAdmin,
        logoutAdmin,
        verifyWorkerByAdmin,
        verifyWorkerDirectly,
        verifyCurrentWorker,
        submitWorkerKyc,
        seedMoreWorkersForVerification,
        refreshWorkerGpsLocation,
        resolveDispute,
        signInWithGoogleSSO,
        ssoGoogleUser,
        setSsoGoogleUser,
        isSSORoleModalOpen,
        setIsSSORoleModalOpen,
        resetToZero,
        seedSampleData,
        isFirebaseConnected,
        connectedCluster,
        speak,
        notification,
        setNotification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
