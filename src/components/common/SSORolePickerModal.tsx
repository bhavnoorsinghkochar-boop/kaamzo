import React from "react";
import { useApp } from "../../context/AppContext";
import { HardHat, Briefcase, X, ArrowRight, ShieldCheck, Shield, Sparkles } from "lucide-react";
import { playSound } from "../../utils/audio";
import { useTranslation } from "react-i18next";

interface SSORolePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    uid: string;
  } | null;
}

export const SSORolePickerModal: React.FC<SSORolePickerModalProps> = ({
  isOpen,
  onClose,
  googleUser,
}) => {
    const { t } = useTranslation();
  const {
    registerCustomerWithAuth,
    loginCustomerWithAuth,
    registerWorkerWithAuth,
    loginWorkerWithAuth,
    loginAdmin,
    setCurrentRole,
    currentCity,
    showNotification,
  } = useApp();

  if (!isOpen || !googleUser) return null;

  const email = googleUser.email || googleUser.uid;
  const name = googleUser.displayName || "Kaamzo User";
  const cleanEmail = email.toLowerCase().trim();
  const isAuthorizedAdmin =
    cleanEmail === "bhavnoorsinghkochar@gmail.com" ||
    cleanEmail === "bhavnoorsinghkochar@gmail.com";

  const handleSelectAdmin = () => {
    playSound("success");
    loginAdmin({
      name: name || "Bhavnoor Singh Kochar",
      email: email,
    });
    setCurrentRole("admin");
    showNotification(
      "Admin Access Granted",
      `Welcome Administrator ${name}! Operations Headquarters initialized.`
    );
    onClose();
  };

  const handleSelectCustomer = () => {
    playSound("success");
    const tempPass = "google_sso_123";
    registerCustomerWithAuth({
      userId: email,
      password: tempPass,
      name: name,
      phone: "+91 99100 88221",
      email: email,
      isEmailVerified: true,
      area: currentCity?.defaultArea || "Model Town",
      address: `House 142, ${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
      upiId: `${email.split("@")[0]}@okhdfcbank`,
    });
    loginCustomerWithAuth(email, tempPass);
    setCurrentRole("customer");
    showNotification(
      "Customer Profile Initialized",
      `Welcome ${name}! Your employer account is now ready.`
    );
    onClose();
  };

  const handleSelectWorker = () => {
    playSound("success");
    const tempPass = "google_sso_123";
    registerWorkerWithAuth({
      userId: email,
      password: tempPass,
      name: name,
      phone: "+91 98101 55678",
      email: email,
      isEmailVerified: true,
      primaryTrade: "Mason",
      dailyRate: 850,
      experienceYears: 4,
      area: `${currentCity?.defaultArea || "Model Town"}, ${currentCity?.name || "Ludhiana"}`,
      aadhaarNumber: "7829-4412-9901",
      upiId: `${email.split("@")[0]}@okaxis`,
    });
    loginWorkerWithAuth(email, tempPass);
    setCurrentRole("worker");
    showNotification(
      "Worker Profile Initialized",
      `Welcome ${name}! Your worker profile is now ready to receive jobs.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#202020] text-slate-900 dark:text-white rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-[#383838] shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {googleUser.photoURL ? (
              <img
                src={googleUser.photoURL}
                alt={name}
                className="w-11 h-11 rounded-full border-2 border-amber-400 object-cover shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg">
                {name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                   {t("Welcome,")} {name}!
                </h3>
                <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-[#FFE57F] text-[10px] font-extrabold rounded">
                   {t("Google SSO")} </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                {email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt */}
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
             {t("How would you like to use Kaamzo?")} </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
             {t("Select your preferred role to complete 1-click SSO setup:")} </p>
        </div>

        {/* Role Options */}
        <div className="space-y-3">
          {/* Platform Super Admin (Only visible for authorized admin email bhavnoorsinghkochar@gmail.com) */}
          {isAuthorizedAdmin && (
            <button
              type="button"
              onClick={handleSelectAdmin}
              className="w-full text-left p-4 rounded-2xl border-2 border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 transition flex items-center justify-between group cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-sm font-black text-amber-950 dark:text-[#FCD33F]">
                       {t("Platform Super Admin")} </h5>
                    <span className="px-1.5 py-0.2 bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100 text-[10px] font-black rounded">
                       {t("Authorized Admin")} </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                     {t("Governance access to Treasury, Escrow, KYC & Live Ops")} </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 dark:text-[#FCD33F] transition shrink-0" />
            </button>
          )}

          {/* Customer / Employer */}
          <button
            type="button"
            onClick={handleSelectCustomer}
            className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 dark:border-[#333] hover:border-amber-500 dark:hover:border-[#FCD33F] bg-slate-50 dark:bg-[#282828] hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-[#333] text-amber-700 dark:text-[#FCD33F] flex items-center justify-center font-bold shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#FCD33F] transition">
                   {t("Employer / Customer")} </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                   {t("Hire verified workers, broadcast jobs & manage site payments")} </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition shrink-0" />
          </button>

          {/* Worker / Professional */}
          <button
            type="button"
            onClick={handleSelectWorker}
            className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 dark:border-[#333] hover:border-amber-500 dark:hover:border-[#FCD33F] bg-slate-50 dark:bg-[#282828] hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-[#333] text-amber-700 dark:text-[#FCD33F] flex items-center justify-center font-bold shrink-0">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#FCD33F] transition">
                   {t("Daily Worker / Professional")} </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                   {t("Receive daily jobs nearby, earn guaranteed wages & UPI payout")} </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition shrink-0" />
          </button>
        </div>

        {/* Security Footer */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
             {t("Verified with Google SSO. You can switch between roles at any time.")} </span>
        </div>
      </div>
    </div>
  );
};
