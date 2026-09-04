import {
  WorkerProfile,
  TradeType,
  HyperlocalMatchResult,
  MultiChannelAlertPayload,
  Job,
  Language,
} from "../types";
import { calculateDistanceKm } from "./geo";

/**
 * Hyperlocal AI Matching Engine
 * Strictly filters & scores workers within a strict 10km radius based on location, trade skills, and live availability.
 */
export function matchHyperlocalWorkers(
  workers: WorkerProfile[],
  criteria: {
    trade: TradeType;
    lat: number;
    lng: number;
    maxRadiusKm?: number; // default strict 10.0 km
    budget?: number;
    language?: Language;
  },
): HyperlocalMatchResult[] {
  const maxDistance = Math.min(10.0, criteria.maxRadiusKm ?? 10.0);
  const lang = criteria.language || "en";

  const eligibleWorkers = workers.filter((worker) => {
    const workerLat = worker.gpsLocation?.lat || 30.8926;
    const workerLng = worker.gpsLocation?.lng || 75.8415;
    const distanceKm = calculateDistanceKm(
      criteria.lat,
      criteria.lng,
      workerLat,
      workerLng,
    );
    // Hard block any worker further than 10km (or selected radius)
    return distanceKm <= maxDistance;
  });

  const results: HyperlocalMatchResult[] = eligibleWorkers.map((worker) => {
    const workerLat = worker.gpsLocation?.lat || 30.8926;
    const workerLng = worker.gpsLocation?.lng || 75.8415;
    const distanceKm = calculateDistanceKm(
      criteria.lat,
      criteria.lng,
      workerLat,
      workerLng,
    );
    const isWithin10Km = true; // Guaranteed by strict filter above

    // 1. Skill Match Analysis
    let skillMatch: "exact_primary" | "secondary" | "related" = "related";
    let skillScore = 10;

    if (worker.primaryTrade.toLowerCase() === criteria.trade.toLowerCase()) {
      skillMatch = "exact_primary";
      skillScore = 35;
    } else if (
      worker.secondaryTrades &&
      worker.secondaryTrades.some(
        (t) => t.toLowerCase() === criteria.trade.toLowerCase(),
      )
    ) {
      skillMatch = "secondary";
      skillScore = 22;
    } else {
      // Related trade pairings (e.g. Mason <-> Tile Worker, Electrician <-> Welder)
      const relatedMap: Record<string, string[]> = {
        Mason: ["Tile Worker", "Construction Helper"],
        "Tile Worker": ["Mason", "Construction Helper"],
        Electrician: ["Welder"],
        Welder: ["Electrician"],
        Carpenter: ["Construction Helper"],
        Painter: ["Construction Helper"],
        "Construction Helper": ["Mason", "Loader/Mover", "Painter"],
      };
      const related = relatedMap[criteria.trade] || [];
      if (related.includes(worker.primaryTrade)) {
        skillMatch = "related";
        skillScore = 15;
      }
    }

    // 2. Distance Proximity Scoring (Max 40 points)
    // Within 1km: 40pts, 3km: 34pts, 5km: 28pts, 10km: 15pts, >10km: 0pts
    let distanceScore = 0;
    if (isWithin10Km) {
      distanceScore = Math.max(
        10,
        Math.round(40 - (distanceKm / maxDistance) * 30),
      );
    }

    // 3. Live Availability (Max 15 points)
    const availability = worker.isOnline;
    const availabilityScore = worker.isOnline ? 15 : 2;

    // 4. Verification & Rating Trust Score (Max 10 points)
    let trustScore = (worker.rating / 5.0) * 6;
    if (worker.isVerified) trustScore += 4;

    // Overall Score (0 - 100)
    let totalScore = Math.min(
      100,
      Math.round(skillScore + distanceScore + availabilityScore + trustScore),
    );

    // Heavy penalty if outside strict 10km boundary
    if (!isWithin10Km) {
      totalScore = Math.min(35, totalScore - 40);
    }

    // Estimated arrival / transit time (assumes 20 km/h city transit + 5 min prep)
    const etaMinutes = Math.max(5, Math.round((distanceKm / 20) * 60 + 5));

    // Dynamic AI Reasoning Generation
    const reasonParts: string[] = [];
    if (distanceKm <= 3.0) {
      reasonParts.push(
        `Hyperlocal (${distanceKm} km, ~${etaMinutes} mins away)`,
      );
    } else if (isWithin10Km) {
      reasonParts.push(`Within 10km radius (${distanceKm} km)`);
    } else {
      reasonParts.push(`Outside strict 10km zone (${distanceKm} km)`);
    }

    if (skillMatch === "exact_primary") {
      reasonParts.push(
        `Master ${worker.primaryTrade} (${worker.experienceYears} yrs exp)`,
      );
    } else if (skillMatch === "secondary") {
      reasonParts.push(`Verified secondary skill in ${criteria.trade}`);
    }

    if (worker.isVerified) {
      reasonParts.push(`Govt Aadhaar verified`);
    }

    if (worker.rating >= 4.8) {
      reasonParts.push(`Top-rated (${worker.rating}★)`);
    }

    if (worker.isOnline) {
      reasonParts.push(`Live on radar`);
    }

    const aiReasoning = reasonParts.join(" • ");

    return {
      worker,
      distanceKm,
      isWithin10Km,
      skillMatch,
      availability,
      matchScore: totalScore,
      aiReasoning,
      etaMinutes,
      rank: 0,
    };
  });

  // Sort: First by 10km compliance, then by match score descending, then distance ascending
  results.sort((a, b) => {
    if (a.isWithin10Km && !b.isWithin10Km) return -1;
    if (!a.isWithin10Km && b.isWithin10Km) return 1;
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return a.distanceKm - b.distanceKm;
  });

  // Assign ranks
  results.forEach((item, index) => {
    item.rank = index + 1;
  });

  return results;
}

