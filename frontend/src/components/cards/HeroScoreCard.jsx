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
      text: "text-[#00D2C4]",
      bg: "bg-teal-50",
      border: "border-0",
      accent: "#00D2C4"
    },
    developing: {
      text: "text-[#4F46E5]",
      bg: "bg-indigo-50",
      border: "border-0",
      accent: "#4F46E5"
    },
    risk: {
      text: "text-rose-500",
      bg: "bg-rose-50",
      border: "border-0",
      accent: "#f43f5e"
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
    <div className="bg-white rounded-3xl shadow-outcrowd hover:shadow-outcrowd-hover border border-slate-100 p-8 flex flex-col justify-between h-[340px] relative overflow-hidden transition-all duration-300">
      
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block font-sans">
            {title}
          </span>
          <span
            ref={badgeRef}
            className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-sans ${currentTheme.text} ${currentTheme.bg} ${currentTheme.border}`}
          >
            {classification}
          </span>
        </div>
      </div>

      {/* Numerical Metric Display */}
      <div className="my-auto">
        <div className="flex items-baseline text-slate-900">
          <span ref={countRef} className="text-[5.5rem] font-bold tracking-tight font-heading leading-none">0</span>
          <span className="text-3xl font-bold ml-1 font-heading text-slate-500">%</span>
        </div>

        {/* Calibration Slide Dial */}
        <div className="mt-8 relative w-full h-8 flex flex-col justify-end">
          {/* Diagnostic tick markings */}
          <div className="absolute inset-x-0 bottom-4 h-2 flex justify-between select-none px-1">
            {[...Array(11)].map((_, i) => (
              <span key={i} className="w-[1px] h-full bg-slate-200 font-sans font-semibold text-[9px] text-slate-500 flex flex-col justify-between items-center">
                <span className="w-[1px] h-1.5 bg-slate-200" />
                <span className="mt-1">{i * 10}</span>
              </span>
            ))}
          </div>
          {/* Main gauge track */}
          <div className="w-full h-[6px] bg-slate-100 rounded-full absolute bottom-[10px] overflow-hidden">
             <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#4F46E5] to-[#00D2C4]" style={{ width: `${score}%` }}></div>
          </div>
          
          {/* Slider Pip */}
          <div
            ref={indicatorRef}
            style={{ left: "0%" }}
            className="absolute bottom-[6px] w-4 h-4 bg-white border-[3px] border-[#4F46E5] rounded-full shadow-md -ml-2 z-10"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center border-t border-slate-100/60 pt-4 text-[11px] text-slate-500 font-semibold uppercase tracking-wider font-sans">
        <span>{subtitle}</span>
        <span className="text-[#4F46E5]">{rankText}</span>
      </div>

    </div>
  );
};

export default HeroScoreCard;
