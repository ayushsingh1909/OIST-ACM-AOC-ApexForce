import React from "react";
import { useScrollReveal } from "../../animations/useScrollReveal";

const ChartContainerCard = ({
  title,
  description,
  filterControls,
  children
}) => {
  const containerRef = useScrollReveal({ y: 35 });

  return (
    <div
      ref={containerRef}
      className="bg-white border border-[#111111]/7 rounded-2xl p-6 md:p-8 shadow-[0_4px_30px_rgba(17,17,17,0.015)] flex flex-col gap-6"
    >
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#111111]/5 pb-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[#111111] uppercase tracking-tight font-mono">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] text-[#555555] leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {filterControls && (
          <div className="flex items-center gap-2">
            {filterControls}
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full relative min-h-[240px]">
        {children}
      </div>

    </div>
  );
};

export default ChartContainerCard;
