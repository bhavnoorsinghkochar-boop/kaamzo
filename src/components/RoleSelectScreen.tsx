import React from "react";
import { useApp } from "../context/AppContext";
import { getT } from "../utils/translations";
import { Logo } from "./common/Logo";
import { GoogleSSOButton } from "./common/GoogleSSOButton";
import { SSORolePickerModal } from "./common/SSORolePickerModal";
import {
  HardHat,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Building2,
  Volume2,
  ShieldCheck,
  Sparkles,
  Lock,
} from "lucide-react";
import { playSound } from "../utils/audio";
import { useTranslation } from "react-i18next";

export const RoleSelectScreen: React.FC = () => {
    const { t } = useTranslation();
  const {
    setCurrentRole,
    currentLanguage,
    jobs,
    workers,
    currentWorker,
    currentCustomer,
    currentCity,
    speak,
    ssoGoogleUser,
    isSSORoleModalOpen,
    setIsSSORoleModalOpen,
  } = useApp();

  const handleSelectRole = (
    role: "worker" | "customer" | "admin" | "pitch_deck",
  ) => {
    playSound("click");
    setCurrentRole(role);
    if (role === "worker") {
      if (currentLanguage === "en")
        speak("Opening Worker Portal. Please login or register.");
      else if (currentLanguage === "hi")
        speak("श्रमिक पोर्टल खुल रहा है। कृपया लॉगिन या पंजीकरण करें।");
      else if (currentLanguage === "pa")
        speak("ਕਾਮਾ ਪੋਰਟਲ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਲਾਗਇਨ ਜਾਂ ਰਜਿਸਟਰ ਕਰੋ।");
    } else if (role === "customer") {
      if (currentLanguage === "en")
        speak(
          "Opening Employer Portal. Post daily jobs and hire verified workers.",
        );
      else if (currentLanguage === "hi")
        speak("नियोक्ता पोर्टल खुल रहा है। काम पोस्ट करें और कारीगर खोजें।");
      else if (currentLanguage === "pa")
        speak(
          "ਮਾਲਕ ਪੋਰਟਲ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ। ਨਵਾਂ ਕੰਮ ਪੋਸਟ ਕਰੋ ਅਤੇ ਕਾਮਾ ਬੁੱਕ ਕਰੋ।",
        );
    } else if (role === "admin") {
      if (currentLanguage === "en")
        speak("Opening Platform Admin Headquarters.");
      else if (currentLanguage === "hi") speak("एडमिन मुख्यालय खुल रहा है।");
      else if (currentLanguage === "pa")
        speak("ਐਡਮਿਨ ਮੁੱਖ ਦਫ਼ਤਰ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ।");
    }
  };

  const handleSpeakWorkerCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("click");
    if (currentLanguage === "en") {
      speak("Worker Portal: Receive direct daily wage job offers, earn transparent wages, and withdraw instantly via UPI.");
    } else if (currentLanguage === "hi") {
      speak("श्रमिक पोर्टल: सीधे काम के ऑफर पाएं, तय मजदूरी कमाएं और तुरंत यूपीआई से पैसे निकालें।");
    } else if (currentLanguage === "pa") {
      speak("ਕਾਮਾ ਪੋਰਟਲ: ਸਿੱਧੇ ਰੋਜ਼ਾਨਾ ਕੰਮ ਲਓ, ਪੱਕੀ ਦਿਹਾੜੀ ਕਮਾਓ ਅਤੇ ਤੁਰੰਤ ਯੂਪੀਆਈ ਰਾਹੀਂ ਪੈਸੇ ਕਢਵਾਓ।");
    }
  };

  const cityName = currentCity?.name || "Ludhiana";

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center space-y-8 select-none">
      {/* Top Banner / Hero */}
      <div className="text-center space-y-3 max-w-2xl">
        {/* User-facing Trust Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#efef01] border border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-[#FFE57F] rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full text-[#361400] bg-[#463900] animate-pulse"></span>
          <span className="text-[#0c0c0c]">{getT(currentLanguage, "hero_trust_badge")}</span>
        </div>

        <div className="flex flex-col items-center">
          <Logo className="text-4xl sm:text-5xl mb-4 mt-2" />
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 text-center tracking-tight">
            {getT(currentLanguage, "choose_portal_title")}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-xl mx-auto">
          {getT(currentLanguage, "choose_portal_sub")}
        </p>

        {/* Global Google SSO 1-Click Fast Auth */}
        <div className="pt-2 max-w-xl mx-auto w-full">
          <GoogleSSOButton
            variant="hero"
            label={t("Continue with Google SSO")}
            subLabel="Fast 1-click access for Workers & Employers with instant identity verification"
          />
        </div>
      </div>

      {/* 2 Primary Role Selection Cards: Worker & Customer */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl relative z-10">
        {/* Card 1: Worker Portal */}
        <div className="relative group">
          {/* Subtle Golden Ambient Glow on hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-[28px] blur-md opacity-0 group-hover:opacity-30 dark:group-hover:opacity-40 transition duration-300 pointer-events-none" />
          
          <div
            onClick={() => handleSelectRole("worker")}
            className="relative h-full bg-white dark:bg-[#242424] rounded-3xl p-6 sm:p-7 border-2 border-slate-200 dark:border-[#383838] group-hover:border-amber-500 dark:group-hover:border-[#FCD33F] group-hover:shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              {/* Top row with icon & prominent voice button */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-amber-50 dark:bg-[#2A2A2A] rounded-2xl flex items-center justify-center text-amber-600 dark:text-[#FCD33F] border border-amber-200 dark:border-[#383838] group-hover:scale-105 transition">
                  <HardHat className="w-8 h-8" />
                </div>
                
                {/* Prominent Audio/TTS Button for Workers */}
                <button
                  onClick={handleSpeakWorkerCard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#efef01] hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-[#090908] rounded-xl text-xs font-bold transition border border-amber-300 dark:border-amber-700/60 shadow-2xs min-h-[36px]"
                  title={t("Listen in Voice Audio")}
                  aria-label="Listen to worker card audio"
                >
                  <Volume2 className="w-4 h-4 text-[#000000] shrink-0" />
                  <span>{getT(currentLanguage, "speak_worker_card")}</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-[#FCD33F] transition">
                    {getT(currentLanguage, "role_worker_title")}
                  </h3>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-[#FFE57F] border border-amber-300 dark:border-amber-700/60">
                    {getT(currentLanguage, "role_worker_badge")}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                  {getT(currentLanguage, "role_worker_desc")}
                </p>
              </div>

              {/* Illustrative Callout Points */}
              <div className="bg-slate-50 dark:bg-[#1E1E1E] p-3.5 rounded-2xl border border-slate-200 dark:border-[#333333] space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-[#FCD33F] shrink-0" />
                  <span>
                    {currentWorker ? (
                      <strong className="text-amber-800 dark:text-[#FFE57F]">
                         {t("Active Account:")} {currentWorker.name} ({currentWorker.primaryTrade})
                      </strong>
                    ) : (
                      <span>{getT(currentLanguage, "example_worker_stat")}</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-[#FCD33F] shrink-0" />
                  <span>{getT(currentLanguage, "example_worker_sub")}</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-[#1C1C1C] hover:bg-slate-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 py-3.5 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 shadow-sm min-h-[48px]">
              <UserCheck className="w-4 h-4" />
              <span>{getT(currentLanguage, "role_worker_btn")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: Customer / Employer Portal */}
        <div className="relative group">
          {/* Subtle Golden Ambient Glow on hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-[28px] blur-md opacity-0 group-hover:opacity-30 dark:group-hover:opacity-40 transition duration-300 pointer-events-none" />

          <div
            onClick={() => handleSelectRole("customer")}
            className="relative h-full bg-white dark:bg-[#242424] rounded-3xl p-6 sm:p-7 border-2 border-slate-200 dark:border-[#383838] group-hover:border-amber-600 dark:group-hover:border-[#FCD33F] group-hover:shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-amber-50 dark:bg-[#2A2A2A] rounded-2xl flex items-center justify-center text-amber-600 dark:text-[#FCD33F] border border-amber-200 dark:border-[#383838] group-hover:scale-105 transition">
                  <Briefcase className="w-8 h-8" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-[#FFE57F] border border-amber-300 dark:border-amber-700/60">
                  {getT(currentLanguage, "role_customer_badge")}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-[#FCD33F] transition">
                    {getT(currentLanguage, "role_customer_title")}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-medium">
                  {getT(currentLanguage, "role_customer_desc")}
                </p>
              </div>

              {/* Illustrative Callout Points */}
              <div className="bg-slate-50 dark:bg-[#1E1E1E] p-3.5 rounded-2xl border border-slate-200 dark:border-[#333333] space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-[#FCD33F] shrink-0" />
                  <span>
                    {currentCustomer ? (
                      <strong className="text-amber-800 dark:text-[#FFE57F]">
                         {t("Active Account:")} {currentCustomer.name} ({currentCustomer.area})
                      </strong>
                    ) : (
                      <span>{getT(currentLanguage, "example_customer_stat")}</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-[#FCD33F] shrink-0" />
                  <span>{getT(currentLanguage, "example_customer_sub")}</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-amber-500 hover:bg-amber-600 dark:bg-[#FCD33F] dark:hover:bg-[#FACC15] text-slate-950 py-3.5 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 shadow-sm min-h-[48px]">
              <Building2 className="w-4 h-4" />
              <span>{getT(currentLanguage, "role_customer_btn")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Platform Status Bar & Subtle De-emphasized Admin Link */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#242424] px-4 py-3 rounded-2xl border border-slate-200 dark:border-[#383838] gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {cityName}:
          </span>
          <span>
            {workers.length} {getT(currentLanguage, "workers_count_label")}  {t("active •")} {jobs.length} {getT(currentLanguage, "jobs_count_label")}  {t("posted")} </span>
        </div>

        {/* Muted Admin Login Button per requirement #2 & #6 */}
        <button
          onClick={() => handleSelectRole("admin")}
          className="px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-amber-300 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 hover:bg-slate-200/60 dark:hover:bg-[#2A2A2A] border border-transparent hover:border-slate-300 dark:hover:border-[#383838]"
          title={t("Platform administrator access")}
        >
          <Lock className="w-3.5 h-3.5 opacity-70" />
          <span>{getT(currentLanguage, "admin_footer_link")}</span>
        </button>
      </div>
      {/* SSO Role Selection Modal for New / Multi-Role Users */}
      <SSORolePickerModal
        isOpen={isSSORoleModalOpen}
        onClose={() => setIsSSORoleModalOpen(false)}
        googleUser={ssoGoogleUser}
      />
    </div>
  );
};

