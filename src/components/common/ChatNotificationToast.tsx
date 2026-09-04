import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  X,
  ArrowRight,
  CheckCheck,
  User,
  Briefcase,
  Sparkles,
  Send,
} from "lucide-react";
import { ChatNotificationItem } from "../../types";
import { playSound } from "../../utils/audio";
import { useTranslation } from "react-i18next";

interface ChatNotificationToastProps {
  notifications: ChatNotificationItem[];
  onDismiss: (id: string) => void;
  onOpenChat: (notification: ChatNotificationItem) => void;
}
export const ChatNotificationToast: React.FC<ChatNotificationToastProps> = ({
  notifications,
  onDismiss,
  onOpenChat,
}) => {
  if (!notifications || notifications.length === 0) return null;
  return (
    <div
      id="global-chat-notifications-container"
      className="fixed top-3 right-3 sm:right-6 sm:top-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-24px)] sm:w-auto pointer-events-none"
    >
      {" "}
      {notifications.map((item) => (
        <SingleChatToast
          key={item.id}
          item={item}
          onDismiss={() => onDismiss(item.id)}
          onOpenChat={() => onOpenChat(item)}
        />
      ))}{" "}
    </div>
  );
};
interface SingleToastProps {
  item: ChatNotificationItem;
  onDismiss: () => void;
  onOpenChat: () => void;
}
const SingleChatToast: React.FC<SingleToastProps> = ({
  item,
  onDismiss,
  onOpenChat,
}) => {
    const { t } = useTranslation();
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const durationMs = 6500;
  /* 6.5 seconds auto dismiss */ const intervalMs = 50;
  useEffect(() => {
    if (isPaused) return;
    const step = (intervalMs / durationMs) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, onDismiss]);
  const isWorker = item.senderRole === "worker";
  const isSender = !!item.isSender;
  return (
    <div
      id={`chat-popup-${item.id}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl rounded-2xl p-3.5 sm:p-4 transition-all duration-300 transform translate-y-0 animate-in slide-in-from-top-4 hover:shadow-amber-500/10 hover:border-amber-500/50 flex flex-col gap-2.5 relative overflow-hidden"
    >
      {" "}
      {/* Top Header */}{" "}
      <div className="flex items-center justify-between gap-2">
        {" "}
        <div className="flex items-center gap-2 min-w-0">
          {" "}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isWorker ? "bg-amber-500/20 border border-amber-500/40 text-amber-400" : "bg-amber-500/20 border border-amber-500/40 text-amber-400"}`}
          >
            {" "}
            <MessageSquare className="w-4 h-4 animate-pulse" />{" "}
          </div>{" "}
          <div className="min-w-0">
            {" "}
            <div className="flex items-center gap-1.5 flex-wrap">
              {" "}
              <span
                className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border ${isWorker ? "bg-amber-950/80 border-amber-700/60 text-amber-300" : "bg-amber-950/80 border-amber-700/60 text-amber-300"}`}
              >
                {" "}
                {isWorker ? "👷 Worker Message" : "🏢 Employer Message"}{" "}
              </span>{" "}
              <span className="text-[11px] text-slate-400 font-medium">
                {" "}
                {item.timestamp || "Just now"}{" "}
              </span>{" "}
            </div>{" "}
            <p className="text-xs font-bold text-slate-100 truncate mt-1">
              {" "}
               {t("From:")} {" "}
              <span className={isWorker ? "text-amber-300" : "text-amber-300"}>
                {item.senderName}
              </span>{" "}
              <span className="text-slate-400 font-normal">
                ({isWorker ? "Skilled Worker" : "Work Requester"})
              </span>{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        {/* Dismiss Button */}{" "}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playSound("click");
            onDismiss();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
          title={t("Dismiss notification")}
        >
          {" "}
          <X className="w-4 h-4" />{" "}
        </button>{" "}
      </div>{" "}
      {/* Message Preview Box */}{" "}
      <div
        onClick={() => {
          playSound("click");
          onOpenChat();
        }}
        className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-xs text-slate-200 cursor-pointer hover:border-slate-700 hover:bg-slate-950 transition group"
      >
        {" "}
        <p className="line-clamp-2 leading-relaxed font-normal text-slate-200 group-hover:text-white">
          "{item.text}"{" "}
        </p>{" "}
        {item.jobTitle && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
            {" "}
            <Briefcase className="w-3 h-3 text-amber-400 shrink-0" />{" "}
            <span className="truncate">{item.jobTitle}</span>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Action Footer */}{" "}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {" "}
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          {" "}
          <CheckCheck className="w-3 h-3 text-amber-400" />{" "}
          <span> {t("Real-time Dihadi Chat")} </span>{" "}
        </span>{" "}
        <button
          type="button"
          onClick={() => {
            playSound("click");
            onOpenChat();
          }}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        >
          {" "}
          <span> {t("Open & Reply")} </span> <ArrowRight className="w-3.5 h-3.5" />{" "}
        </button>{" "}
      </div>{" "}
      {/* Shrinking Progress Bar */}{" "}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
        {" "}
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />{" "}
      </div>{" "}
    </div>
  );
};
