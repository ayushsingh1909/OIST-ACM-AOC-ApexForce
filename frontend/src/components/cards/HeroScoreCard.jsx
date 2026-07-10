import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useCountUp } from "../../animations/useCountUp";
import { useReducedMotion } from "../../animations/useReducedMotion";

const HeroScoreCard = ({
  title,
  score,
  classification,
  status = "ready", // "ready" | "developing" | "risk"
  subtitle,
  rankText
}) => {
  const isReduced = useReducedMotion();
  const countRef = useCountUp(score, 1.8);
  const badgeRef = useRef(null);
  const indicatorRef = useRef(null);

  // Status mapping to technical ochre/forest/oxide theme
  const statusColors = {
    ready: {
      text: "text-[#0F5132]",
      bg: "bg-[#E8F5E9]",
      border: "border-[#0F5132]/20",
      accent: "#0F5132"
    },
    developing: {
      text: "text-[#855800]",
      bg: "bg-[#FFF9E6]",
      border: "border-[#855800]/20",
      accent: "#855800"
    },
    risk: {
      text: "text-[#B30006]",
      bg: "bg-[#FFEBEE]",
      border: "border-[#B30006]/20",
      accent: "#B30006"
    }
  };

  const currentTheme = statusColors[status] || statusColors.ready;

  useEffect(() => {
    if (isReduced) {
      if (badgeRef.current) gsap.set(badgeRef.current, { opacity: 1, scale: 1 });
      if (indicatorRef.current) gsap.set(indicatorRef.current, { left: `${score}%` });
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Staggered fade/scale badge entrance after number settles
      gsap.fromTo(badgeRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, delay: 1.4, ease: "back.out(1.7)" }
      );

      // 2. Animate calibration slider indicator pip
      gsap.fromTo(indicatorRef.current,
        { left: "0%" },
        { left: `${score}%`, duration: 1.8, ease: "power3.out" }
      );
    });

    return () => ctx.revert();
  }, [score, isReduced]);

  return (
    <div className="bg-white border border-[#111111]/10 rounded-2xl p-8 flex flex-col justify-between h-[340px] shadow-[0_4px_20px_rgba(17,17,17,0.015)] relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#555555] uppercase tracking-widest block font-mono">
            {title}
          </span>
          <span
            ref={badgeRef}
            className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider font-mono ${currentTheme.text} ${currentTheme.bg} ${currentTheme.border}`}
          >
            {classification}
          </span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" /> {/* Signature Pip */}
      </div>

      {/* Numerical Metric Display */}
      <div className="my-auto">
        <div className="flex items-baseline text-[#111111]">
          <span ref={countRef} className="text-7xl font-semibold tracking-tight font-mono leading-none">0</span>
          <span className="text-3xl font-normal ml-1 font-mono">%</span>
        </div>

        {/* Calibration Slide Dial (Direction A Signature element) */}
        <div className="mt-6 relative w-full h-8 flex flex-col justify-end">
          {/* Diagnostic tick markings */}
          <div className="absolute inset-x-0 bottom-3 h-2 flex justify-between select-none">
            {[...Array(11)].map((_, i) => (
              <span key={i} className="w-[1px] h-full bg-[#111111]/20 font-mono text-[8px] text-[#555555] flex flex-col justify-between items-center">
                <span className="w-[1px] h-1.5 bg-[#111111]/20" />
                <span className="mt-1">{i * 10}</span>
              </span>
            ))}
          </div>
          {/* Main gauge track */}
          <div className="w-full h-[2px] bg-[#111111]/10 absolute bottom-3" />
          
          {/* Slider Pip */}
          <div
            ref={indicatorRef}
            style={{ left: "0%" }}
            className="absolute bottom-[9px] w-2.5 h-2.5 bg-[#111111] rounded-full border-2 border-white -ml-1.25 shadow"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center border-t border-[#111111]/5 pt-4 text-[10px] text-[#555555] font-semibold uppercase tracking-wider font-mono">
        <span>{subtitle}</span>
        <span>{rankText}</span>
      </div>

    </div>
  );
};

export default HeroScoreCard;
