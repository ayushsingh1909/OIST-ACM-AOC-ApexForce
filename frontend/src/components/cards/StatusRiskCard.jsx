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
      border: "border-l-4 border-l-[#B30006]",
      bg: "bg-[#FFEBEE]/20",
      badge: "bg-[#FFEBEE] text-[#B30006] border-[#B30006]/20"
    },
    Medium: {
      border: "border-l-4 border-l-[#855800]",
      bg: "bg-[#FFF9E6]/25",
      badge: "bg-[#FFF9E6] text-[#855800] border-[#855800]/20"
    },
    Low: {
      border: "border-l-4 border-l-[#0F5132]",
      bg: "bg-[#E8F5E9]/20",
      badge: "bg-[#E8F5E9] text-[#0F5132] border-[#0F5132]/20"
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
      className={`p-5 rounded-2xl bg-white border border-[#111111]/7 ${theme.border} ${theme.bg} shadow-[0_2px_15px_rgba(17,17,17,0.01)] flex items-start justify-between gap-4 transition-all`}
    >
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-[#111111] font-mono tracking-tight block">
          {title}
        </span>
        {description && (
          <p className="text-[11px] text-[#555555] leading-relaxed font-sans">{description}</p>
        )}
      </div>

      {badgeText && (
        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${theme.badge}`}>
          {badgeText}
        </span>
      )}

    </div>
  );
};

export default StatusRiskCard;
