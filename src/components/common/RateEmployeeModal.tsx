import React, { useState } from "react";
import {
  X,
  Star,
  Sparkles,
  ThumbsUp,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Award,
  Zap,
  Clock,
  Heart,
} from "lucide-react";
import { playSound } from "../../utils/audio";
import confetti from "canvas-confetti";
import { useApp } from "../../context/AppContext";
import { useTranslation } from "react-i18next";

interface RateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerName: string;
  workerTrade: string;
  jobTitle: string;
  jobId: string;
  existingRating?: number;
  existingReview?: string;
  existingTags?: string[];
  onSubmitRating: (
    jobId: string,
    rating: number,
    review: string,
    tags: string[],
  ) => void;
}
const QUALITY_TAGS = [
  { id: "punctual", label: "⚡ Punctual & On-Time" },
  { id: "craftsmanship", label: "🛠️ Expert Craftsmanship" },
  { id: "clean", label: "🧹 Clean & Tidy Work" },
  { id: "polite", label: "🤝 Polite & Honest" },
  { id: "fast", label: "⏱️ Fast & Dedicated" },
  { id: "fair", label: "💰 Great Value" },
];
const RATING_DESCRIPTIONS: Record<number, string> = {
  1: "Poor Experience - Needs significant improvement",
  2: "Fair - Met some expectations but had issues",
  3: "Good - Satisfactory work completed as agreed",
  4: "Very Good - Skilled, professional, and reliable",
  5: "Outstanding - Exceptional quality & highly recommended!",
};
export const RateEmployeeModal: React.FC<RateEmployeeModalProps> = ({
  isOpen,
  onClose,
  workerName,
  workerTrade,
  jobTitle,
  jobId,
  existingRating = 5,
  existingReview = "",
  existingTags = ["⚡ Punctual & On-Time", "🛠️ Expert Craftsmanship"],
  onSubmitRating,
}) => {
    const { t } = useTranslation();
  const { openProtectionModal } = useApp();
  const [rating, setRating] = useState<number>(existingRating || 5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [review, setReview] = useState<string>(existingReview);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingTags || [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;
  const currentDisplayRating = hoveredRating !== null ? hoveredRating : rating;
  const toggleTag = (tagLabel: string) => {
    playSound("click");
    if (selectedTags.includes(tagLabel)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagLabel));
    } else {
      setSelectedTags([...selectedTags, tagLabel]);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    playSound("success");
    try {
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
    } catch (err) {
      console.debug(err);
    }
    setTimeout(() => {
      setIsSubmitting(false);
      const finalReview =
        review.trim() ||
        `Rated ${rating} stars for ${workerTrade} work on ${jobTitle}.`;
      onSubmitRating(jobId, rating, finalReview, selectedTags);
      onClose();
      /*  Show Safety & Protection Advisory Modal  */ setTimeout(() => {
        openProtectionModal({
          variant: "post_rating",
          workerName,
          workerTrade,
          workerAadhaarMasked: "Govt. Aadhaar Verified",
        });
      }, 400);
    }, 400);
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in select-none">
      {" "}
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {" "}
        {/* Modal Header */}{" "}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-4 sm:p-5 flex items-center justify-between shrink-0">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-slate-950 font-black shadow-inner">
              {" "}
              <Star className="w-5 h-5 fill-slate-950 text-slate-950" />{" "}
            </div>{" "}
            <div>
              {" "}
              <h3 className="text-base font-black text-slate-950 flex items-center gap-1.5">
                {" "}
                <span> {t("Rate & Review Worker")} </span>{" "}
                <Sparkles className="w-4 h-4 text-amber-200" />{" "}
              </h3>{" "}
              <p className="text-xs text-amber-950 font-medium">
                {" "}
                 {t("Help build trusted work histories on Dihadi")} {" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-slate-950 flex items-center justify-center transition"
          >
            {" "}
            <X className="w-4 h-4" />{" "}
          </button>{" "}
        </div>{" "}
        {/* Modal Body */}{" "}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1"
        >
          {" "}
          {/* Worker Info Card */}{" "}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-3.5 flex items-center justify-between border border-slate-700">
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
                {" "}
                {workerName.charAt(0)}{" "}
              </div>{" "}
              <div>
                {" "}
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  {" "}
                  {workerName}{" "}
                  <ShieldCheck className="w-4 h-4 text-amber-400" />{" "}
                </h4>{" "}
                <p className="text-xs text-amber-300 font-medium">
                  {" "}
                  {workerTrade} • {jobTitle}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="text-right">
              {" "}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                 {t("Status")} </span>{" "}
              <span className="text-xs font-bold text-amber-400">
                 {t("Job Finished")} </span>{" "}
            </div>{" "}
          </div>{" "}
          {/* Interactive Star Selector */}{" "}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-center space-y-2">
            {" "}
            <label className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
              {" "}
               {t("Tap to Rate Performance")} {" "}
            </label>{" "}
            <div className="flex items-center justify-center gap-2 py-1">
              {" "}
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = starVal <= currentDisplayRating;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => {
                      setRating(starVal);
                      playSound("click");
                    }}
                    onMouseEnter={() => setHoveredRating(starVal)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1.5 transition-transform hover:scale-125 active:scale-95 focus:outline-hidden"
                  >
                    {" "}
                    <Star
                      className={`w-8 h-8 transition-colors ${isFilled ? "fill-amber-400 text-amber-500 drop-shadow-xs" : "text-slate-300 hover:text-amber-300"}`}
                    />{" "}
                  </button>
                );
              })}{" "}
            </div>{" "}
            <div className="h-5 flex items-center justify-center">
              {" "}
              <span className="text-xs font-black text-slate-900 bg-white px-3 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                {" "}
                {currentDisplayRating} ★ —{" "}
                {RATING_DESCRIPTIONS[currentDisplayRating]}{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
          {/* Quality Badges */}{" "}
          <div className="space-y-1.5">
            {" "}
            <label className="text-xs font-bold text-slate-700 block">
              {" "}
               {t("Worker Strengths & Badges")} {" "}
            </label>{" "}
            <div className="flex flex-wrap gap-1.5">
              {" "}
              {QUALITY_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.label);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${isSelected ? "bg-amber-100 border-amber-400 text-amber-950 shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                  >
                    {" "}
                    {tag.label}{" "}
                  </button>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
          {/* Written Feedback Box */}{" "}
          <div className="space-y-1.5">
            {" "}
            <label className="text-xs font-bold text-slate-700 block">
              {" "}
               {t("Written Feedback & Review (Optional)")} {" "}
            </label>{" "}
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={t("e.g. worker was very hardworking, arrived exactly on time, and finished the brickwork flawlessly!")}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs focus:outline-amber-600 focus:bg-white transition"
            />{" "}
          </div>{" "}
          {/* Submit Button */}{" "}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl shadow-md text-xs transition flex items-center justify-center gap-2"
          >
            {" "}
            <CheckCircle2 className="w-4 h-4" />{" "}
            <span> {t("Submit Rating & Finalize")} </span>{" "}
          </button>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
};
