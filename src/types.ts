export type AppRole =
  "select_role" | "worker" | "customer" | "admin" | "pitch_deck";

export type Language = "en" | "hi" | "pa";

export type TradeType =
  | "Mason"
  | "Painter"
  | "Plumber"
  | "Carpenter"
  | "Electrician"
  | "Construction Helper"
  | "Tile Worker"
  | "Welder"
  | "Loader/Mover";

export type JobStatus =
  | "broadcast"
  | "accepted"
  | "approved"
  | "pending_payment"
  | "in_progress"
  | "completed_pending_payment"
  | "paid_and_closed"
  | "cancelled"
  | "disputed";

export interface GpsCoordinates {
  lat: number;
  lng: number;
  area: string;
  city: string;
  address?: string;
  accuracyMeters?: number;
  heading?: number;
  speedKmh?: number;
  lastUpdated?: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  avatar: string;
  primaryTrade: TradeType;
  secondaryTrades: TradeType[];
  dailyRate: number; // in INR
  experienceYears: number;
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  isOnline: boolean;
  location: {
    area: string;
    city: string;
    distanceKm: number;
  };
  gpsLocation: GpsCoordinates;
  isSharingLiveGps: boolean;
  aadhaarNumberMasked: string;
  isVerified: boolean;
  todayEarnings: number;
  totalEarnings: number;
  walletBalance: number;
  badge: string;
  // Subscription & VIP Zero-Commission Pass
  isPremiumWorker?: boolean;
  premiumWorkerExpiresAt?: string;
  zeroCommissionJobsRemaining?: number; // 6 jobs with 0% commission
  commissionSavedTotal?: number;
  // UPI & Banking Details
  upiId: string; // e.g. 9810155678@paytm or worker@upi
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  area: string;
  city: string;
  address: string;
  gpsLocation: GpsCoordinates;
  upiId: string;
  // Premium Subscription with 1 Month Free Service (₹15,000)
  isPremiumCustomer?: boolean;
  premiumCustomerExpiresAt?: string;
  premiumFreeServiceMonths?: number;
  premiumFeePaid?: number; // ₹15,000
}

export interface AdminTransaction {
  id: string;
  type:
    | "SUBSCRIPTION_CREDIT"
    | "WORKER_PAYOUT_DISBURSEMENT"
    | "COMMISSION_FEE"
    | "REFUND_DISBURSEMENT";
  amount: number;
  description: string;
  timestamp: string;
  customerName?: string;
  workerName?: string;
  jobId?: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  treasuryBalance?: number;
  totalSubscriptionRevenue?: number;
  totalDisbursedToWorkers?: number;
}

export interface Job {
  id: string;
  title: string;
  trade: TradeType;
  description: string;
  customerName: string;
  customerPhone: string;
  locationAddress: string;
  area: string;
  distanceKm: number;
  jobGps: GpsCoordinates;
  dailyWage: number;
  durationDays: number;
  startDate?: string;
  endDate?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  hoursPerDay?: number;
  hourlyRate?: number;
  baseLabor?: number;
  status: JobStatus;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;
  assignedWorkerTrade?: TradeType;
  assignedWorkerUpi?: string;
  workerGps?: GpsCoordinates;
  createdAt?: string;
  otpCode: string;
  postedAt: string;
  platformFee: number; // 20%
  workerPayout: number; // 80%
  zeroCommissionApplied?: boolean;
  adminFundedPayout?: boolean;
  isPaid: boolean;
  isEscrowPrepaid?: boolean;
  escrowPrepaidAmount?: number;
  escrowStatus?:
    | "pending"
    | "held_in_escrow"
    | "released_to_worker"
    | "refunded_to_customer"
    | "refund_requested_dispute";
  escrowPrepaidAt?: string;
  disputeId?: string;
  disputeReason?: string;
  paidVia?: "UPI_QR" | "UPI_DIRECT" | "ESCROW_WALLET" | "CASH";
  transactionRef?: string;
  rating?: number;
  review?: string;
  customerRating?: number;
  customerReview?: string;
  ratingTags?: string[];
  ratedAt?: string;
  completedAt?: string;
  completionDate?: string;
  ratingGiven?: number;
  reviewGiven?: string;
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderRole: "worker" | "customer" | "admin";
  senderName: string;
  senderPhone?: string;
  text: string;
  timestamp: string; // e.g. "10:45 AM"
  createdAt: number; // Date.now()
  status: "sent" | "delivered" | "read";
  isQuickReply?: boolean;
}

export interface ChatNotificationItem {
  id: string;
  senderRole: "worker" | "customer" | "admin";
  senderName: string;
  senderPhone?: string;
  recipientRole?: "worker" | "customer" | "admin";
  recipientName?: string;
  text: string;
  timestamp: string;
  jobTitle?: string;
  jobId?: string;
  job?: Job | null;
  targetPerson?: any;
  isSender?: boolean;
}

export interface CallSession {
  id: string;
  callerName: string;
  callerRole: "worker" | "customer" | "admin";
  callerPhone: string;
  receiverName: string;
  receiverRole: "worker" | "customer" | "admin";
  receiverPhone: string;
  jobTitle?: string;
  status: "calling" | "connected" | "ended";
  startedAt: number;
  durationSeconds: number;
  isMuted: boolean;
  isSpeaker: boolean;
}

export interface VerificationRequest {
  id: string;
  workerName: string;
  trade: TradeType;
  phone: string;
  aadhaarNumber: string;
  experienceYears: number;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface CityInfo {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  defaultArea: string;
}

export interface DisputeItem {
  id: string;
  jobId: string;
  jobTitle?: string;
  workerId?: string;
  workerName: string;
  workerPhone?: string;
  customerName: string;
  customerPhone?: string;
  reason: string;
  detailedReason?: string;
  status: "open" | "resolved" | "rejected";
  amount: number;
  reportedAt: string;
  resolutionNote?: string;
  resolvedAt?: string;
}

export interface HyperlocalMatchResult {
  worker: WorkerProfile;
  distanceKm: number;
  isWithin10Km: boolean;
  skillMatch: "exact_primary" | "secondary" | "related";
  availability: boolean;
  matchScore: number; // 0 - 100
  aiReasoning: string;
  etaMinutes: number;
  rank: number;
}

export interface MultiChannelAlertPayload {
  id: string;
  jobId: string;
  jobTitle: string;
  trade: TradeType;
  dailyWage: number;
  locationArea: string;
  targetWorker: {
    id: string;
    name: string;
    phone: string;
    trade: TradeType;
  };
  channels: {
    whatsapp: {
      status: "sent" | "delivered" | "read" | "accepted";
      message: string;
      timestamp: string;
    };
    voiceCall: {
      status: "dialing" | "ringing" | "connected" | "completed" | "accepted";
      transcript: string;
      durationSeconds: number;
      keypadResponse?: "1_ACCEPTED" | "2_REJECTED";
    };
    sms: {
      status: "sent" | "delivered";
      message: string;
    };
    email?: {
      status: "sent" | "delivered" | "queued";
      recipient: string;
      subject: string;
      body: string;
    };
    appPush: {
      status: "sent" | "delivered" | "opened";
      title: string;
      body: string;
    };
  };
  initiatedAt: string;
  overallStatus: "broadcasting" | "received" | "accepted" | "declined";
}
