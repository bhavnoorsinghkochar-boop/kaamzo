import React, { useState, useRef } from "react";
import {
  X,
  Camera,
  UploadCloud,
  Check,
  Sparkles,
  User,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  HardHat,
} from "lucide-react";
import { WorkerProfile } from "../../types";
import { playSound } from "../../utils/audio";
import {
  compressImageFile,
  WORKER_AVATAR_PRESETS,
} from "../../utils/imageUtils";
import { useTranslation } from "react-i18next";

interface WorkerAvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker?: WorkerProfile | null;
  onAvatarUpdated: (newAvatarUrl: string) => void;
  showNotification?: (title: string, message: string) => void;
}
export const WorkerAvatarUploadModal: React.FC<
  WorkerAvatarUploadModalProps
> = ({ isOpen, onClose, worker, onAvatarUpdated, showNotification }) => {
    const { t } = useTranslation();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    worker?.avatar || null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;
  const currentWorkerAvatar =
    selectedAvatar ||
    worker?.avatar ||
    "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=200&auto=format&fit=crop&q=80";
  const handleFileProcess = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      /*  Compress to optimal profile avatar size (500x500px, 85% quality)  */ const compressedDataUrl =
        await compressImageFile(file, {
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.85,
          mimeType: "image/jpeg",
        });
      setSelectedAvatar(compressedDataUrl);
      playSound("click");
    } catch (err: any) {
      console.error("Image compression error:", err);
      setError(
        err?.message ||
          "Failed to process selected photo. Please try a different image.",
      );
      playSound("alert");
    } finally {
      setIsProcessing(false);
      /* Reset input value so same file can be re-selected if needed */ e.target.value =
        "";
    }
  };
  const handleSelectPreset = (url: string) => {
    setError(null);
    setSelectedAvatar(url);
    playSound("click");
  };
  const handleSaveAvatar = () => {
    if (!selectedAvatar) {
      setError("Please select or take a photo first.");
      playSound("alert");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      onAvatarUpdated(selectedAvatar);
      setIsProcessing(false);
      setIsSaved(true);
      playSound("success");
      if (showNotification) {
        showNotification(
          "Profile Photo Updated",
          "Your verified profile picture is now live.",
        );
      }
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 900);
    }, 400);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {" "}
      <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {" "}
        {/* Header */}{" "}
        <div className="bg-slate-900 text-white p-5 relative shrink-0">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md border-2 border-amber-300">
                {" "}
                <Camera className="w-5 h-5" />{" "}
              </div>{" "}
              <div>
                {" "}
                <h3 className="text-base sm:text-lg font-black text-white">
                   {t("Upload Worker Photo")} </h3>{" "}
                <p className="text-[11px] text-slate-400">
                  {" "}
                   {t("A clear profile photo increases daily hiring requests by 85%")} {" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <button
              onClick={() => {
                onClose();
                playSound("click");
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
            >
              {" "}
              <X className="w-4 h-4" />{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {/* Modal Body */}{" "}
        <div className="p-5 space-y-5 text-slate-800 text-xs overflow-y-auto max-h-[75vh]">
          {" "}
          {/* Live Avatar Preview Card */}{" "}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            {" "}
            <div className="relative">
              {" "}
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl bg-slate-800 flex items-center justify-center">
                {" "}
                <img
                  src={currentWorkerAvatar}
                  alt={t("Worker Profile")}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    /* Fallback to placeholder if image fails */ (
                      e.target as HTMLImageElement
                    ).src =
                      "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=200&auto=format&fit=crop&q=80";
                  }}
                  referrerPolicy="no-referrer"
                />{" "}
              </div>{" "}
              <div className="absolute bottom-0 right-0 p-1.5 bg-amber-500 text-white rounded-full border-2 border-white shadow-md">
                {" "}
                <ShieldCheck className="w-4 h-4" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="text-center">
              {" "}
              <h4 className="font-bold text-sm text-slate-900">
                {worker?.name || "Professional Worker"}
              </h4>{" "}
              <p className="text-[11px] text-slate-500 font-semibold">
                {worker?.primaryTrade || "Artisan Craftsman"}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          {/* Action Buttons: Choose File or Use Camera */}{" "}
          <div className="grid grid-cols-2 gap-2.5">
            {" "}
            {/* 1. Device Upload */}{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-400 rounded-2xl transition flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer disabled:opacity-50"
            >
              {" "}
              <UploadCloud className="w-6 h-6 text-amber-600" />{" "}
              <span className="font-bold text-amber-950 text-xs">
                 {t("Choose File")} </span>{" "}
              <span className="text-[10px] text-slate-500">
                 {t("From phone/gallery")} </span>{" "}
            </button>{" "}
            {/* 2. Take Live Selfie / Camera */}{" "}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
              className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-400 rounded-2xl transition flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer disabled:opacity-50"
            >
              {" "}
              <Camera className="w-6 h-6 text-amber-600" />{" "}
              <span className="font-bold text-amber-950 text-xs">
                 {t("Take Photo")} </span>{" "}
              <span className="text-[10px] text-slate-500">
                 {t("Instant camera capture")} </span>{" "}
            </button>{" "}
            {/* Hidden Inputs */}{" "}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileProcess}
              className="hidden"
            />{" "}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileProcess}
              className="hidden"
            />{" "}
          </div>{" "}
          {/* Error Banner */}{" "}
          {error && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center gap-2 text-xs animate-fade-in font-medium">
              {" "}
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />{" "}
              <span>{error}</span>{" "}
            </div>
          )}{" "}
          {/* Preset Avatar Selection */}{" "}
          <div className="space-y-2">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <label className="font-black text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1">
                {" "}
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />{" "}
                <span> {t("Or Choose Professional Avatar")} </span>{" "}
              </label>{" "}
              <span className="text-[10px] text-slate-400">
                 {t("1-Tap Select")} </span>{" "}
            </div>{" "}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {" "}
              {WORKER_AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition p-0.5 aspect-square cursor-pointer group ${isSelected ? "border-amber-500 ring-2 ring-amber-400/50 scale-105 shadow-md" : "border-slate-200 hover:border-slate-400"}`}
                  >
                    {" "}
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />{" "}
                    {isSelected && (
                      <span className="absolute top-1 right-1 p-0.5 bg-amber-500 text-slate-950 rounded-full shadow-xs">
                        {" "}
                        <Check className="w-3 h-3 stroke-[3]" />{" "}
                      </span>
                    )}{" "}
                  </button>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
          {/* Success Banner */}{" "}
          {isSaved && (
            <div className="p-3 bg-amber-600 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-md animate-fade-in">
              {" "}
              <Check className="w-4 h-4" />{" "}
              <span> {t("Photo updated successfully!")} </span>{" "}
            </div>
          )}{" "}
        </div>{" "}
        {/* Footer Actions */}{" "}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {" "}
          <button
            type="button"
            onClick={() => {
              onClose();
              playSound("click");
            }}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            {" "}
             {t("Cancel")} {" "}
          </button>{" "}
          <button
            type="button"
            onClick={handleSaveAvatar}
            disabled={isProcessing}
            className="flex-1 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-300 text-slate-950 font-black rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {" "}
            {isProcessing ? (
              <>
                {" "}
                <RefreshCw className="w-4 h-4 animate-spin" />{" "}
                <span> {t("Processing Photo...")} </span>{" "}
              </>
            ) : (
              <>
                {" "}
                <Check className="w-4 h-4" />{" "}
                <span> {t("Save Profile Photo")} </span>{" "}
              </>
            )}{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
