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
      text: "text-black",
      bg: "bg-[#FFFFFF]",
      border: "border border-black",
      accent: "#000000"
    },
    developing: {
      text: "text-black",
      bg: "bg-[#FFFFFF]",
      border: "border border-black",
      accent: "#000000"
    },
    risk: {
      text: "text-black",
      bg: "bg-[#FFFFFF]",
      border: "border border-black",
      accent: "#000000"
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
    <div className="bg-[#FFFFFF] border border-black/10 p-8 flex flex-col justify-between h-[340px] relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#000000] uppercase tracking-widest block font-sans">
            {title}
          </span>
          <span
            ref={badgeRef}
            className={`inline-block text-[10px] font-bold px-3 py-1 uppercase tracking-widest font-sans ${currentTheme.text} ${currentTheme.bg} ${currentTheme.border}`}
          >
            {classification}
          </span>
        </div>
      </div>

      {/* Numerical Metric Display */}
      <div className="my-auto">
        <div className="flex items-baseline text-[#000000]">
          <span ref={countRef} className="text-8xl font-bold tracking-tighter font-sans leading-none">0</span>
          <span className="text-4xl font-bold ml-1 font-sans">%</span>
        </div>

        {/* Calibration Slide Dial (Direction A Signature element) */}
        <div className="mt-6 relative w-full h-8 flex flex-col justify-end">
          {/* Diagnostic tick markings */}
          <div className="absolute inset-x-0 bottom-3 h-2 flex justify-between select-none">
            {[...Array(11)].map((_, i) => (
              <span key={i} className="w-[1px] h-full bg-black/20 font-sans font-bold text-[8px] text-black flex flex-col justify-between items-center">
                <span className="w-[1px] h-1.5 bg-black/20" />
                <span className="mt-1">{i * 10}</span>
              </span>
            ))}
          </div>
          {/* Main gauge track */}
          <div className="w-full h-[2px] bg-black/10 absolute bottom-3" />
          
          {/* Slider Pip */}
          <div
            ref={indicatorRef}
            style={{ left: "0%" }}
            className="absolute bottom-[9px] w-2.5 h-2.5 bg-[#000000] border-2 border-white -ml-1.25"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center border-t border-black/10 pt-4 text-[10px] text-[#000000] font-bold uppercase tracking-widest font-sans">
        <span>{subtitle}</span>
        <span>{rankText}</span>
      </div>

    </div>
  );
};

export default HeroScoreCard;
