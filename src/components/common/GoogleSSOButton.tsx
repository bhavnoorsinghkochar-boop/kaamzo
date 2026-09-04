import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ShieldCheck, Loader2, Sparkles, CheckCircle2, AlertCircle, Copy, Check, ExternalLink } from "lucide-react";
import { playSound } from "../../utils/audio";
import { useTranslation } from "react-i18next";

interface GoogleSSOButtonProps {
  roleTarget?: "worker" | "customer" | "admin" | "auto";
  label?: string;
  subLabel?: string;
  variant?: "light" | "dark" | "card" | "hero";
  className?: string;
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export const GoogleSSOButton: React.FC<GoogleSSOButtonProps> = ({
  roleTarget = "auto",
  label = "Sign in with Google (SSO)",
  subLabel,
  variant = "light",
  className = "",
  onSuccess,
  onError,
}) => {
    const { t } = useTranslation();
  const { signInWithGoogleSSO, showNotification } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname =
    typeof window !== "undefined" ? window.location.hostname : "your-vercel-domain.vercel.app";

  const isUnauthorizedDomain =
    errorMessage &&
    (errorMessage.toLowerCase().includes("unauthorized domain") ||
      errorMessage.toLowerCase().includes("auth/unauthorized-domain"));

  const handleCopyHostname = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const renderErrorBanner = () => {
    if (!errorMessage) return null;

    if (isUnauthorizedDomain) {
      return (
        <div className="mt-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-[#251E12] border border-amber-300 dark:border-amber-700/80 text-left text-xs space-y-2.5 animate-in fade-in shadow-xs">
          <div className="flex items-start gap-2.5 text-amber-950 dark:text-amber-200 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-extrabold">{t("Domain Authorization Required in Firebase")}</span>
              <p className="text-[11px] font-normal text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {t("Google SSO was opened from a domain that is not yet registered in your Firebase project's OAuth whitelist (Project: nifty-backup-mc9s2).")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#151515] px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900/60 font-mono text-[11px]">
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {currentHostname}
            </span>
            <button
              type="button"
              onClick={handleCopyHostname}
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-200 transition cursor-pointer"
            >
              {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedDomain ? t("Copied!") : t("Copy Domain")}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200">{t("How to fix in 30 seconds:")}</div>
            <ol className="list-decimal list-inside space-y-1 text-[10.5px]">
              <li>
                {t("Open Firebase Console -> Authentication -> Settings -> Authorized domains")}
              </li>
              <li>
                {t("Click 'Add domain' and add ")}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("vercel.app");
                    setCopiedDomain(true);
                    setTimeout(() => setCopiedDomain(false), 2500);
                  }}
                  className="font-mono bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.5 rounded font-bold underline cursor-pointer"
                >
                  vercel.app
                </button>
                <span className="text-[10px] text-slate-500 ml-1">
                  ({t("Authorizes ALL Vercel preview & production URLs at once!")})
                </span>
              </li>
              <li>
                {t("Also add your exact domain: ")}
                <code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded font-mono">
                  {currentHostname}
                </code>
              </li>
            </ol>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-amber-200/70 dark:border-amber-900/50">
            <a
              href="https://console.firebase.google.com/project/nifty-backup-mc9s2/authentication/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 transition"
            >
              <span>{t("Open Firebase Auth Settings")}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
            >
              {t("Dismiss")}
            </button>
          </div>
        </div>
      );
    }

    return (
      <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 text-center font-medium">
        ⚠️ {errorMessage}
      </p>
    );
  };

  const handleSSOClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    setErrorMessage(null);
    playSound("click");

    try {
      const result = await signInWithGoogleSSO(
        roleTarget === "auto" ? undefined : roleTarget
      );

      if (result.success) {
        playSound("success");
        if (result.user?.displayName) {
          showNotification(
            "SSO Authenticated",
            `Signed in as ${result.user.displayName} via Google SSO.`
          );
        }
        if (onSuccess) onSuccess(result.user);
      } else {
        const err = result.error || "Google SSO authentication failed.";
        if (err !== "Popup closed by user.") {
          setErrorMessage(err);
          if (onError) onError(err);
        }
      }
    } catch (err: any) {
      console.error("SSO Error:", err);
      const msg = err?.message || "Failed to sign in with Google SSO.";
      setErrorMessage(msg);
      if (onError) onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Google SVG Icon
  const GoogleIcon = () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
  );

  if (variant === "hero") {
    return (
      <div className={`w-full ${className}`}>
        <button
          type="button"
          onClick={handleSSOClick}
          disabled={isLoading}
          className="w-full relative group overflow-hidden bg-white dark:bg-[#202020] hover:bg-slate-50 dark:hover:bg-[#282828] text-slate-800 dark:text-slate-100 font-bold px-5 py-3.5 rounded-2xl border-2 border-amber-400/80 dark:border-amber-500/60 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-600 dark:text-[#FCD33F]" />
              ) : (
                <GoogleIcon />
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? "Authenticating with Google SSO..." : label}
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-md border border-emerald-300 dark:border-emerald-800">
                   {t("SSO Ready")} </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subLabel || "Instant login with 1-click Google OAuth verification"}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 dark:bg-amber-400/10 rounded-xl text-amber-700 dark:text-[#FFE57F] text-xs font-bold shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-[#FCD33F]" />
            <span> {t("Fast Sign-In")} </span>
          </div>
        </button>
        {renderErrorBanner()}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`w-full ${className}`}>
        <button
          type="button"
          onClick={handleSSOClick}
          disabled={isLoading}
          className="w-full bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-2 border-amber-300 dark:border-amber-700/70 text-amber-950 dark:text-[#FFE57F] font-black p-3.5 rounded-2xl transition flex items-center justify-center gap-3 shadow-xs cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-amber-700 dark:text-[#FCD33F]" />
          ) : (
            <GoogleIcon />
          )}
          <span className="text-xs sm:text-sm">
            {isLoading ? "Connecting SSO..." : label}
          </span>
          <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-extrabold px-1.5 py-0.5 rounded">
             {t("Google SSO")} </span>
        </button>
        {renderErrorBanner()}
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div className={`w-full ${className}`}>
        <button
          type="button"
          onClick={handleSSOClick}
          disabled={isLoading}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-3 px-4 rounded-2xl shadow-sm text-xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <GoogleIcon />
          )}
          <span>{isLoading ? "Signing in..." : label}</span>
        </button>
        {renderErrorBanner()}
      </div>
    );
  }

  // Default light button
  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={handleSSOClick}
        disabled={isLoading}
        className="w-full bg-white hover:bg-slate-50 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold py-3 px-4 rounded-2xl shadow-xs text-xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-[#FCD33F]" />
        ) : (
          <GoogleIcon />
        )}
        <span>{isLoading ? "Connecting SSO..." : label}</span>
      </button>
      {renderErrorBanner()}
    </div>
  );
};
