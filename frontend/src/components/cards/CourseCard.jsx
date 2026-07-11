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
    "High Risk": "text-rose-500 bg-rose-50",
    "Medium Risk": "text-amber-600 bg-amber-50",
    "Low Risk": "text-[#00D2C4] bg-teal-50"
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
      className="bg-white rounded-3xl shadow-outcrowd hover:shadow-outcrowd-hover border border-slate-100 p-8 flex flex-col justify-between h-[320px] cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full font-sans uppercase tracking-widest ${currentTheme}`}>
            {riskLevel}
          </span>
          <h3 className="text-xl font-bold tracking-tight text-slate-800 mt-3 font-heading">
            {topicName}
          </h3>
        </div>
        <span className="hover-arrow text-lg font-bold transition-transform text-[#4F46E5] opacity-0 group-hover:opacity-100">→</span>
      </div>

      {/* Progress metrics container */}
      <div className="my-auto space-y-3">
        <div className="flex justify-between items-baseline font-sans text-xs">
          <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Topic Mastery</span>
          <span className="text-slate-700 font-bold text-sm">{progress}%</span>
        </div>
        {/* Minimal linear progress bar */}
        <div className="w-full h-[6px] bg-slate-100 rounded-full overflow-hidden relative">
          <div ref={fillRef} className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] rounded-full shadow-sm" />
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-slate-100/60 pt-4 text-[11px] text-slate-500 font-bold uppercase tracking-wider font-sans">
        <span>{overdueCount > 0 ? <span className="text-rose-500">{overdueCount} LESSONS OVERDUE</span> : "ON TRACK"}</span>
        <span className="text-[#4F46E5]">CONTINUE LEARNING</span>
      </div>
    </div>
  );
};

export default CourseCard;
