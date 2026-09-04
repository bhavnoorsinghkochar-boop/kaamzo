import React, { useState } from "react";
import { Logo } from "../common/Logo";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Sparkles,
  TrendingUp,
  Target,
  ShieldCheck,
  Scale,
  Briefcase,
  Smartphone,
  Globe,
  Award,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const PitchDeckViewer: React.FC = () => {
    const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Kaamzo",
      subtitle: "A Startup for the people who WORK HARDER THAN US",
      tagline: "Promoting the income of LABOURS",
      sdg: [
        "SDG 8: Decent Work & Economic Growth",
        "SDG 10: Reduced Inequalities",
        "SDG 17: Partnerships for the Goals",
      ],
      type: "cover",
    },
    {
      title: "Our Team",
      subtitle: "The Founders & Visionaries behind Kaamzo",
      team: [
        {
          name: "Prabinder Singh",
          role: "Co-Founder & Operations",
          image:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        },
        {
          name: "Danish Wadhawan",
          role: "Co-Founder & Product Lead",
          image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        },
        {
          name: "Bhavnoor Singh",
          role: "Co-Founder & Tech Architect",
          image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        },
      ],
      type: "team",
    },
    {
      title: '"Who We Are"',
      subtitle: "Modernizing the unorganized daily-wage labor market",
      points: [
        "Our Identity: A next-generation technology platform bridging the gap between local daily-wage workers and customers who need reliable help.",
        "Our Ecosystem: A comprehensive three-pillar solution featuring the Customer App, Worker App, and Admin Dashboard.",
        "Our Core Mission: Modernizing the unorganized labor market by removing predatory middlemen, ensuring fair earnings, and bringing safety and transparency to local hiring.",
        "Our Driving Force: Promoting the dignity of labor, financial inclusion, and reliable service delivery built with care and trust.",
      ],
      type: "points",
    },
    {
      title: "What is the Problem?",
      subtitle: "Harsh Working Conditions & Middlemen Exploitation",
      items: [
        {
          title: "Long Exploitative Hours",
          desc: "Workers frequently work 12–16 hours per day with irregular rest and no safety nets.",
        },
        {
          title: "Hazardous Environments",
          desc: "Workplaces often lack basic safety standards, with high risk of unpaid injury and accidents.",
        },
        {
          title: "Unfair Wages & Cuts",
          desc: "Middlemen and labor contractors siphon 30–50% of the wage, leaving workers below living needs.",
        },
        {
          title: "Unorganized Market",
          desc: "No digital reputation, zero banking access, and no transparent pricing mechanism.",
        },
      ],
      type: "grid",
    },
    {
      title: "What is the Solution?",
      subtitle: "OUR APP: Kaamzo Unified Marketplace",
      highlights: [
        {
          title: "Direct Connection",
          desc: "Kaamzo connects workers directly with employers without an exploitative middleman.",
        },
        {
          title: "20% Flat Commission",
          desc: "Giving employment to labor on transparent 20% commission basis (worker keeps 80%).",
        },
        {
          title: "Starting from ₹800",
          desc: "Guaranteed minimum wage starting from ₹800/day ensures dignity and living wages.",
        },
        {
          title: "Accessible Interface",
          desc: "Designed for daily wage workers with voice guidance, multi-language support & high contrast.",
        },
      ],
      type: "solution",
    },
    {
      title: "Workers’ Rights & Protections",
      subtitle: "Putting Worker Safety and Dignity First",
      points: [
        "Built-in GPS Navigation so workers easily reach verified work sites.",
        "Multi-language Availability: English, Hindi (हिन्दी), Punjabi (ਪੰਜਾਬੀ).",
        "Freedom of Choice: Workers have full autonomy to Accept or Decline job requests.",
        "Accident Insurance Coverage and secure Escrow payment guarantees.",
      ],
      type: "points",
    },
    {
      title: "The 3-Pillar Ecosystem",
      subtitle: "Collective Power through Synchronized Mobile Apps",
      pillars: [
        {
          title: "Customer App",
          desc: "Find, book, and pay verified daily wage workers with transparent upfront pricing.",
        },
        {
          title: "Worker App",
          desc: "Build a verified digital profile, get instant job requests, and track daily earnings.",
        },
        {
          title: "Admin Dashboard",
          desc: "Verify worker Aadhaar/skills, monitor active jobs live, resolve disputes and power payouts.",
        },
      ],
      type: "pillars",
    },
    {
      title: "Business Model",
      subtitle: "How Kaamzo Generates Sustainable Revenue",
      revenueStreams: [
        {
          name: "20% Commission per Job",
          desc: "A transparent 20% platform service fee per completed job (far lower and fairer than traditional contractor cuts).",
        },
        {
          name: "Worker Subscription Tiers",
          desc: "Optional premium visibility, guaranteed daily job dispatch priority, and insurance add-ons.",
        },
        {
          name: "Verified Badge Fast-Track",
          desc: "Expedited physical document inspection & trade skill accreditation.",
        },
        {
          name: "Local Business Partnerships",
          desc: "Hardware stores, paint distributors, and material suppliers offering tool discounts to workers.",
        },
      ],
      type: "business",
    },
    {
      title: "Market Research & White Space",
      subtitle: "Kaamzo vs Urban Company vs Digital Labour Chowk",
      comparison: [
        {
          feature: "Target Workers",
          uc: "Beauty, AC Repair, Urban Middle Class",
          dlc: "Contractors / B2B Construction",
          dihadi: "Daily-Wage Workers: Masons, Painters, Helpers",
        },
        {
          feature: "Commission Cut",
          uc: "20–30% High Take Rate",
          dlc: "0% (No in-app escrow)",
          dihadi: "20% Transparent Flat Commission",
        },
        {
          feature: "Payment Flow",
          uc: "In-app payment",
          dlc: "Handled offline between parties (disputes)",
          dihadi: "Secure In-App Escrow & Instant UPI Payout",
        },
        {
          feature: "Consumer Experience",
          uc: "Consumer app only for luxury home care",
          dlc: "Mainly Contractor/B2B facing",
          dihadi: "Consumer-First Mobile App for Raw Daily Labor",
        },
      ],
      type: "market",
    },
    {
      title: "SWOT Analysis",
      subtitle: "Strategic Overview of Kaamzo",
      swot: {
        strengths: [
          "Direct worker-customer connection without middlemen.",
          "Focus on daily-wage labour market (masons, painters, helpers).",
          "Transparent 20% commission & in-app escrow payments.",
          "Three-part ecosystem with GPS matching and multilingual UI.",
        ],
        weaknesses: [
          "Early-stage platform scaling customer and worker liquidity.",
          "Brand awareness building in initial pilot clusters.",
          "Two-sided marketplace chicken-and-egg onboarding challenge.",
        ],
        opportunities: [
          "Huge unorganized market across Tier 1, 2 & 3 Indian cities.",
          "Rapid smartphone & UPI adoption among daily wage earners.",
          "Partnerships with housing societies, builders, and material suppliers.",
        ],
        threats: [
          "Resistance from traditional labor contractors and middlemen.",
          "Large horizontal platforms expanding into raw daily trades.",
          "Compliance requirements across regional labor boards.",
        ],
      },
      type: "swot",
    },
  ];
  const slide = slides[currentSlide];
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px] select-none">
      {" "}
      {/* Presentation Top Bar */}{" "}
      <div className="h-14 bg-slate-900 text-white px-6 flex items-center justify-between">
        {" "}
        <div className="flex items-center gap-2">
          {" "}
          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-sm">
            {" "}
             {t("K")} {" "}
          </div>{" "}
          <span className="text-sm font-bold tracking-tight">
             {t("Kaamzo Pitch Deck")} </span>{" "}
        </div>{" "}
        <div className="flex items-center gap-3">
          {" "}
          <span className="text-xs text-slate-400 font-mono">
            {" "}
             {t("Slide")} {currentSlide + 1}  {t("of")} {slides.length}{" "}
          </span>{" "}
          <div className="flex items-center gap-1">
            {" "}
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition"
            >
              {" "}
              <ChevronLeft className="w-4 h-4" />{" "}
            </button>{" "}
            <button
              onClick={() =>
                setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))
              }
              disabled={currentSlide === slides.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition"
            >
              {" "}
              <ChevronRight className="w-4 h-4" />{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Slide Body */}{" "}
      <div className="flex-1 p-8 sm:p-10 bg-slate-50 flex flex-col justify-center">
        {" "}
        {slide.type === "cover" && (
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            {" "}
            <div className="inline-block px-4 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider">
              {" "}
              {slide.tagline}{" "}
            </div>{" "}
            <div className="flex justify-center w-full">
              <Logo className="text-5xl sm:text-6xl my-6" />
            </div>{" "}
            <p className="text-xl sm:text-2xl font-bold text-slate-700">
              {" "}
              {slide.subtitle}{" "}
            </p>{" "}
            <div className="pt-4 flex flex-wrap justify-center gap-2">
              {" "}
              {slide.sdg?.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 bg-white border border-slate-200 shadow-xs rounded-xl text-xs font-bold text-slate-800"
                >
                  {" "}
                  🌱 {s}{" "}
                </span>
              ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {slide.type === "team" && (
          <div className="space-y-6">
            {" "}
            <div className="text-center">
              {" "}
              <h2 className="text-3xl font-black text-slate-900">
                {slide.title}
              </h2>{" "}
              <p className="text-sm text-slate-500 mt-1">
                {slide.subtitle}
              </p>{" "}
            </div>{" "}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              {" "}
              {slide.team?.map((member) => (
                <div
                  key={member.name}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3"
                >
                  {" "}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-amber-400"
                  />{" "}
                  <div>
                    {" "}
                    <h3 className="font-extrabold text-base text-slate-900">
                      {member.name}
                    </h3>{" "}
                    <p className="text-xs text-amber-600 font-semibold mt-0.5">
                      {member.role}
                    </p>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {slide.type === "points" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {" "}
            <div>
              {" "}
              <h2 className="text-3xl font-black text-slate-900">
                {slide.title}
              </h2>{" "}
              <p className="text-sm text-slate-500 mt-1">
                {slide.subtitle}
              </p>{" "}
            </div>{" "}
            <div className="space-y-3 pt-2">
              {" "}
              {slide.points?.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3"
                >
                  {" "}
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {" "}
                    ✓{" "}
                  </div>{" "}
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {p}
                  </p>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {slide.type === "grid" && (
          <div className="space-y-6">
            {" "}
            <div className="text-center">
              {" "}
              <h2 className="text-3xl font-black text-slate-900">
                {slide.title}
              </h2>{" "}
              <p className="text-sm text-slate-500 mt-1">
                {slide.subtitle}
              </p>{" "}
            </div>{" "}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {" "}
              {slide.items?.map((item) => (
                <div
                  key={item.title}
                  className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs space-y-1.5"
                >
                  {" "}
                  <h3 className="font-bold text-base text-amber-900 flex items-center gap-1.5">
                    {" "}
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>{" "}
                    {item.title}{" "}
                  </h3>{" "}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {slide.type === "solution" && (
          <div className="space-y-6">
            {" "}
            <div className="text-center">
              {" "}
              <h2 className="text-3xl font-black text-slate-900">
                {slide.title}
              </h2>{" "}
              <p className="text-sm text-slate-500 mt-1">
                {slide.subtitle}
              </p>{" "}
            </div>{" "}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {" "}
              {slide.highlights?.map((h) => (
                <div
                  key={h.title}
                  className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1.5"
                >
                  {" "}
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                    {" "}
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>{" "}
                    {h.title}{" "}
                  </h3>{" "}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {h.desc}
                  </p>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {slide.type === "pillars" && (
          <div className="space-y-6">
            {" "}
            <div className="text-center">
              {" "}
              <h2 className="text-3xl font-black text-slate-900">
                {slide.title}
              </h2>{" "}
              <p className="text-sm text-slate-500 mt-1">
                {slide.subtitle}
              </p>{" "}
            </div>{" "}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {" "}
              {slide.pillars?.map((p, i) => (
                <div
                  key={p.title}
                  className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-2 text-center"
                >
                  {" "}
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto font-black text-sm border border-amber-100">
                    {" "}
                    0{i + 1}{" "}
                  </div>{" "}
                  <h3 className="font-extrabold text-base text-slate-900">
                    {p.title}
                  </h3>{" "}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {p.desc}
                  </p>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {slide.type === "business" && (
          <div className="space-y-6">
            {" "}
            <div className="text-center">
              {" "}
              <h2 className="text-3xl font-black text-slate-900">
                {slide.title}
              </h2>{" "}
              <p className="text-sm text-slate-500 mt-1">
                {slide.subtitle}
              </p>{" "}
            </div>{" "}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {" "}
              {slide.revenueStreams?.map((r) => (
                <div
                  key={r.name}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1"
                >
                  {" "}
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    {" "}
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>{" "}
                    {r.name}{" "}
                  </h3>{" "}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {r.desc}
                  </p>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
        {slide.type === "market" && (
          <div className="space-y-5">
            {" "}
            <div>
              {" "}
              <h2 className="text-2xl font-black text-slate-900">
                {slide.title}
              </h2>{" "}
              <p className="text-xs text-slate-500 mt-0.5">
                {slide.subtitle}
              </p>{" "}
            </div>{" "}
            <div className="overflow-x-auto">
              {" "}
              <table className="w-full text-left text-xs bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {" "}
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  {" "}
                  <tr>
                    {" "}
                    <th className="p-3"> {t("Dimension")} </th>{" "}
                    <th className="p-3 text-slate-500"> {t("Urban Company")} </th>{" "}
                    <th className="p-3 text-slate-500"> {t("Digital Labour Chowk")} </th>{" "}
                    <th className="p-3 text-amber-700 bg-amber-50">
                       {t("Kaamzo (Winner)")} </th>{" "}
                  </tr>{" "}
                </thead>{" "}
                <tbody className="divide-y divide-slate-100">
                  {" "}
                  {slide.comparison?.map((row) => (
                    <tr key={row.feature}>
                      {" "}
                      <td className="p-3 font-bold text-slate-900">
                        {row.feature}
                      </td>{" "}
                      <td className="p-3 text-slate-500">{row.uc}</td>{" "}
                      <td className="p-3 text-slate-500">{row.dlc}</td>{" "}
                      <td className="p-3 font-semibold text-slate-900 bg-amber-50/50">
                        {row.dihadi}
                      </td>{" "}
                    </tr>
                  ))}{" "}
                </tbody>{" "}
              </table>{" "}
            </div>{" "}
          </div>
        )}{" "}
        {slide.type === "swot" && (
          <div className="space-y-4">
            {" "}
            <div>
              {" "}
              <h2 className="text-2xl font-black text-slate-900">
                {slide.title}
              </h2>{" "}
              <p className="text-xs text-slate-500 mt-0.5">
                {slide.subtitle}
              </p>{" "}
            </div>{" "}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {" "}
              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl space-y-1">
                {" "}
                <h3 className="font-extrabold text-xs text-amber-900 uppercase">
                   {t("STRENGTHS")} </h3>{" "}
                <ul className="text-[11px] text-amber-800 space-y-0.5 list-disc list-inside">
                  {" "}
                  {slide.swot?.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}{" "}
                </ul>{" "}
              </div>{" "}
              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl space-y-1">
                {" "}
                <h3 className="font-extrabold text-xs text-amber-900 uppercase">
                   {t("WEAKNESSES")} </h3>{" "}
                <ul className="text-[11px] text-amber-800 space-y-0.5 list-disc list-inside">
                  {" "}
                  {slide.swot?.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}{" "}
                </ul>{" "}
              </div>{" "}
              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl space-y-1">
                {" "}
                <h3 className="font-extrabold text-xs text-amber-900 uppercase">
                   {t("OPPORTUNITIES")} </h3>{" "}
                <ul className="text-[11px] text-amber-800 space-y-0.5 list-disc list-inside">
                  {" "}
                  {slide.swot?.opportunities.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}{" "}
                </ul>{" "}
              </div>{" "}
              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl space-y-1">
                {" "}
                <h3 className="font-extrabold text-xs text-amber-900 uppercase">
                   {t("THREATS")} </h3>{" "}
                <ul className="text-[11px] text-amber-800 space-y-0.5 list-disc list-inside">
                  {" "}
                  {slide.swot?.threats.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}{" "}
                </ul>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Slide Navigation Footer */}{" "}
      <div className="h-14 bg-white border-t border-slate-200 px-4 sm:px-6 flex items-center justify-between">
        {" "}
        <button
          type="button"
          onClick={() => {
            if (currentSlide > 0) {
              setCurrentSlide(currentSlide - 1);
            }
          }}
          disabled={currentSlide === 0}
          className="text-xs font-bold text-slate-700 hover:text-slate-950 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
        >
          {" "}
          <ChevronLeft className="w-4 h-4" />{" "}
          <span className="hidden sm:inline"> {t("Previous")} </span>{" "}
        </button>{" "}
        <div className="flex gap-1.5 items-center">
          {" "}
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${currentSlide === idx ? "w-6 bg-slate-900" : "w-2 bg-slate-200 hover:bg-slate-300"}`}
              title={`Jump to slide ${idx + 1}`}
            />
          ))}{" "}
        </div>{" "}
        <button
          type="button"
          onClick={() => {
            if (currentSlide < slides.length - 1) {
              setCurrentSlide(currentSlide + 1);
            } else {
              setCurrentSlide(0);
            }
          }}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
        >
          {" "}
          <span>
            {currentSlide === slides.length - 1 ? "Restart Deck" : "Next Slide"}
          </span>{" "}
          <ArrowRight className="w-3.5 h-3.5" />{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
};
