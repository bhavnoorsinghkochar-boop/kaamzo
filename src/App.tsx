import { OfflineIndicator } from "./components/common/OfflineIndicator";
import React, { useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { MainPlatform } from "./components/MainPlatform";
import { PitchDeckViewer } from "./components/deck/PitchDeckViewer";
import { CallModal } from "./components/common/CallModal";
import { GpsRadarModal } from "./components/common/GpsRadarModal";
import { UpiQrPaymentModal } from "./components/common/UpiQrPaymentModal";
import { MultiChannelAlertModal } from "./components/common/MultiChannelAlertModal";
import { Top5ShortlistModal } from "./components/customer/Top5ShortlistModal";
import { ChatNotificationToast } from "./components/common/ChatNotificationToast";
import { QuickChatModal } from "./components/common/QuickChatModal";
import { SubscriptionPromoModal } from "./components/common/SubscriptionPromoModal";
import { AppProtectionGuaranteeModal } from "./components/common/AppProtectionGuaranteeModal";
import { InteractiveBackground } from "./components/common/InteractiveBackground";
import { CookieBanner } from "./components/common/CookieBanner";
import { BackToTopButton } from "./components/common/BackToTopButton";
import { ScrollProgressBar } from "./components/common/ScrollProgressBar";
import { FloatingContactButton } from "./components/common/FloatingContactButton";
import { SkipToContent } from "./components/common/SkipToContent";
import { captureUtmParameters } from "./utils/utm";
import { Bell } from "lucide-react";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { useTranslation } from "react-i18next";
import { AutoTranslator } from "./components/AutoTranslator";

const MainLayout: React.FC = () => {
    const { t } = useTranslation();
  const {
    currentRole,
    setCurrentRole,
    notification,
    setNotification,
    activeCall,
    startCall,
    endCall,
    activeGpsJob,
    closeGpsRadar,
    activeUpiPaymentJob,
    closeUpiPayment,
    activeMultiChannelJob,
    activeMultiChannelWorker,
    closeMultiChannelModal,
    openMultiChannelModal,
    openGpsRadar,
    activeShortlistJob,
    closeTop5Shortlist,
    acceptJobByWorker,
    releasePaymentByCustomer,
    currentWorker,
    currentCustomer,
    workers,
    chatNotifications,
    dismissChatNotification,
    activeGlobalChat,
    openGlobalChat,
    closeGlobalChat,
    isSubscriptionPromoOpen,
    promoInitialRole,
    closeSubscriptionPromo,
    isProtectionModalOpen,
    protectionModalData,
    closeProtectionModal,
  } = useApp();

  // Capture UTM parameters on initial load
  useEffect(() => {
    captureUtmParameters();
  }, []);


  // Listen to browser URL / Hash / Query changes to support direct app extensions and deep links
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get('app')?.toLowerCase();

      if (
        appParam === "customer" ||
        appParam === "employer" ||
        path.includes("customer") ||
        path.includes("employer") ||
        hash.includes("customer") ||
        hash.includes("employer")
      ) {
        setCurrentRole("customer");
      } else if (
        appParam === "worker" ||
        path.includes("worker") ||
        hash.includes("worker")
      ) {
        setCurrentRole("worker");
      } else if (
        appParam === "admin" ||
        path.includes("admin") ||
        hash.includes("admin")
      ) {
        setCurrentRole("admin");
      } else if (
        appParam === "pitch" ||
        path.includes("pitch") ||
        path.includes("investor") ||
        hash.includes("investor") ||
        hash.includes("pitch")
      ) {
        setCurrentRole("pitch_deck");
      }
    };

    handleUrlRoute();
    window.addEventListener("popstate", handleUrlRoute);
    window.addEventListener("hashchange", handleUrlRoute);
    return () => {
      window.removeEventListener("popstate", handleUrlRoute);
      window.removeEventListener("hashchange", handleUrlRoute);
    };
  }, [setCurrentRole]);

  return (
    <div className="relative w-full min-h-screen bg-slate-50 dark:bg-[#1C1C1C] flex flex-col font-sans text-slate-800 dark:text-[#FFFFFF] transition-colors duration-200 overflow-x-hidden">
      {/* Accessibility Skip to Content Link */}
      <SkipToContent />

      {/* Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Interactive Atmospheric Background */}
      <InteractiveBackground />


      {/* Toast Notification Banner */}
      {notification && (
        <div className="bg-slate-900 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md sticky top-0 z-50 border-b border-slate-700 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <Bell className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded text-[11px]"
          >
             {t("Dismiss")} </button>
        </div>
      )}

      {/* Real-Time Floating Chat Notifications */}
      <ChatNotificationToast
        notifications={chatNotifications}
        onDismiss={dismissChatNotification}
        onOpenChat={(item) => {
          dismissChatNotification(item.id);
          openGlobalChat(
            item.job || null,
            item.targetPerson || {
              name: item.senderName,
              phone: item.senderPhone,
              role: item.senderRole,
            },
            currentRole === "worker" ? "worker" : "customer",
          );
        }}
      />

      {/* Main Header */}
      <Header />

      {/* Main Container - Main Platform & Dedicated Pitch Deck */}
      <main id="main-content" className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
        {currentRole === "pitch_deck" ? (
          <div className="p-3 sm:p-6 lg:p-8 flex items-center justify-center flex-1">
            <PitchDeckViewer />
          </div>
        ) : (
          <MainPlatform />
        )}
      </main>

      {/* Global In-App Voice Call Simulator Modal */}
      <CallModal callSession={activeCall} onEndCall={endCall} />

      {/* Global Real-Time Quick Chat Modal */}
      {activeGlobalChat?.isOpen && (
        <QuickChatModal
          isOpen={activeGlobalChat.isOpen}
          onClose={closeGlobalChat}
          job={activeGlobalChat.job}
          targetPerson={activeGlobalChat.targetPerson}
          currentUserRole={
            activeGlobalChat.role ||
            (currentRole === "worker" ? "worker" : "customer")
          }
          currentUserName={
            (activeGlobalChat.role || currentRole) === "worker"
              ? currentWorker?.name || "Worker"
              : currentCustomer?.name || "Employer"
          }
          currentUserPhone={
            (activeGlobalChat.role || currentRole) === "worker"
              ? currentWorker?.phone || "+91 98101 55678"
              : currentCustomer?.phone || "+91 99100 88221"
          }
          onStartCall={
            activeGlobalChat.targetPerson?.phone
              ? () => {
                  startCall(
                    {
                      name:
                        currentRole === "worker"
                          ? currentWorker?.name || "Worker"
                          : currentCustomer?.name || "Employer",
                      role: currentRole === "worker" ? "worker" : "customer",
                      phone:
                        currentRole === "worker"
                          ? currentWorker?.phone || ""
                          : currentCustomer?.phone || "",
                    },
                    {
                      name: activeGlobalChat.targetPerson.name || "Contact",
                      role:
                        activeGlobalChat.role === "worker"
                          ? "customer"
                          : "worker",
                      phone: activeGlobalChat.targetPerson.phone || "",
                    },
                    activeGlobalChat.job?.title || "Dihadi Direct Work Chat",
                  );
                }
              : undefined
          }
          onOpenRadar={
            activeGlobalChat.job
              ? () => {
                  openGpsRadar(activeGlobalChat.job!);
                }
              : undefined
          }
        />
      )}

      {/* Global Live GPS Radar & Route Tracking Modal */}
      {activeGpsJob &&
        (() => {
          const assignedWorker = workers.find(
            (w) =>
              w.id === activeGpsJob.assignedWorkerId ||
              w.name === activeGpsJob.assignedWorkerName,
          );
          const resolvedWorkerGps =
            assignedWorker?.gpsLocation ||
            activeGpsJob.workerGps ||
            currentWorker?.gpsLocation;
          const resolvedJobGps =
            activeGpsJob.jobGps || currentCustomer?.gpsLocation;
          return (
            <GpsRadarModal
              isOpen={!!activeGpsJob}
              onClose={closeGpsRadar}
              workerName={
                activeGpsJob.assignedWorkerName ||
                assignedWorker?.name ||
                currentWorker?.name ||
                "Worker"
              }
              workerTrade={activeGpsJob.trade}
              jobTitle={activeGpsJob.title}
              jobAddress={activeGpsJob.locationAddress}
              workerGps={resolvedWorkerGps}
              jobGps={resolvedJobGps}
              initialDistanceKm={activeGpsJob.distanceKm || 1.2}
              isWorkerPerspective={currentRole === "worker"}
            />
          );
        })()}

      {/* Global UPI QR & POS Barcode Payment Modal */}
      {activeUpiPaymentJob && (
        <UpiQrPaymentModal
          isOpen={!!activeUpiPaymentJob}
          onClose={closeUpiPayment}
          amount={activeUpiPaymentJob.workerPayout}
          totalWage={activeUpiPaymentJob.dailyWage}
          platformFee={activeUpiPaymentJob.platformFee}
          workerName={activeUpiPaymentJob.assignedWorkerName || "Worker"}
          workerTrade={activeUpiPaymentJob.trade}
          workerUpiId={
            activeUpiPaymentJob.assignedWorkerUpi || "worker@upi"
          }
          workerPhone={
            activeUpiPaymentJob.assignedWorkerPhone || "+91 98101 55678"
          }
          jobTitle={activeUpiPaymentJob.title}
          onPaymentSuccess={(method, ref, rating, review, tags) => {
            const finalRating =
              typeof rating === "number" && rating >= 1 ? rating : 5;
            const finalReview =
              review ||
              `Rated ${finalRating} stars for work on ${activeUpiPaymentJob.title || "Job"}`;
            releasePaymentByCustomer(
              activeUpiPaymentJob.id,
              finalRating,
              finalReview,
              method as any,
              ref,
              tags,
            );
            closeUpiPayment();
          }}
        />
      )}

      {/* Global Multi-Channel Job Alert Simulator Modal */}
      {activeMultiChannelJob && (
        <MultiChannelAlertModal
          isOpen={!!activeMultiChannelJob}
          onClose={closeMultiChannelModal}
          job={activeMultiChannelJob}
          targetWorker={activeMultiChannelWorker}
          onAcceptJob={(jobId) => {
            acceptJobByWorker(jobId);
            closeMultiChannelModal();
          }}
        />
      )}

      {/* Global Top-5 AI Shortlist Modal */}
      {activeShortlistJob && (
        <Top5ShortlistModal
          isOpen={!!activeShortlistJob}
          onClose={closeTop5Shortlist}
          job={activeShortlistJob}
          onOpenMultiChannel={(job, worker) => {
            closeTop5Shortlist();
            openMultiChannelModal(job, worker);
          }}
          onOpenRadar={(job) => {
            openGpsRadar(job);
          }}
        />
      )}

      {/* Global YouTube-Style Subscription Promo Ad Interstitial Modal */}
      {isSubscriptionPromoOpen && (
        <SubscriptionPromoModal
          isOpen={isSubscriptionPromoOpen}
          onClose={closeSubscriptionPromo}
          initialRole={
            promoInitialRole ||
            (currentRole === "worker" ? "worker" : "customer")
          }
          allowRoleSwitch={false}
        />
      )}

      {/* Global Safety, Direct Work Warning & 100% Protection Guarantee Modal */}
      {isProtectionModalOpen && (
        <AppProtectionGuaranteeModal
          isOpen={isProtectionModalOpen}
          onClose={closeProtectionModal}
          variant={protectionModalData?.variant || "post_rating"}
          workerName={protectionModalData?.workerName}
          workerTrade={protectionModalData?.workerTrade}
          workerAadhaarMasked={protectionModalData?.workerAadhaarMasked}
          refundAmount={protectionModalData?.refundAmount}
        />
      )}

      {/* Clean Footer with Muted Admin / Investor links */}
      <footer className="min-h-14 py-3 sm:py-0 bg-white dark:bg-[#1C1C1C] border-t border-slate-200 dark:border-[#383838] flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 gap-2 sm:gap-0 transition-colors w-full text-center sm:text-left">
        <p>
           {t("© 2026 Kaamzo Technologies • Empowering Bharat's Local Workforce")} </p>
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setCurrentRole("admin")}
            className="text-slate-400 dark:text-slate-400 hover:text-amber-700 dark:hover:text-[#FCD33F] transition cursor-pointer"
          >
             {t("Admin login")} </button>
          <span>•</span>
          <button
            onClick={() => setCurrentRole("pitch_deck")}
            className="text-slate-400 dark:text-slate-400 hover:text-amber-700 dark:hover:text-[#FCD33F] transition cursor-pointer"
          >
             {t("Investors")} </button>
        </div>
      </footer>

      {/* Added UI/UX Feature Components */}
      <CookieBanner />
      <BackToTopButton />
      <FloatingContactButton />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <OfflineIndicator />
        <AutoTranslator />
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
