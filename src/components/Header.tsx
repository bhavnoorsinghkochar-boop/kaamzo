import { PWAInstallButton } from "./common/PWAInstallButton";
import { AppExtensionModal } from "./common/AppExtensionModal";
import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Language, CityInfo } from "../types";
import { getT } from "../utils/translations";
import { Logo } from "./common/Logo";
import {
  Settings,
  Volume2,
  RotateCcw,
  ArrowLeftRight,
  HardHat,
  Briefcase,
  Shield,
  Sparkles,
  LayoutGrid,
  MapPin,
  Compass,
  Loader2,
  ChevronDown,
  Moon,
  Sun,
  Globe,
  Check,
  Smartphone,
} from "lucide-react";
import { applyGoogleTranslateLanguage } from "../utils/googleTranslate";
import { useTranslation } from "react-i18next";

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    currentRole,
    setCurrentRole,
    currentLanguage,
    setCurrentLanguage,
    isDarkMode,
    toggleTheme,
    currentCity,
    setCurrentCity,
    supportedCities,
    detectAndSetLiveLocation,
    isLocating,
    resetToZero,
    seedSampleData,
    speak,
  } = useApp();

  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isAppExtModalOpen, setIsAppExtModalOpen] = useState(false);

  const cityMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityMenuRef.current &&
        !cityMenuRef.current.contains(event.target as Node)
      ) {
        setShowCityMenu(false);
      }
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setShowLangMenu(false);
      }
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLangChange = (lang: Language) => {
    setCurrentLanguage(lang);
    setShowLangMenu(false);
    
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(lang);
    }

    applyGoogleTranslateLanguage(lang);

    if (lang === "hi") {
      speak("भाषा बदलकर हिंदी कर दी गई है");
    } else if (lang === "pa") {
      speak("ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲੀ ਗਈ ਹੈ");
    } else {
      speak("Language changed to English");
    }
  };

  const getRoleLabel = () => {
    if (currentRole === "worker")
      return getT(currentLanguage, "role_worker_title");
    if (currentRole === "customer")
      return getT(currentLanguage, "role_customer_title");
    if (currentRole === "admin")
      return getT(currentLanguage, "role_admin_title");
    return getT(currentLanguage, "select_role");
  };

  const getLangDisplayName = (lang: Language) => {
    if (lang === "hi") return "हिन्दी";
    if (lang === "pa") return "ਪੰਜਾਬੀ";
    return "EN";
  };

  return (
    <header className="relative h-16 bg-white dark:bg-[#1C1C1C] border-b border-slate-200 dark:border-[#383838] flex items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 shadow-xs shrink-0 z-30 sticky top-0 transition-colors gap-2">
      {/* Left: Brand Text & Active Role Status */}
      <div className="flex items-center gap-1.5 sm:gap-3 z-10 shrink-0">
        <Logo
          onClick={() => setCurrentRole("select_role")}
          className="text-xl sm:text-2xl md:text-[26px] tracking-tight hover:opacity-90 transition cursor-pointer"
        />
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            {/* Active Role Tag */}
            <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-[#2A2A2A] text-amber-900 dark:text-[#FFE57F] text-xs font-bold rounded-lg border border-amber-200 dark:border-[#383838] flex items-center gap-1.5 shadow-2xs">
              {currentRole === "worker" && (
                <HardHat className="w-3.5 h-3.5 text-amber-600 dark:text-[#FCD33F]" />
              )}
              {currentRole === "customer" && (
                <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-[#FCD33F]" />
              )}
              {currentRole === "admin" && (
                <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-[#FCD33F]" />
              )}
              {currentRole === "select_role" && (
                <LayoutGrid className="w-3.5 h-3.5 text-amber-600 dark:text-[#FCD33F]" />
              )}
              <span>{getRoleLabel()}</span>
            </span>
          </div>
          <p className="hidden lg:block text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-1">
            {getT(currentLanguage, "brand_tagline")}
          </p>
        </div>
        {currentRole !== "select_role" && (
          <button
            onClick={() => setCurrentRole("select_role")}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 ml-1 bg-amber-50 hover:bg-amber-100 dark:bg-[#2A2A2A] dark:hover:bg-[#333333] text-amber-950 dark:text-amber-200 rounded-xl text-xs font-bold transition border border-amber-200 dark:border-[#383838] min-h-[36px] shrink-0"
            title={t("Switch to another role")}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-700 dark:text-[#FCD33F]" />
            <span className="hidden sm:inline">
              {getT(currentLanguage, "switch_role")}
            </span>
          </button>
        )}
      </div>

      {/* Right: City Selector, Language Dropdown & Settings Dropdown */}
      <div className="flex items-center gap-1 sm:gap-2 z-10 shrink-0">
        <div className="hidden sm:block">
          <PWAInstallButton />
        </div>
        {/* City Location Dropdown & Calibrate GPS */}
        <div className="relative" ref={cityMenuRef}>
          <div className="flex items-center bg-amber-50/90 dark:bg-[#282828] border border-amber-200/80 dark:border-[#383838] rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => {
                setShowCityMenu(!showCityMenu);
                setShowLangMenu(false);
                setShowSettingsMenu(false);
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[#4f4843] bg-[#ffc800] hover:bg-amber-100/70 dark:hover:bg-[#333333] rounded-lg text-xs font-bold transition min-h-[36px]"
              title={t("Change active operating city")}
            >
              <MapPin className="w-3.5 h-3.5 text-[#1c1c1c] shrink-0" />
              <span className="max-w-[70px] sm:max-w-[100px] md:max-w-[120px] truncate">
                {currentCity ? currentCity.name : "Ludhiana"}
              </span>
              <ChevronDown className="w-3 h-3 text-[#101010] opacity-80" />
            </button>
            <button
              onClick={() => detectAndSetLiveLocation()}
              disabled={isLocating}
              className="p-1 px-1.5 sm:px-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 text-slate-950 rounded-lg text-[11px] font-black flex items-center gap-1 transition disabled:opacity-50 min-h-[34px]"
              title={t("Calibrate live GPS from your device")}
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Compass className="w-3.5 h-3.5" />
              )}
              <span className="hidden lg:inline">
                {isLocating ? "..." : "GPS"}
              </span>
            </button>
          </div>

          {/* City Selection Dropdown Menu */}
          {showCityMenu && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#242424] rounded-2xl shadow-xl border border-slate-200 dark:border-[#383838] py-1.5 z-50 animate-in fade-in">
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-[#333333] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                   {t("Select Operating City")} </span>
                <span className="text-[10px] text-amber-700 dark:text-[#FCD33F] font-bold">
                   {t("5 Active Hubs")} </span>
              </div>
              {supportedCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setCurrentCity(city);
                    setShowCityMenu(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-xs font-semibold flex items-center justify-between transition ${
                    currentCity?.id === city.id
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-[#FFE57F] font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2E2E2E]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin
                      className={`w-4 h-4 ${
                        currentCity?.id === city.id
                          ? "text-amber-600 dark:text-[#FCD33F]"
                          : "text-slate-400"
                      }`}
                    />
                    <div>
                      <p className="leading-tight">{city.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">
                        {city.state} • {city.defaultArea}
                      </p>
                    </div>
                  </div>
                  {currentCity?.id === city.id && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Compact Language Selector Dropdown */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowCityMenu(false);
              setShowSettingsMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-[#282828] dark:hover:bg-[#333333] text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition border border-slate-200 dark:border-[#383838] min-h-[38px] shadow-2xs"
            title={t("Change Language / ਭਾਸ਼ਾ ਬਦਲੋ / भाषा बदलें")}
            aria-label="Language selection"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-[#FCD33F]" />
            <span>{getLangDisplayName(currentLanguage)}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400 opacity-75" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#242424] rounded-2xl shadow-xl border border-slate-200 dark:border-[#383838] py-1.5 z-50 animate-in fade-in">
              <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-[#333333]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                   {t("Select Language")} </span>
              </div>
              <button
                onClick={() => handleLangChange("en")}
                className={`w-full px-3.5 py-2.5 text-left text-xs font-semibold flex items-center justify-between transition ${
                  currentLanguage === "en"
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-[#FFE57F] font-bold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2E2E2E]"
                }`}
              >
                <span> {t("English (EN)")} </span>
                {currentLanguage === "en" && (
                  <Check className="w-4 h-4 text-amber-600 dark:text-[#FCD33F]" />
                )}
              </button>
              <button
                onClick={() => handleLangChange("hi")}
                className={`w-full px-3.5 py-2.5 text-left text-xs font-semibold flex items-center justify-between transition ${
                  currentLanguage === "hi"
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-[#FFE57F] font-bold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2E2E2E]"
                }`}
              >
                <span> {t("हिन्दी (Hindi)")} </span>
                {currentLanguage === "hi" && (
                  <Check className="w-4 h-4 text-amber-600 dark:text-[#FCD33F]" />
                )}
              </button>
              <button
                onClick={() => handleLangChange("pa")}
                className={`w-full px-3.5 py-2.5 text-left text-xs font-semibold flex items-center justify-between transition ${
                  currentLanguage === "pa"
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-[#FFE57F] font-bold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2E2E2E]"
                }`}
              >
                <span> {t("ਪੰਜਾਬੀ (Punjabi)")} </span>
                {currentLanguage === "pa" && (
                  <Check className="w-4 h-4 text-amber-600 dark:text-[#FCD33F]" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Unified Settings Gear Icon Dropdown (Dark Mode + Audio Assist + Dev Tools) */}
        <div className="relative" ref={settingsMenuRef}>
          <button
            onClick={() => {
              setShowSettingsMenu(!showSettingsMenu);
              setShowCityMenu(false);
              setShowLangMenu(false);
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-[#282828] dark:hover:bg-[#333333] text-slate-700 dark:text-slate-200 rounded-xl transition border border-slate-200 dark:border-[#383838] min-w-[38px] min-h-[38px] flex items-center justify-center shadow-2xs"
            title={getT(currentLanguage, "settings_label")}
            aria-label="Settings and Preferences"
          >
            <Settings className="w-4 h-4 text-slate-700 dark:text-[#FCD33F]" />
          </button>

          {showSettingsMenu && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#242424] rounded-2xl shadow-xl border border-slate-200 dark:border-[#383838] py-2 z-50 animate-in fade-in">
              <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-[#333333] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  {getT(currentLanguage, "settings_label")}
                </span>
              </div>

              {/* Theme Option */}
              <div className="px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2E2E2E] transition cursor-pointer"
                   onClick={toggleTheme}>
                <div className="flex items-center gap-2.5">
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-[#FCD33F]" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600" />
                  )}
                  <span>{isDarkMode ? getT(currentLanguage, "theme_light") : getT(currentLanguage, "theme_dark")}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-[#FFE57F]">
                  {isDarkMode ? "DARK" : "LIGHT"}
                </span>
              </div>

              {/* Audio Voice Guide Option */}
              <div
                className="px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2E2E2E] transition cursor-pointer"
                onClick={() => {
                  if (currentLanguage === "en")
                    speak(
                      "Kaamzo platform: Connecting daily wage workers with customers directly.",
                    );
                  else if (currentLanguage === "hi")
                    speak("कामज़ो: श्रमिकों को सीधे काम और सही मजदूरी देने का मंच।");
                  else if (currentLanguage === "pa")
                    speak("ਕਾਮਜ਼ੋ: ਕਾਮਿਆਂ ਨੂੰ ਸਿੱਧਾ ਕੰਮ ਅਤੇ ਪੱਕੀ ਦਿਹਾੜੀ ਦੇਣ ਵਾਲਾ ਮੰਚ।");
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-amber-600 dark:text-[#FCD33F]" />
                  <span>{getT(currentLanguage, "voice_assist")}</span>
                </div>
                <span className="text-[10px] text-amber-700 dark:text-[#FCD33F] font-bold"> {t("Play")} </span>
              </div>

              {/* Seed Sample Demo Data */}
              <div
                className="px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2E2E2E] transition cursor-pointer"
                onClick={() => {
                  seedSampleData();
                  setShowSettingsMenu(false);
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span> {t("Seed Demo Data")} </span>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold"> {t("Sample")} </span>
              </div>

              {/* Dedicated App Portals (Customer & Worker) */}
              <div
                className="px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2E2E2E] transition cursor-pointer"
                onClick={() => {
                  setIsAppExtModalOpen(true);
                  setShowSettingsMenu(false);
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-amber-500" />
                  <span> {t("Customer & Worker Apps")} </span>
                </div>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-[#FFE57F] font-bold px-1.5 py-0.5 rounded"> {t("Portals")} </span>
              </div>


            </div>
          )}
        </div>
      </div>

      <AppExtensionModal isOpen={isAppExtModalOpen} onClose={() => setIsAppExtModalOpen(false)} />
    </header>
  );
};

