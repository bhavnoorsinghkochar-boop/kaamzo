import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Phone,
  Volume2,
  CheckCheck,
  Sparkles,
  MapPin,
  Radio,
  Mic,
  MicOff,
  KeyRound,
  Smile,
  ShieldCheck,
  Info,
  Clock,
  MessageCircle,
  Copy,
  ExternalLink,
  Navigation,
} from "lucide-react";
import {
  Job,
  ChatMessage,
  WorkerProfile,
  CustomerProfile,
  Language,
} from "../../types";
import { playSound, speakText } from "../../utils/audio";
import { useTranslation } from "react-i18next";

export interface ChatTarget {
  name: string;
  role: "worker" | "customer" | "admin";
  phone?: string;
  email?: string;
  trade?: string;
  area?: string;
  avatar?: string;
  upiId?: string;
  dailyRate?: number;
}
interface QuickChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job | null;
  targetPerson?: ChatTarget | null;
  currentUserRole: "worker" | "customer" | "admin";
  currentUserName: string;
  currentUserPhone?: string;
  onStartCall?: () => void;
  onOpenRadar?: () => void;
  currentLanguage?: Language;
}
export const QuickChatModal: React.FC<QuickChatModalProps> = ({
  isOpen,
  onClose,
  job,
  targetPerson,
  currentUserRole,
  currentUserName,
  currentUserPhone,
  onStartCall,
  onOpenRadar,
  currentLanguage = "en",
}) => {
    const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  // Determine other person info
  const otherPersonName = targetPerson?.name || ( currentUserRole === 'worker' ? (job?.customerName || 'Employer') : (job?.assignedWorkerName || 'Assigned Worker') );
  const otherPersonRole = targetPerson?.role ? (targetPerson.role === 'worker' ? 'Worker' : 'Employer') : (currentUserRole === 'worker' ? 'Employer' : 'Worker');
  const otherPersonPhone = targetPerson?.phone || ( currentUserRole === 'worker' ? job?.customerPhone : job?.assignedWorkerPhone ) || '+91 98101 55678';
  const otherPersonTrade = targetPerson?.trade || job?.trade || (currentUserRole === 'customer' ? 'Worker' : 'Employer');
  const jobTitle = job?.title || `Direct Inquiry for ${otherPersonTrade}`;
  const jobLocation = job?.locationAddress || job?.area || targetPerson?.area || 'Ludhiana, Punjab';
  const dailyWage = job?.workerPayout || job?.dailyWage || targetPerson?.dailyRate || 850;
  const startOtp = job?.otpCode || '';

  // Conversation storage key
  const conversationId = job?.id 
    ? `job_${job.id}` 
    : `direct_${[currentUserPhone || '', otherPersonPhone || ''].map(p => p.replace(/[^0-9]/g, '')).sort().join('_')}`;
  const storageKey = `dihadi_chat_v7_${conversationId}`;

  // Initial welcome seed messages if conversation is empty
  const getDefaultMessages = (): ChatMessage[] => {
    return [];
  };

  // Load messages from localStorage
  const loadMessages = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          return;
        }
      }
      setMessages([]);
    } catch (e) {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadMessages();

    // Listen to storage sync events across tabs / views
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          setMessages(JSON.parse(e.newValue));
        } catch (err) {
          console.debug(err);
        }
      }
    };

    const handleCustomSync = (e: any) => {
      if (e.detail?.key === storageKey) {
        loadMessages();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('dihadi_chat_sync', handleCustomSync);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dihadi_chat_sync', handleCustomSync);
    };
  }, [isOpen, storageKey]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  // Focus input on open
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const [sentToast, setSentToast] = useState<{ text: string; recipient: string } | null>(null);

  const saveAndBroadcastMessages = (newMsgs: ChatMessage[]) => {
    setMessages(newMsgs);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newMsgs));
      window.dispatchEvent(new CustomEvent('dihadi_chat_sync', { detail: { key: storageKey } }));
    } catch (e) {
      console.debug('Storage error:', e);
    }
  };

  const handleSendMessage = (textToSend?: string, isQuick: boolean = false) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const senderDisplayName = currentUserName || (currentUserRole === 'worker' ? 'Worker' : 'Employer');
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      jobId: job?.id || conversationId,
      senderRole: currentUserRole,
      senderName: senderDisplayName,
      senderPhone: currentUserPhone,
      text,
      timestamp: timeString,
      createdAt: Date.now(),
      status: 'delivered',
      isQuickReply: isQuick,
    };
    const updated = [...messages, newMsg];
    saveAndBroadcastMessages(updated);
    setInputText('');
    playSound('chat_sent');

    // Show instant in-modal confirmation toast
    setSentToast({ text, recipient: otherPersonName });
    setTimeout(() => setSentToast(null), 3200);

    // Dispatch global chat notification event so popup appears on opposite party's screen
    try {
      const recipientRoleType = otherPersonRole.toLowerCase();
      window.dispatchEvent(
        new CustomEvent('dihadi_chat_message_event', {
          detail: {
            id: `notif-${newMsg.id}`,
            senderRole: currentUserRole,
            senderName: senderDisplayName,
            senderPhone: currentUserPhone,
            recipientRole: recipientRoleType,
            recipientName: otherPersonName,
            text: text,
            timestamp: timeString,
            jobTitle: jobTitle,
            jobId: job?.id || conversationId,
            job: job,
            targetPerson: {
              name: senderDisplayName,
              phone: currentUserPhone,
              role: currentUserRole,
              trade: otherPersonTrade,
            },
            isSender: true,
          },
        })
      );
      
      if (recipientRoleType === 'admin') {
        setTimeout(() => {
          const autoMsg = {
            id: 'msg-' + Date.now() + '-admin',
            jobId: job?.id || conversationId,
            senderRole: 'admin' as const,
            senderName: 'Kaamzo Support',
            senderPhone: '+91 95922 21100',
            text: 'Thank you for reaching out. We have received your message. A human agent will connect with you via WhatsApp or phone call shortly. For immediate assistance, please use the WhatsApp button above.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: Date.now(),
            status: 'delivered' as const,
            isQuickReply: false,
          };
          const updatedWithAdmin = [...updated, autoMsg];
          saveAndBroadcastMessages(updatedWithAdmin);
          playSound('message');
        }, 1500);
      }

    } catch (err) {
      console.debug('Event dispatch error:', err);
    }
  }; /* Real Speech Recognition or Voice Simulation */ const toggleVoiceRecording = () => { const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition; if (isRecording) { if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} } setIsRecording(false); setSpeechFeedback(null); return; } if (SpeechRecognition) { try { const recognition = new SpeechRecognition(); recognitionRef.current = recognition; recognition.continuous = false; recognition.interimResults = true; recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'pa' ? 'pa-IN' : 'en-IN'; recognition.onstart = () => { setIsRecording(true); setSpeechFeedback('Listening... Speak into microphone'); playSound('gps_ping'); }; recognition.onresult = (event: any) => { const transcript = Array.from(event.results) .map((result: any) => result[0].transcript) .join(''); setInputText(transcript); setSpeechFeedback(`Heard:"${transcript}"`); }; recognition.onerror = () => { setIsRecording(false); setSpeechFeedback('Microphone unavailable. Type your message below.'); setTimeout(() => setSpeechFeedback(null), 2500); }; recognition.onend = () => { setIsRecording(false); setSpeechFeedback(null); }; recognition.start(); return; } catch (err) { console.debug('Speech recognition init note:', err); } } setIsRecording(false); setSpeechFeedback('Voice input not supported in this browser.'); setTimeout(() => setSpeechFeedback(null), 2500); }; const handleTtsSpeak = (text: string) => { speakText(text, (currentLanguage as 'en' | 'hi' | 'pa') || 'en'); }; const handleOpenWhatsApp = () => { const cleanPhone = otherPersonPhone.replace(/[^0-9]/g, ''); const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone; const msg = encodeURIComponent( `Hello ${otherPersonName}, this is ${currentUserName} from Dihadi platform regarding ${jobTitle}.` ); window.open(`https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${msg}`, '_blank'); }; const copyTranscript = () => { const text = messages.map(m => `[${m.timestamp}] ${m.senderName}: ${m.text}`).join('\n'); navigator.clipboard?.writeText(text); setCopiedTranscript(true); playSound('click'); setTimeout(() => setCopiedTranscript(false), 2000); }; /* Quick Reply Options tailored by role */ const workerQuickReplies = [ { label: '📍 Reached site entrance', text:"📍 I have reached the work location / main gate." }, { label: '🔑 Need Start OTP', text:"🔑 Please share the 4-digit start OTP to begin work." }, { label: '🛠️ Starting work now', text:"🛠️ Setting up tools and starting the assignment now." }, { label: '🧱 Material check needed', text:"🧱 Please check if additional cement/sand/tools are needed." }, { label: '🚲 On way (ETA 10 min)', text:"🚲 On my way to the site, estimated arrival in 10 minutes." }, { label: '✅ Work completed', text:"✅ Work is completed! Please inspect and release payment." }, ]; const customerQuickReplies = [ { label: '👍 Come to main gate', text:"👍 Noted, please come inside through the main gate." }, ...(startOtp ? [{ label: `🔢 OTP is #${startOtp}`, text: `🔢 Your start OTP is ${startOtp}. Please start the job!` }] : []), { label: '💧 Water & washroom on site', text:"💧 Drinking water and washroom are available on the ground floor." }, { label: '⏳ Reaching in 5 mins', text:"⏳ I am reaching the spot in 5 minutes." }, { label: '💳 Releasing UPI wage', text:"💳 Inspected the work, releasing your UPI daily wage now!" }, ]; const activeQuickReplies = currentUserRole === 'worker' ? workerQuickReplies : customerQuickReplies; if (!isOpen) return null; return ( <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose} > <div className="bg-white text-slate-900 w-full max-w-lg rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200 overflow-hidden flex flex-col h-full sm:h-[90vh] max-h-[100dvh] sm:max-h-[700px] animate-scale-up" onClick={(e) => e.stopPropagation()} > {/* Modal Header */} <div className="bg-slate-900 text-white p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between shrink-0"> <div className="flex items-center gap-3 min-w-0"> <div className="relative"> <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shrink-0 shadow-xs"> {otherPersonName.charAt(0)} </div> <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-slate-900 animate-pulse" /> </div> <div className="min-w-0"> <div className="flex items-center gap-2"> <h3 className="font-black text-sm text-white truncate"> {otherPersonName} </h3> <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold shrink-0"> {otherPersonRole} </span> </div> <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5"> <MapPin className="w-3 h-3 text-slate-500 shrink-0" /> <span className="truncate">{jobTitle} • {jobLocation}</span> </p> </div> </div> <div className="flex items-center gap-1.5 shrink-0"> {/* Direct WhatsApp External Trigger */} <button type="button" onClick={handleOpenWhatsApp} className="p-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-xl transition border border-amber-500/30" title={t("Open WhatsApp Chat")} > <MessageCircle className="w-4 h-4" /> </button> {onOpenRadar && ( <button type="button" onClick={onOpenRadar} className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition border border-slate-700" title={t("View GPS Route Radar")} > <Radio className="w-4 h-4" /> </button> )} {onStartCall ? ( <button type="button" onClick={onStartCall} className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition shadow-xs" title={`Call ${otherPersonName}`} > <Phone className="w-4 h-4" /> </button> ) : ( <a href={`tel:${otherPersonPhone}`} className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition shadow-xs flex items-center justify-center" title={`Dial ${otherPersonPhone}`} > <Phone className="w-4 h-4" /> </a> )} <button type="button" onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition ml-1" > <X className="w-4 h-4" /> </button> </div> </div> {/* Live Context Banner (OTP & Wage Information) */} <div className="bg-amber-50 px-3.5 py-2 border-b border-amber-200/80 flex items-center justify-between gap-2 shrink-0 text-xs"> <div className="flex items-center gap-1.5 min-w-0"> <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-black text-[10px] uppercase shrink-0"> {job?.status === 'accepted' ? 'Pending Start OTP' : job?.status === 'in_progress' ? 'Work In Progress' : 'Active Order'} </span> <span className="text-slate-600 truncate font-medium"> {t("Daily Wage:")} <strong className="text-amber-700">₹{dailyWage}</strong></span> </div> {startOtp ? ( <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs shrink-0"> <KeyRound className="w-3.5 h-3.5 text-amber-600" /> <span className="text-[11px] font-mono font-bold text-slate-800">  {t("Start OTP:")} <strong className="text-amber-600 text-xs">{startOtp}</strong> </span> </div> ) : ( <button onClick={copyTranscript} className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium shrink-0" > <Copy className="w-3 h-3" /> <span>{copiedTranscript ? 'Copied!' : 'Copy Chat'}</span> </button> )} </div> {/* Dynamic Sent Confirmation Pop-up Banner */} {sentToast && ( <div className="bg-amber-600 text-white text-xs px-4 py-2 flex items-center justify-between shadow-inner animate-in slide-in-from-top duration-200 shrink-0"> <div className="flex items-center gap-2 truncate"> <CheckCheck className="w-4 h-4 text-amber-200 shrink-0" /> <span className="font-semibold truncate">  {t("Message sent to")} <span className="underline font-bold">{sentToast.recipient}</span>:"{sentToast.text.slice(0, 32)}{sentToast.text.length > 32 ? '...' : ''}" </span> </div> <span className="text-[10px] text-amber-200 font-mono shrink-0 ml-2"> {t("✓ Delivered")} </span> </div> )} {/* Chat Messages List */} <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60"> {/* Security Notice */} <div className="text-center my-1"> <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-200/80 text-slate-600 rounded-full text-[10px] font-semibold"> <ShieldCheck className="w-3 h-3 text-amber-600" /> <span> {t("Dihadi Safe Chat • Escrow Protected • Instant 10km GPS Verification")} </span> </span> </div> {messages.map((msg) => { const isMe = msg.senderRole === currentUserRole; return ( <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`} > <div className={`max-w-[84%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-xs space-y-1 ${ isMe ? 'bg-amber-500 text-slate-950 rounded-tr-xs' : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs' }`} > {/* Sender Name for Clarity */} {!isMe && ( <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1"> <span className="text-[10px] font-black text-slate-700"> {msg.senderName} </span> <button type="button" onClick={() => handleTtsSpeak(msg.text)} className="text-slate-400 hover:text-amber-600 transition" title={t("Listen to message in Indian accent audio")} > <Volume2 className="w-3 h-3" /> </button> </div> )} <p className="text-xs leading-relaxed font-medium break-words"> {msg.text} </p> <div className={`flex items-center justify-end gap-1 text-[9px] pt-0.5 ${ isMe ? 'text-amber-950/70 font-semibold' : 'text-slate-400' }`}> <span>{msg.timestamp}</span> {isMe && <CheckCheck className="w-3 h-3 text-amber-950" />} </div> </div> </div> ); })} <div ref={messagesEndRef} /> </div> {/* Speech Feedback if Active */} {speechFeedback && ( <div className="px-4 py-1.5 bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-between border-t border-amber-200"> <span className="flex items-center gap-1.5"> <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> <span>{speechFeedback}</span> </span> <button type="button" onClick={() => { setIsRecording(false); setSpeechFeedback(null); }} className="text-amber-700 hover:text-amber-950 text-[10px] font-black uppercase" >  {t("Cancel")} </button> </div> )} {/* 1-Tap Quick Reply Chips */} <div className="bg-white border-t border-slate-100 px-3 py-2 shrink-0"> <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider"> <Sparkles className="w-3 h-3 text-amber-500" /> <span> {t("1-Tap Quick Responses")} </span> </div> <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"> {activeQuickReplies.map((qr, idx) => ( <button key={idx} type="button" onClick={() => handleSendMessage(qr.text, true)} className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-950 hover:border-amber-300 text-slate-700 text-[11px] font-medium rounded-full border border-slate-200 whitespace-nowrap transition shrink-0 cursor-pointer" > {qr.label} </button> ))} </div> </div> {/* Input Bar */} <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="bg-white p-3 border-t border-slate-200 flex items-center gap-2 shrink-0" > <button type="button" onClick={toggleVoiceRecording} className={`p-2.5 rounded-xl transition border flex items-center justify-center shrink-0 ${ isRecording ? 'bg-amber-500 text-white border-amber-600 animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' }`} title={isRecording ?"Stop Listening" :"Speak voice message (Speech-to-Text)"} > {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />} </button> <input ref={inputRef} type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={isRecording ? 'Listening to speech...' : `Message ${otherPersonName}...`} className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-amber-500 focus:bg-white transition" /> <button type="submit" disabled={!inputText.trim()} className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-bold rounded-xl transition shadow-xs flex items-center justify-center shrink-0 cursor-pointer" title={t("Send Message")} > <Send className="w-4 h-4" /> </button> </form> </div> </div> );
};
