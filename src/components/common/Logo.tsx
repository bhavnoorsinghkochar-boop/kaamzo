import React from "react";
import { useTranslation } from "react-i18next";

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className = "", onClick }) => {
    const { t } = useTranslation();
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${
        onClick
          ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
          : ""
      } ${className}`}
      title={t("Kaamzo")}
      aria-label={onClick ? "Return to Kaamzo home" : "Kaamzo"}
    >
      <span className="font-black tracking-tight select-none inline-flex items-baseline leading-none">
        <span className="text-amber-500 dark:text-[#FCD33F]"> {t("Kaam")} </span>
        <span className="text-slate-900 dark:text-white"> {t("zo")} </span>
      </span>
    </div>
  );
};


