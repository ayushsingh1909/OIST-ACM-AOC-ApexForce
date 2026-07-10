import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useCardHover } from "../../animations/useCardHover";
import { useReducedMotion } from "../../animations/useReducedMotion";

const CourseCard = ({ topicName, progress, riskLevel, onClick, overdueCount = 0 }) => {
  const hoverRef = useCardHover();
  const fillRef = useRef(null);
  const isReduced = useReducedMotion();

  // Mapping risk to Blueprint theme functional colors
  const riskThemes = {
    "High Risk": "text-[#B30006] bg-[#B30006]/5 border-[#B30006]/20",
    "Medium Risk": "text-black bg-black/5 border-black/10",
    "Low Risk": "text-black bg-[#FFFFFF] border-black/10"
  };

  const currentTheme = riskThemes[riskLevel] || riskThemes["Low Risk"];

  useEffect(() => {
    if (isReduced) {
      if (fillRef.current) gsap.set(fillRef.current, { width: `${progress}%` });
      return;
    }
    // Animate progress bar fill width
    gsap.fromTo(fillRef.current,
      { width: "0%" },
      { width: `${progress}%`, duration: 1.4, ease: "power3.out", delay: 0.2 }
    );
  }, [progress, isReduced]);

  return (
    <div
      ref={hoverRef}
      onClick={onClick}
      className="bg-[#FFFFFF] border border-black/10 p-8 flex flex-col justify-between h-[320px] cursor-pointer transition-all overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className={`text-[9px] font-bold px-2 py-0.5 border font-sans uppercase tracking-widest ${currentTheme}`}>
            {riskLevel}
          </span>
          <h3 className="text-xl font-bold tracking-tight text-[#000000] mt-4 font-sans uppercase">
            {topicName}
          </h3>
        </div>
        <span className="hover-arrow text-lg font-bold transition-transform text-[#000000]">→</span>
      </div>

      {/* Progress metrics container */}
      <div className="my-auto space-y-3">
        <div className="flex justify-between items-baseline font-sans text-xs">
          <span className="text-[#000000] font-bold uppercase tracking-widest text-[10px]">Topic Mastery</span>
          <span className="text-[#000000] font-bold">{progress}%</span>
        </div>
        {/* Minimal linear progress bar */}
        <div className="w-full h-[3px] bg-black/10 overflow-hidden relative">
          <div ref={fillRef} className="absolute left-0 top-0 h-full bg-[#000000]" />
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-black/10 pt-4 text-[10px] text-[#000000] font-bold uppercase tracking-widest font-sans">
        <span>{overdueCount > 0 ? `${overdueCount} LESSONS OVERDUE` : "ON TRACK"}</span>
        <span>CONTINUE LEARNING</span>
      </div>
    </div>
  );
};

export default CourseCard;
