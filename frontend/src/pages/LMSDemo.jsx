import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  FiLayers, FiBookOpen, FiCheckSquare, FiFileText,
  FiMic, FiTrendingUp, FiFile, FiSettings, FiLogOut,
  FiMenu, FiX, FiActivity
} from "react-icons/fi";
import { useCountUp } from "../animations/useCountUp";
import { useCardHover } from "../animations/useCardHover";
import { useReducedMotion } from "../animations/useReducedMotion";

const LMSDemo = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isReduced = useReducedMotion();

  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);

  // Animate sidebar toggle (collapsed vs expanded) using GSAP
  useEffect(() => {
    if (isReduced) return;
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    gsap.to(sidebar, {
      width: collapsed ? "80px" : "260px",
      duration: 0.45,
      ease: "power3.inOut"
    });
  }, [collapsed, isReduced]);

  // Stagger reveal of main elements on load
  useEffect(() => {
    gsap.from(".lms-stagger", {
      opacity: 0,
      y: 30,
      duration: 1.0,
      stagger: 0.12,
      ease: "power3.out"
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] flex font-sans relative overflow-hidden">
      
      {/* ───────────────────────────────────────────── */}
      {/* 1. Collapsible Persistent Left Sidebar (Step 2) */}
      {/* ───────────────────────────────────────────── */}
      <aside
        ref={sidebarRef}
        style={{ width: "260px" }}
        className="hidden md:flex flex-col bg-white border-r border-[#111111]/10 h-screen sticky top-0 z-40 transition-shadow select-none overflow-hidden"
      >
        {/* Top Logo and Collapse toggle */}
        <div className="p-6 flex items-center justify-between border-b border-[#111111]/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#635BFF] flex items-center justify-center rounded-lg text-white font-bold font-mono">
              A
            </div>
            {!collapsed && (
              <span className="font-bold text-sm tracking-tight font-mono uppercase text-[#111111]">
                ACIE LMS
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-black/5 text-[#555555]"
            title="Toggle Sidebar"
          >
            <FiMenu className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          <SidebarLink icon={FiLayers} label="Dashboard" active={true} collapsed={collapsed} />
          <SidebarLink icon={FiBookOpen} label="Courses" active={false} collapsed={collapsed} />
          <SidebarLink icon={FiCheckSquare} label="Quizzes" active={false} collapsed={collapsed} />
          <SidebarLink icon={FiFileText} label="Assignments" active={false} collapsed={collapsed} />
          <SidebarLink icon={FiMic} label="Interviews" active={false} collapsed={collapsed} />
          <SidebarLink icon={FiTrendingUp} label="Readiness" active={false} collapsed={collapsed} />
          <SidebarLink icon={FiFile} label="Resume Scan" active={false} collapsed={collapsed} />
        </nav>

        {/* Bottom Profile and Settings Drawer */}
        <div className="p-4 border-t border-[#111111]/5 flex flex-col gap-2 bg-[#FAFAFA]/50">
          <SidebarLink icon={FiSettings} label="Settings" active={false} collapsed={collapsed} />
          <SidebarLink icon={FiLogOut} label="Sign Out" active={false} collapsed={collapsed} />
          
          {/* User profile capsule */}
          <div className="flex items-center gap-3 mt-2 p-2 border border-[#111111]/5 rounded-xl bg-white">
            <div className="w-8 h-8 rounded-full bg-[#111111]/5 flex items-center justify-center font-bold text-xs text-[#111111] font-mono">
              AP
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#111111] truncate">Arthur P.</p>
                <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase">Highly Ready</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header (Hamburger Menu) */}
      <div className="md:hidden w-full bg-white border-b border-[#111111]/10 px-6 py-4 flex items-center justify-between absolute top-0 left-0 z-50">
        <span className="font-bold text-sm tracking-tight font-mono uppercase text-[#111111]">ACIE LMS</span>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-[#111111]">
          <FiMenu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-[#111111]/40 backdrop-blur-sm z-50 md:hidden flex justify-start">
          <div className="w-[260px] bg-white h-full flex flex-col p-6 border-r border-[#111111]/10 relative">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-2 text-[#111111]"
            >
              <FiX className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm tracking-tight font-mono uppercase text-[#111111] mb-8">ACIE LMS</span>
            <nav className="flex-grow flex flex-col gap-1">
              <SidebarLink icon={FiLayers} label="Dashboard" active={true} />
              <SidebarLink icon={FiBookOpen} label="Courses" active={false} />
              <SidebarLink icon={FiCheckSquare} label="Quizzes" active={false} />
              <SidebarLink icon={FiFileText} label="Assignments" active={false} />
              <SidebarLink icon={FiMic} label="Interviews" active={false} />
              <SidebarLink icon={FiTrendingUp} label="Readiness" active={false} />
              <SidebarLink icon={FiFile} label="Resume Scan" active={false} />
            </nav>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────── */}
      {/* 2. Main Work Content Canvas */}
      {/* ───────────────────────────────────────────── */}
      <main
        ref={mainContentRef}
        className="flex-grow p-8 md:p-12 mt-16 md:mt-0 max-w-4xl mx-auto flex flex-col gap-10 overflow-y-auto"
      >
        
        {/* Course Header */}
        <div className="space-y-1.5 lms-stagger">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" />
            <span className="text-[10px] font-bold text-[#555555] uppercase tracking-widest font-mono">LMS Layout & Motion Demo</span>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#111111]">
            LMS Dashboard System Demo
          </h2>
          <p className="text-[#555555] text-xs">
            Reviewing persistent collapsible navigation sidebar, linear slide calibration metrics, and course progress card.
          </p>
        </div>

        {/* Core elements demo layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Hero Readiness Card */}
          <div className="lms-stagger">
            <h4 className="text-[10px] font-bold text-[#555555] uppercase tracking-widest mb-3 font-mono">1. Hero Score Card (CRS)</h4>
            <DemoHeroCard score={88} classification="Highly Ready" status="ready" />
          </div>

          {/* Course Card */}
          <div className="lms-stagger">
            <h4 className="text-[10px] font-bold text-[#555555] uppercase tracking-widest mb-3 font-mono">2. Course / Topic Card</h4>
            <DemoCourseCard topicName="React & Custom Hooks" progress={75} riskLevel="Low Risk" />
          </div>

        </div>

      </main>

    </div>
  );
};

// ─────────────────────────────────────────────
// Sidebar Nav Link Helper
// ─────────────────────────────────────────────
const SidebarLink = ({ icon: Icon, label, active, collapsed }) => {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all group ${
        active
          ? "bg-[#635BFF]/10 text-[#635BFF] font-semibold"
          : "hover:bg-[#FAFAFA] text-[#555555] hover:text-[#111111]"
      }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#635BFF]" : "text-[#555555] group-hover:text-[#111111] transition-colors"}`} />
      {!collapsed && (
        <span className="text-xs font-mono tracking-tight transition-opacity duration-200">
          {label}
        </span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Demo components
// ─────────────────────────────────────────────
const DemoHeroCard = ({ score, classification, status }) => {
  const countRef = useCountUp(score, 1.8);
  const badgeRef = useRef(null);
  const indicatorRef = useRef(null);
  const isReduced = useReducedMotion();

  useEffect(() => {
    if (isReduced) {
      if (badgeRef.current) gsap.set(badgeRef.current, { opacity: 1, scale: 1 });
      if (indicatorRef.current) gsap.set(indicatorRef.current, { left: `${score}%` });
      return;
    }

    // Delayed badge reveal + dial indicators slide-in
    gsap.fromTo(badgeRef.current,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.5, delay: 1.4, ease: "back.out(1.5)" }
    );
    gsap.fromTo(indicatorRef.current,
      { left: "0%" },
      { left: `${score}%`, duration: 1.8, ease: "power3.out" }
    );
  }, [score, isReduced]);

  return (
    <div className="bg-white border border-[#111111]/10 rounded-2xl p-8 flex flex-col justify-between h-[320px] shadow-[0_4px_25px_rgba(17,17,17,0.01)] relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#555555] uppercase tracking-widest block font-mono">
            Certification Readiness
          </span>
          <span
            ref={badgeRef}
            className="inline-block text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono text-emerald-700 bg-emerald-500/10 border-emerald-500/20"
          >
            {classification}
          </span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" />
      </div>

      <div className="my-auto">
        <div className="flex items-baseline text-[#111111]">
          <span ref={countRef} className="text-7xl font-semibold tracking-tight font-mono leading-none">0</span>
          <span className="text-2xl font-normal ml-0.5 font-mono">%</span>
        </div>

        {/* Linear calibration dial slide indicator */}
        <div className="mt-6 relative w-full h-8 flex flex-col justify-end">
          <div className="absolute inset-x-0 bottom-3 h-2 flex justify-between select-none">
            {[...Array(11)].map((_, i) => (
              <span key={i} className="w-[1px] h-full bg-[#111111]/20 font-mono text-[8px] text-[#555555] flex flex-col justify-between items-center">
                <span className="w-[1px] h-1.5 bg-[#111111]/20" />
                <span className="mt-1">{i * 10}</span>
              </span>
            ))}
          </div>
          <div className="w-full h-[2px] bg-[#111111]/10 absolute bottom-3" />
          <div
            ref={indicatorRef}
            style={{ left: "0%" }}
            className="absolute bottom-[9px] w-2.5 h-2.5 bg-[#111111] rounded-full border-2 border-white -ml-1.25 shadow"
          />
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-[#111111]/5 pt-4 text-[10px] text-[#555555] font-semibold uppercase tracking-wider font-mono">
        <span>CRS OVERALL INDEX</span>
        <span>PLACEMENT ALIGNED</span>
      </div>
    </div>
  );
};

const DemoCourseCard = ({ topicName, progress, riskLevel }) => {
  const hoverRef = useCardHover();
  const fillRef = useRef(null);
  const isReduced = useReducedMotion();

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
      className="bg-white border border-[#111111]/7 rounded-2xl p-8 flex flex-col justify-between h-[320px] shadow-[0_4px_25px_rgba(17,17,17,0.01)] cursor-pointer transition-all overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
            {riskLevel}
          </span>
          <h3 className="text-sm font-semibold tracking-tight text-[#111111] mt-2 font-mono uppercase">
            {topicName}
          </h3>
        </div>
        <span className="hover-arrow text-sm font-semibold transition-transform">→</span>
      </div>

      {/* Progress metrics container */}
      <div className="my-auto space-y-3">
        <div className="flex justify-between items-baseline font-mono text-xs">
          <span className="text-[#555555] uppercase tracking-wider text-[10px]">Topic Mastery</span>
          <span className="text-[#111111] font-bold">{progress}%</span>
        </div>
        {/* Minimal linear progress bar */}
        <div className="w-full h-1.5 bg-[#111111]/5 rounded-full overflow-hidden relative">
          <div ref={fillRef} className="absolute left-0 top-0 h-full bg-[#635BFF] rounded-full" />
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-[#111111]/5 pt-4 text-[10px] text-[#555555] font-semibold uppercase tracking-wider font-mono">
        <span>2 LESSONS OVERDUE</span>
        <span>CONTINUE LEARNING</span>
      </div>
    </div>
  );
};

export default LMSDemo;
