import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ShieldCheck, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
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
        {errorMessage && (
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 text-left font-medium px-2">
            ⚠️ {errorMessage}
          </p>
        )}
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
        {errorMessage && (
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 text-center font-medium">
            ⚠️ {errorMessage}
          </p>
        )}
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
        {errorMessage && (
          <p className="text-xs text-rose-400 mt-1.5 text-center font-medium">
            ⚠️ {errorMessage}
          </p>
        )}
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
      {errorMessage && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 text-center font-medium">
          ⚠️ {errorMessage}
        </p>
      )}
    </div>
  );
};