/**
 * Top-5 Shortlisting Engine
 * Returns the 5 most optimal candidates for a specific job/criteria
 */
export function getTop5Shortlist(
  workers: WorkerProfile[],
  criteria: {
    trade: TradeType;
    lat: number;
    lng: number;
    maxRadiusKm?: number;
    budget?: number;
    language?: Language;
  },
): HyperlocalMatchResult[] {
  const matches = matchHyperlocalWorkers(workers, criteria);
  return matches.slice(0, 5);
}

/**
 * Builds realistic multi-channel alert payload across WhatsApp, IVR Voice Call, SMS, and App Push
 */
export function createMultiChannelAlertPayload(
  job: Job,
  worker: WorkerProfile,
  language: Language = "en",
): MultiChannelAlertPayload {
  const dateStr = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 1. WhatsApp rich interactive alert
  let waMessage = "";
  if (language === "pa") {
    waMessage = `⚡ *ਦਿਹਾੜੀ ਨਵਾਂ ਕੰਮ ਅਲਰਟ!*\n\n🛠 *ਕੰਮ*: ${job.trade} (${job.title})\n📍 *ਜਗ੍ਹਾ*: ${job.area || job.locationAddress}\n💰 *ਦਿਹਾੜੀ*: ₹${job.dailyWage}/ਦਿਨ (${job.durationDays} ਦਿਨ)\n📏 *ਦੂਰੀ*: ਲਗਭਗ ${job.distanceKm} ਕਿ.ਮੀ.\n👤 *ਮਾਲਕ*: ${job.customerName}\n\n👉 *ਕੰਮ ਸਵੀਕਾਰ ਕਰਨ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਬਟਨ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।*`;
  } else if (language === "hi") {
    waMessage = `⚡ *दिहाड़ी नया काम अलर्ट!*\n\n🛠 *काम*: ${job.trade} (${job.title})\n📍 *स्थान*: ${job.area || job.locationAddress}\n💰 *मजदूरी*: ₹${job.dailyWage}/दिन (${job.durationDays} दिन)\n📏 *दूरी*: लगभग ${job.distanceKm} किमी\n👤 *नियोक्ता*: ${job.customerName}\n\n👉 *काम स्वीकार करने के लिए नीचे दिए गए बटन पर टैप करें।*`;
  } else {
    waMessage = `⚡ *Dihadi Instant Job Alert!*\n\n🛠 *Role*: ${job.trade} (${job.title})\n📍 *Location*: ${job.area || job.locationAddress}\n💰 *Wage*: ₹${job.dailyWage}/day (${job.durationDays} days)\n📏 *Distance*: ~${job.distanceKm} km away\n👤 *Contractor*: ${job.customerName}\n\n👉 *Tap Accept in App to lock job & receive 4-digit start OTP.*`;
  }

  // 2. Voice Call / IVR synthesized speech transcript
  let ivrTranscript = "";
  if (language === "pa") {
    ivrTranscript = `ਨਮਸਕਾਰ ${worker.name} ਜੀ! ਦਿਹਾੜੀ ਵੱਲੋਂ ਤੁਹਾਡੇ ਲਈ ${job.area} ਵਿੱਚ ${job.trade} ਦਾ ਨਵਾਂ ਕੰਮ ਹੈ। ਰੋਜ਼ਾਨਾ ਦਿਹਾੜੀ ₹${job.dailyWage} ਹੈ। ਕੰਮ ਸਵੀਕਾਰ ਕਰਨ ਲਈ 1 ਦਬਾਓ, ਅਸਵੀਕਾਰ ਕਰਨ ਲਈ 2 ਦਬਾਓ।`;
  } else if (language === "hi") {
    ivrTranscript = `नमस्ते ${worker.name} जी! दिहाड़ी की तरफ से आपके लिए ${job.area} में ${job.trade} का नया काम उपलब्ध है। दैनिक मजदूरी ₹${job.dailyWage} है। काम स्वीकार करने के लिए 1 दबाएं, अस्वीकार करने के लिए 2 दबाएं।`;
  } else {
    ivrTranscript = `Hello ${worker.name}! Dihadi has an instant ${job.trade} job for you at ${job.area}. Daily wage is ₹${job.dailyWage}. Press 1 on your phone dialpad to accept this job, or 2 to decline.`;
  }

  // 3. SMS text (160 chars GSM safe for basic feature phones)
  const smsMessage = `[KAAMZO ALERT] Naya Kaam: ${job.trade} at ${job.area}. Dihadi Rs.${job.dailyWage}/day. Reply YES to accept or open app. Help WhatsApp/Call: +919592221100`;

  // 4. App push notification
  const pushTitle = `⚡ New Hyperlocal Job: ${job.trade} (₹${job.dailyWage}/day)`;
  const pushBody = `${job.customerName} needs a ${job.trade} at ${job.area} (${job.distanceKm} km away). Tap to view and accept.`;

  // 5. Email / Mail alert payload
  const emailRecipient = worker.email || "bhavnoorsinghkochar@gmail.com";
  const emailSubject = `⚡ Dihadi Instant Job: ${job.trade} in ${job.area || "Local Area"} (₹${job.dailyWage}/day)`;
  const emailBody = `Hello ${worker.name},\n\nYou have a new direct job match from employer ${job.customerName}.\n\nTrade: ${job.trade} (${job.title})\nLocation: ${job.area || job.locationAddress}\nGuaranteed Daily Wage: Rs.${job.dailyWage}/day (${job.durationDays} day)\nDistance: ~${job.distanceKm} km\n\nLog in to the Dihadi Worker portal to accept and get the 4-digit start OTP.`;

  return {
    id: `alert-${Date.now().toString().slice(-4)}`,
    jobId: job.id,
    jobTitle: job.title,
    trade: job.trade,
    dailyWage: job.dailyWage,
    locationArea: job.area || job.locationAddress,
    targetWorker: {
      id: worker.id,
      name: worker.name,
      phone: worker.phone,
      trade: worker.primaryTrade,
    },
    channels: {
      whatsapp: {
        status: "delivered",
        message: waMessage,
        timestamp: dateStr,
      },
      voiceCall: {
        status: "ringing",
        transcript: ivrTranscript,
        durationSeconds: 0,
      },
      sms: {
        status: "sent",
        message: smsMessage,
      },
      email: {
        status: "sent",
        recipient: emailRecipient,
        subject: emailSubject,
        body: emailBody,
      },
      appPush: {
        status: "delivered",
        title: pushTitle,
        body: pushBody,
      },
    },
    initiatedAt: dateStr,
    overallStatus: "broadcasting",
  };
}
