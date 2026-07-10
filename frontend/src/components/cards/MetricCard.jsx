import React from "react";
import { useCountUp } from "../../animations/useCountUp";
import { useCardHover } from "../../animations/useCardHover";

const MetricCard = ({
  title,
  score,
  suffix = "%",
  classification,
  description,
  trendValue, // positive (e.g. +5) or negative (e.g. -2)
  footerLeft,
  footerRight
}) => {
  const hoverRef = useCardHover();
  const countRef = useCountUp(score, 1.6);

  const getTrendStyle = (val) => {
    if (!val) return null;
    const isPositive = val.toString().startsWith("+");
    return {
      text: isPositive ? "text-[#0F5132]" : "text-[#B30006]",
      label: isPositive ? `↑ ${val}` : `↓ ${val}`
    };
  };

  const trend = getTrendStyle(trendValue);

  return (
    <div
      ref={hoverRef}
      className="bg-white border border-[#111111]/7 rounded-2xl p-8 flex flex-col justify-between h-[320px] shadow-[0_4px_30px_rgba(17,17,17,0.015)] cursor-pointer transition-all overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold text-[#555555] uppercase tracking-widest font-mono">
            {title}
          </h4>
          {classification && (
            <span className="text-[9px] font-mono font-bold text-[#111111]/60 block uppercase">
              {classification}
            </span>
          )}
        </div>
        <span className="hover-arrow text-sm font-semibold transition-transform">→</span>
      </div>

      {/* Metric Middle */}
      <div className="my-auto">
        <div className="flex items-baseline text-[#111111]">
          <span ref={countRef} className="text-6xl font-semibold tracking-tight font-mono leading-none">0</span>
          <span className="text-xl font-normal ml-0.5 font-mono">{suffix}</span>
          
          {trend && (
            <span className={`text-[10px] font-bold font-mono ml-3 ${trend.text}`}>
              {trend.label}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-[#555555] mt-2.5 leading-relaxed font-sans">{description}</p>
        )}
      </div>

      {/* Footer Divider */}
      <div className="flex justify-between items-center border-t border-[#111111]/5 pt-4 text-[10px] text-[#555555] font-semibold uppercase tracking-wider font-mono">
        <span>{footerLeft}</span>
        <span>{footerRight}</span>
      </div>

    </div>
  );
};

export default MetricCard;
