import React from "react";
import { useScrollReveal } from "../animations/useScrollReveal";
import { useCountUp } from "../animations/useCountUp";
import { useCardHover } from "../animations/useCardHover";

const AnimationDemo = () => {
  // 1. Hover Card setup
  const hoverCardRef = useCardHover();

  // 2. Count-Up numeric metric setup
  const countUpRef = useCountUp(88, 1.8);

  // 3. Scroll Reveal elements setups
  const scrollRevealRef1 = useScrollReveal({ y: 40 });
  const scrollRevealRef2 = useScrollReveal({ y: 50, delay: 0.2 });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans px-8 py-20 flex flex-col items-center gap-16">
      
      {/* Editorial Header */}
      <header className="max-w-xl text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#635BFF]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#555555]">Motion & Design System Demo</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight leading-tight">
          Squarespace Style & GSAP Motion Feel
        </h1>
        <p className="text-[#555555] text-sm leading-relaxed">
          This panel demonstrates the staggered entry staggers, count-up numeric tweens, and hover lifts.
        </p>
      </header>

      {/* Primary Hero Score Card (using CardHover and CountUp) */}
      <div
        ref={hoverCardRef}
        className="w-full max-w-sm p-8 rounded-2xl bg-white border border-[#111111]/10 shadow-[0_4px_20px_rgba(17,17,17,0.015)] cursor-pointer flex flex-col justify-between h-[320px] transition-all"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Career Readiness</h3>
            <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 uppercase tracking-wide">
              Highly Ready
            </span>
          </div>
          <span className="hover-arrow text-sm font-semibold transition-transform">→</span>
        </div>

        <div className="flex items-baseline mt-auto mb-2">
          <span ref={countUpRef} className="text-6xl font-semibold tracking-tight leading-none">0</span>
          <span className="text-2xl font-normal ml-0.5">%</span>
        </div>

        <div className="flex justify-between items-center border-t border-[#111111]/5 pt-4 text-[10px] text-[#555555] font-semibold uppercase tracking-wider">
          <span>Overall Mastery</span>
          <span>Rank: Top 5%</span>
        </div>
      </div>

      {/* Scroll Trigger Reveal Section */}
      <div className="w-full max-w-xl border-t border-[#111111]/10 pt-16 flex flex-col gap-10 mt-10">
        <h2 className="text-xl font-medium tracking-tight text-center">Scroll Down to Preview Reveal Hooks</h2>
        
        <div className="h-[400px] flex items-center justify-center border border-dashed border-[#111111]/10 rounded-2xl text-[#555555] text-xs">
          [ Spacer to simulate viewport scrolling ]
        </div>

        <div
          ref={scrollRevealRef1}
          className="p-8 bg-white border border-[#111111]/10 rounded-2xl shadow-[0_4px_20px_rgba(17,17,17,0.015)] space-y-3"
        >
          <span className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Scroll Reveal Panel A</span>
          <h4 className="text-lg font-medium tracking-tight">Fade & Slide Reveal</h4>
          <p className="text-xs text-[#555555] leading-relaxed">
            This card slides up gracefully using ScrollTrigger once it crosses 85% of the viewport height.
          </p>
        </div>

        <div
          ref={scrollRevealRef2}
          className="p-8 bg-white border border-[#111111]/10 rounded-2xl shadow-[0_4px_20px_rgba(17,17,17,0.015)] space-y-3"
        >
          <span className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Scroll Reveal Panel B</span>
          <h4 className="text-lg font-medium tracking-tight">Staggered Delay Reveal</h4>
          <p className="text-xs text-[#555555] leading-relaxed">
            This card enters slightly after the first panel to create an elegant motion sequence.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AnimationDemo;
