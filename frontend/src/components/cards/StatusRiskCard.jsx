import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "../../animations/useReducedMotion";

const StatusRiskCard = ({
  title,
  description,
  priority = "Medium", // "High" | "Medium" | "Low"
  badgeText
}) => {
  const cardRef = useRef(null);
  const isReduced = useReducedMotion();

  // Mapping urgency to blueprint functional colors
  const priorityThemes = {
    High: {
      border: "border-l-[6px] border-l-[#B30006]",
      bg: "bg-[#FFFFFF]",
      badge: "bg-[#B30006]/10 text-[#B30006] border-[#B30006]"
    },
    Medium: {
      border: "border-l-[6px] border-l-black",
      bg: "bg-[#FFFFFF]",
      badge: "bg-black/5 text-black border-black"
    },
    Low: {
      border: "border-l-[6px] border-l-black/50",
      bg: "bg-[#FFFFFF]",
      badge: "bg-[#FFFFFF] text-black border-black/50"
    }
  };

  const theme = priorityThemes[priority] || priorityThemes.Medium;

  useEffect(() => {
    if (isReduced) return;
    const el = cardRef.current;
    if (!el) return;

    // Settle-in slide reveal on first mount (no looping)
    gsap.fromTo(el,
      { opacity: 0, x: -15 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
    );
  }, [isReduced]);

  return (
    <div
      ref={cardRef}
      className={`p-5 bg-[#FFFFFF] border border-black/10 ${theme.border} ${theme.bg} flex items-start justify-between gap-4 transition-all`}
    >
      <div className="space-y-1">
        <span className="text-[12px] font-bold text-[#000000] font-sans tracking-wide block">
          {title}
        </span>
        {description && (
          <p className="text-[11px] text-[#000000] leading-relaxed font-sans">{description}</p>
        )}
      </div>

      {badgeText && (
        <span className={`text-[9px] font-sans font-bold px-2 py-0.5 border uppercase tracking-widest ${theme.badge}`}>
          {badgeText}
        </span>
      )}

    </div>
  );
};

export default StatusRiskCard;
