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
      text: isPositive ? "text-black" : "text-black",
      label: isPositive ? `↑ ${val}` : `↓ ${val}`
    };
  };

  const trend = getTrendStyle(trendValue);

  return (
    <div
      ref={hoverRef}
      className="bg-[#FFFFFF] border border-black/10 p-8 flex flex-col justify-between h-[320px] cursor-pointer transition-all overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold text-[#000000] uppercase tracking-widest font-sans">
            {title}
          </h4>
          {classification && (
            <span className="text-[9px] font-sans font-bold text-[#000000]/60 block uppercase">
              {classification}
            </span>
          )}
        </div>
        <span className="hover-arrow text-lg font-bold transition-transform">→</span>
      </div>

      {/* Metric Middle */}
      <div className="my-auto">
        <div className="flex items-baseline text-[#000000]">
          <span ref={countRef} className="text-7xl font-bold tracking-tighter font-sans leading-none">0</span>
          <span className="text-2xl font-bold ml-0.5 font-sans">{suffix}</span>
          
          {trend && (
            <span className={`text-[10px] font-bold font-sans ml-3 ${trend.text}`}>
              {trend.label}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-[#000000] mt-3 leading-relaxed font-sans">{description}</p>
        )}
      </div>

      {/* Footer Divider */}
      <div className="flex justify-between items-center border-t border-black/10 pt-4 text-[10px] text-[#000000] font-bold uppercase tracking-widest font-sans">
        <span>{footerLeft}</span>
        <span>{footerRight}</span>
      </div>

    </div>
  );
};

export default MetricCard;
