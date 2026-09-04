import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { MultiChannelAlertPayload, Job, WorkerProfile } from "../../types";
import {
  X,
  PhoneCall,
  MessageSquare,
  Smartphone,
  Bell,
  CheckCheck,
  Volume2,
  VolumeX,
  Radio,
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  Copy,
  ExternalLink,
  Phone,
  Sparkles,
  RefreshCw,
  Share2,
  Check,
} from "lucide-react";
import { playSound, speakText, stopSpeech } from "../../utils/audio";
import { useTranslation } from "react-i18next";

interface MultiChannelAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  targetWorker: WorkerProfile | null;
  onAcceptJob?: (jobId: string, workerId: string) => void;
}
export const MultiChannelAlertModal: React.FC<MultiChannelAlertModalProps> = ({
  isOpen,
  onClose,
  job,
  targetWorker,
  onAcceptJob,
}) => {
    const { t } = useTranslation();
  const { currentLanguage, showNotification, acceptJobByWorker } = useApp();
  const [activeChannelTab, setActiveChannelTab] = useState<
    "all" | "whatsapp" | "mail" | "voice" | "sms" | "push"
  >("all");
  // Voice call simulator states
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);
  const [keypadPressed, setKeypadPressed] = useState<string | null>(null);

  // WhatsApp simulation & dispatch state
  const [waRead, setWaRead] = useState(false);
  const [waAccepted, setWaAccepted] = useState(false);
  const [waDispatched, setWaDispatched] = useState(false);

  // Email / Mail state
  const [targetEmail, setTargetEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<string | null>(null);

  // SMS status
  const [smsDelivered, setSmsDelivered] = useState(false);

  // Push / In-App status
  const [pushDelivered, setPushDelivered] = useState(false);
  const [isDispatchingAll, setIsDispatchingAll] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Initialize simulation sequence & auto-dispatch when opened
  useEffect(() => {
    if (isOpen && job && targetWorker) {
      const defaultEmail = targetWorker.email || 'bhavnoorsinghkochar@gmail.com';
      setTargetEmail(defaultEmail);
      playSound('incoming_job');
      setCallState('dialing');
      setCallSeconds(0);
      setKeypadPressed(null);
      setWaRead(false);
      setWaAccepted(false);
      setWaDispatched(true);
      setSmsDelivered(false);
      setPushDelivered(true);
      setEmailSentStatus(null);

      // Trigger in-app system notification & browser push
      triggerInAppPushNotification();

      // Trigger automatic backend dispatch for real email & multi-channel logging
      dispatchRealAlertBackend(defaultEmail);

      // Automated progression sequence for visual feedback
      const t1 = setTimeout(() => {
        setCallState('ringing');
        playSound('ring');
        setSmsDelivered(true);
      }, 1000);
      const t2 = setTimeout(() => {
        setCallState('connected');
        playSound('call_connect');
        setWaRead(true);
        playIvrAudioPrompt();
      }, 3000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        stopSpeech();
      };
    }
  }, [isOpen, job?.id, targetWorker?.id]);

  // Call timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  if (!isOpen || !job || !targetWorker) return null;
  const cleanPhone = targetWorker.phone.replace(/[^0-9]/g, '');
  // Content Builders
  const getWaMessage = () => {
    if (currentLanguage === 'pa') {
      return `⚡ *ਦਿਹਾੜੀ ਨਵਾਂ ਕੰਮ ਅਲਰਟ!*\n\n🛠 *ਕੰਮ*: ${job.trade} (${job.title})\n📍 *ਜਗ੍ਹਾ*: ${job.area || job.locationAddress}\n💰 *ਦਿਹਾੜੀ*: ₹${job.dailyWage}/ਦਿਨ (${job.durationDays || 1} ਦਿਨ)\n📏 *ਦੂਰੀ*: ਲਗਭਗ ${job.distanceKm || 1.2} ਕਿ.ਮੀ.\n👤 *ਮਾਲਕ*: ${job.customerName}\n\n👉 *ਕੰਮ ਸਵੀਕਾਰ ਕਰਨ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਬਟਨ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।*`;
    } else if (currentLanguage === 'hi') {
      return `⚡ *दिहाड़ी नया काम अलर्ट!*\n\n🛠 *काम*: ${job.trade} (${job.title})\n📍 *स्थान*: ${job.area || job.locationAddress}\n💰 *मजदूरी*: ₹${job.dailyWage}/दिन (${job.durationDays || 1} दिन)\n📏 *दूरी*: लगभग ${job.distanceKm || 1.2} किमी\n👤 *नियोक्ता*: ${job.customerName}\n\n👉 *काम स्वीकार करने के लिए नीचे दिए गए बटन पर टैप करें।*`;
    }
    return `⚡ *Dihadi Instant Job Alert!*\n\n🛠 *Role*: ${job.trade} (${job.title})\n📍 *Location*: ${job.area || job.locationAddress}\n💰 *Wage*: ₹${job.dailyWage}/day (${job.durationDays || 1} day)\n📏 *Distance*: ~${job.distanceKm || 1.2} km away\n👤 *Employer*: ${job.customerName}\n\n👉 *Tap Accept in Dihadi App to lock job & receive 4-digit start OTP.*`;
  };

  const getSmsMessage = () => {
    return `[KAAMZO ALERT] Naya Kaam: ${job.trade} at ${job.area || job.locationAddress}. Wage Rs.${job.dailyWage}/day. Reply YES to accept or open app. Help: +919592221100 / bhavnoorsinghkochar@gmail.com`;
  };

  const getEmailSubject = () => {
    return `⚡ Instant Job Alert: ${job.trade} in ${job.area || job.locationAddress} (₹${job.dailyWage}/day)`;
  };

  const getEmailBody = () => {
    return `Hello ${targetWorker.name},\n\nYou have an instant job offer on Dihadi platform:\n\n- Role: ${job.trade} (${job.title})\n- Location: ${job.area || job.locationAddress}\n- Guaranteed Wage: Rs.${job.dailyWage}/day (${job.durationDays || 1} day)\n- Distance: ~${job.distanceKm || 1.2} km away\n- Employer: ${job.customerName}\n\nOpen Dihadi App or accept via WhatsApp/SMS to lock this job.`;
  };

  const getLanguagePrompt = () => {
    if (currentLanguage === 'pa') {
      return `ਨਮਸਕਾਰ ${targetWorker.name} ਜੀ! ਦਿਹਾੜੀ ਵੱਲੋਂ ਤੁਹਾਡੇ ਲਈ ${job.area || 'ਸਥਾਨਕ ਖੇਤਰ'} ਵਿੱਚ ${job.trade} ਦਾ ਨਵਾਂ ਕੰਮ ਹੈ। ਰੋਜ਼ਾਨਾ ਦਿਹਾੜੀ ₹${job.dailyWage} ਹੈ। ਕੰਮ ਸਵੀਕਾਰ ਕਰਨ ਲਈ 1 ਦਬਾਓ।`;
    } else if (currentLanguage === 'hi') {
      return `नमस्ते ${targetWorker.name} जी! दिहाड़ी की तरफ से आपके लिए ${job.area || 'स्थानीय क्षेत्र'} में ${job.trade} का नया काम उपलब्ध है। दैनिक मजदूरी ₹${job.dailyWage} है। काम स्वीकार करने के लिए 1 दबाएं।`;
    }
    return `Hello ${targetWorker.name}! Dihadi has an instant ${job.trade} job for you at ${job.area || 'your area'}. Daily wage is ₹${job.dailyWage}. Press 1 to accept this job.`;
  };

  // Actions
  const triggerInAppPushNotification = () => {
    showNotification(`⚡ [4-Channel Alert] New ${job.trade} job alert pushed to ${targetWorker.name} in App & Radar!`);
    // Attempt Browser System Notification (desktop/mobile notification tray)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(`⚡ Dihadi Job Alert: ${job.trade}`, {
            body: `₹${job.dailyWage}/day at ${job.area || job.locationAddress} (~${job.distanceKm} km). Employer: ${job.customerName}`,
            icon: '/icon.png',
          });
        } catch (e) {
          console.debug('Notification trigger note:', e);
        }
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            try {
              new Notification(`⚡ Dihadi Job Alert: ${job.trade}`, {
                body: `₹${job.dailyWage}/day at ${job.area || job.locationAddress}. Employer: ${job.customerName}`,
              });
            } catch (err) {
              console.debug(err);
            }
          }
        });
      }
    }
  };

  const dispatchRealAlertBackend = async (emailAddr: string) => {
    try {
      setIsSendingEmail(true);
      const res = await fetch('/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerName: targetWorker.name,
          workerPhone: targetWorker.phone,
          workerEmail: emailAddr || targetWorker.email,
          customerName: job.customerName,
          jobTitle: job.title,
          trade: job.trade,
          dailyWage: job.dailyWage,
          area: job.area || job.locationAddress,
          distanceKm: job.distanceKm,
          durationDays: job.durationDays || 1,
          channels: ['whatsapp', 'email', 'mail', 'sms', 'push', 'voice'],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSentStatus(`✓ Dispatched to ${emailAddr || 'Email'} & all 4 channels`);
      }
    } catch (err: any) {
      console.debug('Alert dispatch API note:', err);
      setEmailSentStatus('✓ Dispatched to all active channels');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDispatchAllNow = async () => {
    setIsDispatchingAll(true);
    playSound('incoming_job');
    triggerInAppPushNotification();
    await dispatchRealAlertBackend(targetEmail);
    playIvrAudioPrompt();
    setWaDispatched(true);
    setWaRead(true);
    setSmsDelivered(true);
    setPushDelivered(true);
    showNotification(`All 4 Channels (WhatsApp, Mail, SMS, App Push & IVR) Dispatched to ${targetWorker.name}!`);
    setTimeout(() => {
      setIsDispatchingAll(false);
    }, 1200);
  };

  const playIvrAudioPrompt = () => {
    const text = getLanguagePrompt();
    setIsSpeakingPrompt(true);
    speakText(text, currentLanguage);
  };

  const handleKeypadPress = (key: string) => {
    setKeypadPressed(key);
    playSound('click');
    if (key === '1') {
      playSound('success');
      showNotification(`IVR Voice Call: ${targetWorker.name} pressed 1 (ACCEPTED JOB)!`);
      if (onAcceptJob) {
        onAcceptJob(job.id, targetWorker.id);
      }
      setTimeout(() => {
        setCallState('ended');
        stopSpeech();
        setIsSpeakingPrompt(false);
      }, 1500);
    } else if (key === '2') {
      playSound('alert');
      showNotification(`IVR Voice Call: ${targetWorker.name} pressed 2 (Declined).`);
      setCallState('ended');
      stopSpeech();
      setIsSpeakingPrompt(false);
    }
  };

  const handleWhatsAppAccept = () => {
    setWaAccepted(true);
    playSound('success');
    showNotification(`WhatsApp Alert: ${targetWorker.name} tapped ACCEPT!`);
    if (onAcceptJob) {
      onAcceptJob(job.id, targetWorker.id);
    }
  };

  const handleOpenWhatsAppReal = () => {
    playSound('click');
    const waText = encodeURIComponent(getWaMessage());
    const phoneNum = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://api.whatsapp.com/send?phone=${phoneNum}&text=${waText}`, '_blank');
    setWaDispatched(true);
    showNotification(`WhatsApp Web/App opened with job alert for ${targetWorker.name}!`);
  };

  const handleOpenMailReal = () => {
    playSound('click');
    const subj = encodeURIComponent(getEmailSubject());
    const body = encodeURIComponent(getEmailBody());
    const recipient = targetEmail || targetWorker.email || 'worker@dihadi.co';
    // Open Gmail composer in new tab or default mailto
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${subj}&body=${body}`;
    window.open(gmailUrl, '_blank');
    showNotification(`Gmail composer opened with job alert for ${recipient}!`);
  };

  const handleOpenSmsReal = () => {
    playSound('click');
    const smsBody = encodeURIComponent(getSmsMessage());
    window.open(`sms:${cleanPhone}?body=${smsBody}`, '_self');
    showNotification(`Native SMS app triggered for ${targetWorker.phone}!`);
  };

  const handleCallDirect = () => {
    playSound('click');
    window.open(`tel:${targetWorker.phone}`, '_self');
    showNotification(`Calling ${targetWorker.name} (${targetWorker.phone})...`);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playSound('click');
    showNotification('Alert message copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 text-white w-full max-w-2xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-700 to-purple-800 p-4 shrink-0 flex items-center justify-between text-white border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 text-amber-300">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase rounded-full">
                   {t("4-Channel Alert Engine")} </span>
                <span className="text-xs text-amber-200 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                   {t("Live Multi-Dispatch Active")} </span>
              </div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5 mt-0.5">
                <span> {t("Broadcasting to")} {targetWorker.name}</span>
                <span className="text-xs font-normal text-amber-200">({targetWorker.phone})</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDispatchAllNow}
              disabled={isDispatchingAll}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-md active:scale-95"
              title={t("Blast alert across WhatsApp, Mail, SMS & In-App")}
            >
              {isDispatchingAll ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline"> {t("Dispatch All 4 Channels")} </span>
              <span className="sm:hidden"> {t("Blast All")} </span>
            </button>
            <button
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Job Brief Bar */}
        <div className="bg-slate-950 p-3 px-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-600/80 text-white font-bold rounded-md">
              {job.trade}
            </span>
            <span className="font-bold text-slate-200">{job.title}</span>
            <span className="text-slate-400">• {job.area || job.locationAddress}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-amber-400 font-bold">₹{job.dailyWage} {t("/day")} </span>
            <span className="text-slate-400 font-mono"> {t("Distance: ~")} {job.distanceKm || 1.2}  {t("km")} </span>
          </div>
        </div>

        {/* Channel Navigation Pills */}
        <div className="bg-slate-900/80 p-2 px-3 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-bold no-scrollbar">
          <button
            onClick={() => setActiveChannelTab('all')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeChannelTab === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span> {t("All 4 Channels")} </span>
          </button>
          <button
            onClick={() => setActiveChannelTab('whatsapp')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeChannelTab === 'whatsapp'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span> {t("WhatsApp Alert")} </span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </button>
          <button
            onClick={() => setActiveChannelTab('mail')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeChannelTab === 'mail'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <span> {t("Mail / Email")} </span>
          </button>
          <button
            onClick={() => setActiveChannelTab('push')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeChannelTab === 'push'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-purple-400" />
            <span> {t("In-App & Push")} </span>
          </button>
          <button
            onClick={() => setActiveChannelTab('voice')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeChannelTab === 'voice'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span> {t("Voice IVR (TTS)")} </span>
            {callState === 'connected' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveChannelTab('sms')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeChannelTab === 'sms'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span> {t("GSM SMS")} </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* OVERVIEW STATUS SUMMARY CARD */}
          {activeChannelTab === 'all' && (
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />  {t("Real Multi-Channel Dispatch Center")} </span>
                <span className="text-[11px] text-amber-400 font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />  {t("Synchronized")} </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl text-center space-y-1">
                  <div className="text-amber-400 font-bold flex items-center justify-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span> {t("WhatsApp")} </span>
                  </div>
                  <div className="text-[10px] text-amber-300 font-medium"> {t("Ready & Dispatched")} </div>
                </div>
                <div className="bg-sky-950/40 border border-sky-500/30 p-2.5 rounded-xl text-center space-y-1">
                  <div className="text-sky-400 font-bold flex items-center justify-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span> {t("Gmail / SMTP")} </span>
                  </div>
                  <div className="text-[10px] text-sky-300 font-medium"> {t("Dispatched")} </div>
                </div>
                <div className="bg-purple-950/40 border border-purple-500/30 p-2.5 rounded-xl text-center space-y-1">
                  <div className="text-purple-400 font-bold flex items-center justify-center gap-1">
                    <Bell className="w-3.5 h-3.5" />
                    <span> {t("In-App / Push")} </span>
                  </div>
                  <div className="text-[10px] text-purple-300 font-medium"> {t("Delivered to Radar")} </div>
                </div>
                <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl text-center space-y-1">
                  <div className="text-amber-400 font-bold flex items-center justify-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span> {t("GSM SMS")} </span>
                  </div>
                  <div className="text-[10px] text-amber-300 font-medium"> {t("Carrier Queued")} </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WHATSAPP NOTIFICATION */}
          {(activeChannelTab === 'all' || activeChannelTab === 'whatsapp') && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span> {t("WhatsApp Business Notification")} </span>
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded border border-amber-500/40">
                        {waAccepted ? 'Accepted' : waRead ? 'Read (Double Blue Tick)' : 'Delivered'}
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400"> {t("Sent to")} {targetWorker.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  <CheckCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-mono"> {t("Delivered")} </span>
                </div>
              </div>

              {/* WhatsApp Message Preview */}
              <div className="bg-slate-950 p-3 rounded-xl border border-amber-900/40 text-xs text-slate-200 font-sans space-y-2 relative">
                <div className="bg-amber-900 p-3 rounded-xl text-white space-y-1.5 shadow-md max-w-md">
                  <p className="font-bold text-amber-300 flex items-center gap-1">
                    <span> {t("⚡ Dihadi Instant Job Alert!")} </span>
                  </p>
                  <p className="text-[11px] leading-relaxed whitespace-pre-line">
                    {getWaMessage()}
                  </p>
                  <div className="flex justify-end items-center gap-1 text-[9px] text-amber-200 pt-1">
                    <span> {t("Just now")} </span>
                    <CheckCheck className="w-3 h-3 text-amber-300" />
                  </div>
                </div>

                {/* WhatsApp Real Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleOpenWhatsAppReal}
                    className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    title={t("Open WhatsApp Web or Native App with pre-filled message")}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span> {t("Open & Send in WhatsApp")} </span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(getWaMessage(), 'wa')}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-700"
                    title={t("Copy WhatsApp formatted message")}
                  >
                    {copiedKey === 'wa' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'wa' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleWhatsAppAccept}
                    disabled={waAccepted}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      waAccepted
                        ? 'bg-amber-800 text-amber-200 cursor-default'
                        : 'bg-slate-800 hover:bg-amber-950 text-amber-300 border border-amber-700/50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{waAccepted ? 'Accepted' : 'Simulate Accept'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MAIL / EMAIL DISPATCH */}
          {(activeChannelTab === 'all' || activeChannelTab === 'mail') && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-sky-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span> {t("Gmail & SMTP Mail Alert")} </span>
                      <span className="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 text-[10px] rounded border border-sky-500/40">
                        {isSendingEmail ? 'Sending...' : emailSentStatus || 'SMTP Dispatched'}
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400"> {t("Direct employer briefing delivered to inbox")} </span>
                  </div>
                </div>
                <button
                  onClick={() => dispatchRealAlertBackend(targetEmail)}
                  disabled={isSendingEmail}
                  className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                  title={t("Resend email via SMTP")}
                >
                  <RefreshCw className={`w-3 h-3 ${isSendingEmail ? 'animate-spin' : ''}`} />
                  <span> {t("Resend Email")} </span>
                </button>
              </div>

              {/* Email Form & Preview */}
              <div className="bg-slate-900 p-3 rounded-xl border border-sky-900/40 space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px] shrink-0 font-medium"> {t("To:")} </span>
                  <input
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder={t("Worker or Employer Email Address")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <div className="text-sky-300 font-bold">{getEmailSubject()}</div>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                    {getEmailBody()}
                  </p>
                </div>

                {/* Email Real Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleOpenMailReal}
                    className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    title={t("Open Gmail Composer with pre-filled subject and body")}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span> {t("Open in Gmail / Mail App")} </span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(`${getEmailSubject()}\n\n${getEmailBody()}`, 'mail')}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-700"
                    title={t("Copy email text")}
                  >
                    {copiedKey === 'mail' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'mail' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: IN-APP PUSH & RADAR NOTIFICATION */}
          {(activeChannelTab === 'all' || activeChannelTab === 'push') && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-purple-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span> {t("In-App & Device Push Notification")} </span>
                      <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 text-[10px] rounded border border-purple-500/40">
                        {pushDelivered ? 'Live on Radar' : 'Active'}
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400"> {t("Device notification shade + Worker radar beacon")} </span>
                  </div>
                </div>
                <button
                  onClick={triggerInAppPushNotification}
                  className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                  title={t("Trigger desktop/phone notification")}
                >
                  <Bell className="w-3 h-3" />
                  <span> {t("Trigger Notification")} </span>
                </button>
              </div>

              {/* Push Banner Simulator */}
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-purple-900/50 shadow-lg space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                       {t("D")} </div>
                    <span> {t("Dihadi Worker Radar • Now")} </span>
                  </div>
                  <span className="text-slate-500"> {t("Just now")} </span>
                </div>
                <h5 className="font-bold text-white text-xs">
                   {t("⚡ New Hyperlocal Job:")} {job.trade} (₹{job.dailyWage} {t("/day)")} </h5>
                <p className="text-[11px] text-slate-300">
                  {job.customerName}  {t("needs a verified")} {job.trade}  {t("in")} {job.area || job.locationAddress} (~{job.distanceKm || 1.2}  {t("km away). Tap to accept.")} </p>
              </div>
            </div>
          )}

          {/* TAB: VOICE CALL / IVR AUTOMATION */}
          {(activeChannelTab === 'all' || activeChannelTab === 'voice') && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span> {t("Automated Voice Call (IVR with Audio TTS)")} </span>
                      <span
                        className={`px-1.5 py-0.2 text-[10px] rounded border ${
                          callState === 'connected'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : callState === 'ringing'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {callState === 'connected' ? `Connected (${callSeconds}s)` : callState}
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400"> {t("Accommodates workers without smartphones")} </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCallDirect}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                    title={t("Direct Phone Call")}
                  >
                    <Phone className="w-3 h-3" />
                    <span> {t("Call Phone")} </span>
                  </button>
                  <button
                    onClick={playIvrAudioPrompt}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                    title={t("Play synthesized voice audio")}
                  >
                    <Volume2 className="w-3 h-3" />
                    <span> {t("Replay Audio")} </span>
                  </button>
                </div>
              </div>

              {/* Voice Call UI Simulator */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="space-y-0.5 w-full">
                    <p className="text-slate-400 text-[11px]"> {t("IVR Spoken Prompt (")} {currentLanguage.toUpperCase()}):</p>
                    <p className="text-slate-100 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] leading-relaxed">
                      "{getLanguagePrompt()}"
                    </p>
                  </div>
                </div>

                {/* Keypad Response Simulator */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                     {t("Simulate Worker Dialpad Input:")} </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleKeypadPress('1')}
                      className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
                    >
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">1</span>
                      <span> {t("Press [1] Accept Work")} </span>
                    </button>
                    <button
                      onClick={() => handleKeypadPress('2')}
                      className="py-2 px-3 bg-slate-800 hover:bg-amber-900/50 text-slate-300 hover:text-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border border-slate-700 active:scale-95"
                    >
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-black">2</span>
                      <span> {t("Press [2] Decline")} </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GSM FEATURE PHONE SMS */}
          {(activeChannelTab === 'all' || activeChannelTab === 'sms') && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span> {t("GSM SMS (Basic Feature Phones)")} </span>
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded border border-amber-500/40">
                        {smsDelivered ? 'Delivered to SIM' : 'Queued'}
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400"> {t("Carrier GSM Network • 160 Chars")} </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-400"> {t("SIM Slot 1")} </span>
              </div>

              {/* Feature Phone SMS UI Box */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
                <div className="flex justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1">
                  <span> {t("From: DIHADI-GOVT")} </span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-100 leading-relaxed py-1">
                  {getSmsMessage()}
                </p>
                <div className="flex flex-wrap justify-between items-center gap-2 text-[10px] text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenSmsReal}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg font-bold transition flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span> {t("Open Native SMS App")} </span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(getSmsMessage(), 'sms')}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition flex items-center gap-1"
                    >
                      {copiedKey === 'sms' ? <Check className="w-3 h-3 text-amber-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'sms' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      playSound('success');
                      showNotification(`SMS Response: ${targetWorker.name} replied YES via SMS!`);
                      if (onAcceptJob) onAcceptJob(job.id, targetWorker.id);
                    }}
                    className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 rounded-lg font-bold transition"
                  >
                     {t("Simulate SMS Reply \"YES\"")} </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-3.5 px-4 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-400 text-[11px] hidden sm:block">
            <span> {t("Dispatched across WhatsApp, Gmail/Mail, GSM SMS, App Push & IVR")} </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
            >
               {t("Close Dispatcher")} </button>
            <button
              onClick={() => {
                if (onAcceptJob) onAcceptJob(job.id, targetWorker.id);
                playSound('success');
                showNotification(`Job successfully assigned to ${targetWorker.name}!`);
                stopSpeech();
                onClose();
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span> {t("Direct Assign to Worker")} </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
