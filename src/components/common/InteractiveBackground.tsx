import React, { useEffect, useState, useRef } from "react";
import {
  HardHat,
  Hammer,
  Compass,
  ShieldCheck,
  Building2,
  Sparkles,
  Wrench,
  Layers,
} from "lucide-react";

export const InteractiveBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (frameRef.current) return;

      frameRef.current = requestAnimationFrame(() => {
        const x = Math.round((e.clientX / window.innerWidth) * 100);
        const y = Math.round((e.clientY / window.innerHeight) * 100);
        setMousePos({ x, y });
        frameRef.current = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-opacity duration-700"
      aria-hidden="true"
    >
      {/* 1. Structural Architectural Grid & Blueprint Mesh */}
      <div className="absolute inset-0 bg-grid-mesh opacity-60 dark:opacity-30" />
      <div className="absolute inset-0 bg-dots-mesh opacity-40 dark:opacity-20" />

      {/* 2. Top-Center Warm Ambient Light Source */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[500px] rounded-full blur-3xl transition-transform duration-1000 ease-out animate-pulse-ambient"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(252, 211, 63, 0.18) 0%, rgba(245, 158, 11, 0.08) 45%, transparent 70%)",
        }}
      />

      {/* 3. Subtle Interactive Cursor-Follow Halo */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[90px] opacity-40 dark:opacity-25 transition-all duration-700 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          background:
            "radial-gradient(circle, rgba(252, 211, 63, 0.22) 0%, rgba(217, 119, 6, 0.06) 50%, transparent 80%)",
        }}
      />

      {/* 4. Peripheral Corner Depth Glows */}
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 dark:opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25 dark:opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)",
        }}
      />

      {/* 5. Floating Blueprint Ambient Icons (Decorators in Peripheral Space) */}
      <div className="absolute top-[18%] left-[8%] text-amber-500/20 dark:text-[#FFE57F]/15 animate-float-slow hidden md:block">
        <HardHat className="w-14 h-14" />
      </div>

      <div className="absolute top-[28%] right-[7%] text-amber-600/20 dark:text-[#FCD33F]/15 animate-float-delayed hidden md:block">
        <Compass className="w-16 h-16" />
      </div>

      <div className="absolute bottom-[22%] left-[10%] text-amber-700/15 dark:text-[#FFE57F]/10 animate-float-fast hidden lg:block">
        <Hammer className="w-12 h-12" />
      </div>

      <div className="absolute bottom-[28%] right-[10%] text-amber-500/20 dark:text-[#FCD33F]/15 animate-float-slow hidden md:block">
        <ShieldCheck className="w-14 h-14" />
      </div>

      <div className="absolute top-[55%] left-[4%] text-slate-400/20 dark:text-amber-300/10 animate-float-delayed hidden xl:block">
        <Building2 className="w-12 h-12" />
      </div>

      <div className="absolute top-[48%] right-[4%] text-amber-400/25 dark:text-[#FCD33F]/20 animate-float-fast hidden xl:block">
        <Sparkles className="w-10 h-10" />
      </div>

      <div className="absolute top-[12%] right-[25%] text-amber-600/15 dark:text-[#FFE57F]/10 animate-float-delayed hidden 2xl:block">
        <Wrench className="w-9 h-9" />
      </div>

      <div className="absolute bottom-[14%] left-[30%] text-amber-500/15 dark:text-[#FCD33F]/10 animate-float-slow hidden 2xl:block">
        <Layers className="w-10 h-10" />
      </div>
    </div>
  );
};
