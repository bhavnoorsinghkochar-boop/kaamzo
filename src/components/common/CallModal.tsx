import React, { useState, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  Sparkles,
  User,
  ExternalLink,
  Radio,
  MessageSquareQuote,
  Smartphone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { CallSession } from "../../types";
import { playSound, speakText } from "../../utils/audio";
import { useTranslation } from "react-i18next";

interface CallModalProps {
  callSession: CallSession | null;
  onEndCall: () => void;
  onAnswerCall?: () => void;
}
export const CallModal: React.FC<CallModalProps> = ({
  callSession,
  onEndCall,
  onAnswerCall,
}) => {
    const { t } = useTranslation();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<"ringing" | "connected" | "ended">(
    "ringing",
  );
  const [subtitledMessage, setSubtitledMessage] = useState<string | null>(null);
  const [showNormalCallPrompt, setShowNormalCallPrompt] = useState(false);

  // Call management: Ring until answered or ended
  useEffect(() => {
    if (!callSession) return;
    setStatus('ringing');
    setSeconds(0);
    setSubtitledMessage(null);
    setShowNormalCallPrompt(false);

    // Play ringing tone
    playSound('ring');
    const ringInterval = setInterval(() => {
      playSound('ring');
    }, 2800);

    // After 4.5 seconds of in-app ringing, highlight direct normal telephone fallback
    const fallbackTimer = setTimeout(() => {
      setShowNormalCallPrompt(true);
    }, 4500);

    return () => {
      clearInterval(ringInterval);
      clearTimeout(fallbackTimer);
    };
  }, [callSession?.id]);

  // Call duration counter
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (status === 'connected') {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status]);

  if (!callSession) return null;
  const cleanTargetPhone = (callSession.receiverPhone || '+91 98101 55678').replace(/[^0-9+]/g, '');

  const handleAnswer = () => {
    setStatus('connected');
    playSound('call_connect');
    if (onAnswerCall) {
      onAnswerCall();
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEnd = () => {
    playSound('call_end');
    setStatus('ended');
    setTimeout(() => {
      onEndCall();
    }, 300);
  };

  const handleSpeakSample = (phrase: string) => {
    setSubtitledMessage(phrase);
    speakText(phrase, 'hi');
  };

  const handleDirectNormalCall = () => {
    playSound('click');
    window.location.href = `tel:${cleanTargetPhone}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col items-center justify-between p-5 sm:p-6 min-h-[580px] max-h-[92vh] relative">
        {/* Top Status Bar */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="text-[11px] font-bold text-amber-300">
              {status === 'connected' ? 'VoIP Connected' : 'In-App Calling...'}
            </span>
          </div>
          <div className="font-mono font-bold text-slate-300 text-xs">
            {status === 'ringing' ? 'Ringing...' : formatTimer(seconds)}
          </div>
        </div>

        {/* Center Caller / Receiver Profile */}
        <div className="flex flex-col items-center space-y-3 my-auto w-full py-2">
          {/* Animated Avatar Waves */}
          <div className="relative">
            <div className="w-22 h-22 rounded-full bg-slate-800 border-4 border-amber-500 shadow-2xl flex items-center justify-center text-3xl font-black text-white relative z-10">
              {callSession.receiverName.charAt(0)}
            </div>
            {/* Ripple Circles when ringing or connected */}
            {status === 'ringing' && (
              <>
                <div className="absolute -inset-3 rounded-full border-2 border-amber-400 animate-ping opacity-40"></div>
                <div className="absolute -inset-6 rounded-full border border-amber-500 animate-pulse opacity-30"></div>
              </>
            )}
            {status === 'connected' && (
              <div className="absolute -inset-2 rounded-full border border-amber-400 animate-pulse opacity-60"></div>
            )}
          </div>

          {/* Name & Role */}
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-white tracking-tight">
              {callSession.receiverName}
            </h3>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              {callSession.receiverRole === 'worker' ? '🔨 Verified Worker' : '🏢 Employer / Client'}
            </p>
            {/* Interactive Phone Number Link */}
            <a
              href={`tel:${cleanTargetPhone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 font-mono text-xs font-bold rounded-xl border border-slate-700 transition"
              title={t("Click to dial this number on your phone")}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>{callSession.receiverPhone}</span>
            </a>
            {callSession.jobTitle && (
              <p className="text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700 truncate max-w-[260px] mx-auto mt-1">
                 {t("Job:")} {callSession.jobTitle}
              </p>
            )}
          </div>

          {/* Normal Phone Call Fallback Card (When In-App VoIP is waiting) */}
          {status === 'ringing' && (
            <div className="w-full bg-slate-800/90 border border-amber-500/40 rounded-2xl p-3 text-center space-y-2 animate-in fade-in slide-in-from-bottom-2 shadow-lg">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-black">
                <Smartphone className="w-3.5 h-3.5" />
                <span> {t("Normal Phone Call Fallback")} </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                 {t("If the recipient is not active inside the app right now, dial their regular phone number:")} </p>
              <a
                href={`tel:${cleanTargetPhone}`}
                onClick={() => playSound('click')}
                className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span> {t("Dial Normal Phone (")} {callSession.receiverPhone})</span>
              </a>
            </div>
          )}

          {/* Live Audio Subtitle / Speech Bubble */}
          {status === 'connected' && subtitledMessage && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 max-w-[280px] text-center space-y-1 animate-in fade-in slide-in-from-bottom-2 shadow-lg">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-400">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span> {t("Live Audio Transcript")} </span>
              </div>
              <p className="text-xs text-slate-200 font-medium italic leading-relaxed">
                "{subtitledMessage}"
              </p>
            </div>
          )}

          {/* Quick Voice Phrases (Interactive Simulation) */}
          {status === 'connected' && (
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleSpeakSample('मैं 5 मिनट में पहुँच रहा हूँ')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold border border-slate-700 transition"
              >
                 {t("\"5 min me aa raha hu\"")} </button>
              <button
                type="button"
                onClick={() => handleSpeakSample('स्टार्ट OTP 4829 है')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold border border-slate-700 transition"
              >
                 {t("\"OTP is 4829\"")} </button>
            </div>
          )}
        </div>

        {/* Bottom Call Controls */}
        <div className="w-full space-y-3 pt-2">
          {status === 'ringing' ? (
            <div className="flex flex-col items-center gap-2.5">
              <div className="flex items-center justify-center gap-6">
                {/* Cancel / End Call Button */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={handleEnd}
                    className="w-14 h-14 rounded-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-amber-900/50 transition cursor-pointer"
                    title={t("End / Cancel Call")}
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                  <span className="text-[10px] text-slate-400 font-semibold"> {t("End Call")} </span>
                </div>

                {/* Simulate Answer Button */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={handleAnswer}
                    className="w-14 h-14 rounded-full bg-amber-600 hover:bg-amber-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-amber-900/50 transition animate-bounce cursor-pointer"
                    title={t("Simulate In-App Connect / Answer")}
                  >
                    <Phone className="w-6 h-6" />
                  </button>
                  <span className="text-[10px] text-amber-400 font-bold"> {t("Answer (VoIP)")} </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-5">
              {/* Mute Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMuted(!isMuted);
                  playSound('click');
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                  isMuted ? 'bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleEnd}
                className="w-16 h-16 rounded-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-amber-900/50 transition cursor-pointer"
                title={t("End Call")}
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              {/* Speaker Button */}
              <button
                type="button"
                onClick={() => {
                  setIsSpeaker(!isSpeaker);
                  playSound('click');
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                  isSpeaker ? 'bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isSpeaker ? 'Speaker On' : 'Speaker Off'}
              >
                {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Direct Cellular Link in footer */}
          <div className="text-center pt-1 border-t border-slate-800">
            <a
              href={`tel:${cleanTargetPhone}`}
              className="text-[11px] text-slate-400 hover:text-amber-300 underline inline-flex items-center gap-1 font-semibold transition"
            >
              <ExternalLink className="w-3 h-3" />
              <span> {t("Direct GSM call:")} {callSession.receiverPhone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
