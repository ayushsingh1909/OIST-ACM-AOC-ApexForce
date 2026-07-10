import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity, FiTarget, FiMessageSquare, FiTrendingUp,
  FiAlertCircle, FiCheckCircle, FiChevronRight, FiRefreshCw, FiZap,
  FiBookOpen, FiMic
} from "react-icons/fi";
import { getCareerSummary, computeCareerScores } from "../../services/careerIntelligence.service";
import toast from "react-hot-toast";
import gsap from "gsap";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const getPriorityBadge = (priority) => {
  const map = {
    High: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Low: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };
  return map[priority] || "bg-slate-500/10 text-slate-500 border-slate-500/20";
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/**
 * Skeleton loader for luxury metrics cards
 */
const ScoreSkeleton = () => (
  <div className="flex flex-col justify-between p-8 rounded-2xl bg-white border border-black/5 h-[320px] animate-pulse">
    <div className="flex justify-between items-start w-full">
      <div className="h-5 w-32 bg-slate-100 rounded" />
      <div className="h-6 w-6 bg-slate-100 rounded-full" />
    </div>
    <div className="h-16 w-36 bg-slate-100 rounded my-auto" />
    <div className="flex justify-between items-center border-t border-black/5 pt-4 w-full">
      <div className="h-3 w-20 bg-slate-100 rounded" />
      <div className="h-3 w-16 bg-slate-100 rounded" />
    </div>
  </div>
);

/**
 * Demo compute modal — lets user simulate an interview session
 */
const ComputeModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    technicalScore: 75, behavioralScore: 70, roleSkillMatch: 80,
    grammarAccuracy: 85, logicalSequencing: 75, conceptArticulation: 80,
    redundancyLevel: 15, starMethodCompliance: 70,
    weakInterviewTopics: "React Hooks, System Design",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "weakInterviewTopics" ? value : Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        weakInterviewTopics: form.weakInterviewTopics.split(",").map(t => t.trim()).filter(Boolean),
      };
      await computeCareerScores(payload);
      toast.success("Scores computed and saved successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to compute scores");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "technicalScore", label: "Technical Score" },
    { name: "behavioralScore", label: "Behavioral Score" },
    { name: "roleSkillMatch", label: "Role Skill Match" },
    { name: "grammarAccuracy", label: "Grammar Accuracy" },
    { name: "logicalSequencing", label: "Logical Sequencing" },
    { name: "conceptArticulation", label: "Concept Articulation" },
    { name: "redundancyLevel", label: "Redundancy Level (lower is better)" },
    { name: "starMethodCompliance", label: "STAR Method Compliance" },
  ];

  return (
    <div className="fixed inset-0 bg-[#111111]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#FBFBF9] border border-black/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-[#111111] tracking-tight mb-1">Simulate Interview Session</h2>
        <p className="text-[#555555] text-xs mb-6">Enter performance values to recalculate career readiness metrics.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.name}>
              <label htmlFor={f.name} className="flex justify-between text-[10px] font-bold text-[#555555] uppercase tracking-widest mb-1.5">
                <span>{f.label}</span>
                <span className="text-[#111111] font-extrabold">{form[f.name]}</span>
              </label>
              <input
                id={f.name}
                type="range" min="0" max="100"
                name={f.name} value={form[f.name]}
                onChange={handleChange}
                className="w-full accent-[#111111]"
              />
            </div>
          ))}
          <div>
            <label htmlFor="weak-topics" className="block text-[10px] font-bold text-[#555555] uppercase tracking-widest mb-1.5">Weak Interview Topics (comma-separated)</label>
            <input
              id="weak-topics"
              type="text" name="weakInterviewTopics" value={form.weakInterviewTopics}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-white border border-black/10 rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#111111] font-mono"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 text-xs border border-black/10 text-[#555555] rounded-xl hover:bg-black/5 font-bold transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-3 text-xs bg-[#111111] text-[#FBFBF9] rounded-xl font-bold transition-all disabled:opacity-50">
              {loading ? "Computing…" : "Compute Scores"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────
const CareerDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCareerSummary();
      setSummary(result.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load career summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // GSAP Entrance and Counter interpolations
  useEffect(() => {
    if (loading || !summary?.hasData) return;

    // 1. Entrance staggered animation
    gsap.from(".luxe-animate", {
      opacity: 0,
      y: 40,
      duration: 1.2,
      stagger: 0.12,
      ease: "power4.out"
    });

    // 2. Numerical counter interpolation
    const animateCount = (id, target) => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: "power3.out",
        onUpdate: () => {
          const el = document.getElementById(id);
          if (el) el.innerText = Math.round(obj.val);
        }
      });
    };

    animateCount("irs-val", summary.scores.IRS);
    animateCount("cci-val", summary.scores.CCI);
    animateCount("crs-val", summary.scores.CRS);

  }, [loading, summary]);

  // Luxury GSAP hover timeline builders
  const handleMouseEnter = (e, arrowId, cardTheme) => {
    gsap.to(e.currentTarget, {
      scale: 1.012,
      borderColor: cardTheme === "black" ? "rgba(255,255,255,0.15)" : "#111111",
      boxShadow: "0 20px 40px rgba(17, 17, 17, 0.04)",
      duration: 0.35,
      ease: "power2.out"
    });
    const arrow = e.currentTarget.querySelector(`#${arrowId}`);
    if (arrow) {
      gsap.to(arrow, { x: 5, duration: 0.25, ease: "power2.out" });
    }
  };

  const handleMouseLeave = (e, arrowId, cardTheme) => {
    gsap.to(e.currentTarget, {
      scale: 1.0,
      borderColor: cardTheme === "black" ? "#111111" : "rgba(17, 17, 17, 0.07)",
      boxShadow: "0 4px 30px rgba(17, 17, 17, 0.02)",
      duration: 0.35,
      ease: "power2.out"
    });
    const arrow = e.currentTarget.querySelector(`#${arrowId}`);
    if (arrow) {
      gsap.to(arrow, { x: 0, duration: 0.25, ease: "power2.out" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#111111] px-6 py-12 max-w-6xl mx-auto flex flex-col gap-10 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/10 luxe-animate">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111111]">
            Career Readiness Summary
          </h1>
          <p className="text-[#555555] text-xs md:text-sm">
            Unified executive dashboard tracking IRS, CCI, and CRS vectors in real time.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSummary}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white border border-black/10 text-[#555555] rounded-xl hover:bg-black/5 hover:border-black/20 transition-all"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#111111] text-[#FBFBF9] rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            <FiZap className="w-3.5 h-3.5" /> Run Assessment
          </button>
        </div>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs luxe-animate">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchSummary} className="ml-auto underline hover:text-rose-600 font-bold">Retry</button>
        </div>
      )}

      {/* Score cards tier */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 luxe-animate">
        {loading ? (
          <><ScoreSkeleton /><ScoreSkeleton /><ScoreSkeleton /></>
        ) : !summary?.hasData ? (
          
          /* Blank state details */
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center border border-dashed border-black/10 rounded-2xl bg-white shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center mb-4">
              <FiActivity className="w-6 h-6 text-[#555555]" />
            </div>
            <h3 className="text-base font-bold text-[#111111] mb-2">No readiness data yet</h3>
            <p className="text-[#555555] text-xs max-w-xs leading-relaxed">
              Generate career metrics by running your first simulated interview session.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-5 flex items-center gap-1.5 px-5 py-3 bg-[#111111] text-[#FBFBF9] rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
            >
              <FiZap className="w-3.5 h-3.5" /> Start First Assessment
            </button>
          </div>
        ) : (
          <>
            {/* IRS Card (White Studio Card) */}
            <div
              onMouseEnter={(e) => handleMouseEnter(e, "irs-arrow", "white")}
              onMouseLeave={(e) => handleMouseLeave(e, "irs-arrow", "white")}
              className="flex flex-col justify-between p-8 rounded-2xl bg-white border border-black/5 h-[320px] shadow-[0_4px_30px_rgba(17,17,17,0.02)] cursor-pointer transition-all overflow-hidden"
            >
              <div className="flex justify-between items-start w-full">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Interview Readiness</h3>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getClassificationBadge(summary.scores.irsClassification)}`}>
                    {summary.scores.irsClassification}
                  </span>
                </div>
                <span id="irs-arrow" className="text-[#111111] text-sm">→</span>
              </div>
              <div className="flex items-baseline mt-auto mb-2 text-[#111111]">
                <span id="irs-val" className="text-6xl font-semibold tracking-tight leading-none">0</span>
                <span className="text-xl font-normal ml-0.5">%</span>
              </div>
              <div className="flex justify-between items-center border-t border-black/5 pt-4 text-[10px] text-[#555555] font-semibold uppercase tracking-wider">
                <span>Technical & Behavioral</span>
                <span>Role skill match</span>
              </div>
            </div>

            {/* CCI Card (White Studio Card) */}
            <div
              onMouseEnter={(e) => handleMouseEnter(e, "cci-arrow", "white")}
              onMouseLeave={(e) => handleMouseLeave(e, "cci-arrow", "white")}
              className="flex flex-col justify-between p-8 rounded-2xl bg-white border border-black/5 h-[320px] shadow-[0_4px_30px_rgba(17,17,17,0.02)] cursor-pointer transition-all overflow-hidden"
            >
              <div className="flex justify-between items-start w-full">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-bold text-[#555555] uppercase tracking-widest">Communication Clarity</h3>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getClassificationBadge(summary.scores.cciClassification)}`}>
                    {summary.scores.cciClassification}
                  </span>
                </div>
                <span id="cci-arrow" className="text-[#111111] text-sm">→</span>
              </div>
              <div className="flex items-baseline mt-auto mb-2 text-[#111111]">
                <span id="cci-val" className="text-6xl font-semibold tracking-tight leading-none">0</span>
                <span className="text-xl font-normal ml-0.5">%</span>
              </div>
              <div className="flex justify-between items-center border-t border-black/5 pt-4 text-[10px] text-[#555555] font-semibold uppercase tracking-wider">
                <span>STAR Compliance</span>
                <span>Vocabulary density</span>
              </div>
            </div>

            {/* CRS Card (Ink Black Premium Card) */}
            <div
              onMouseEnter={(e) => handleMouseEnter(e, "crs-arrow", "black")}
              onMouseLeave={(e) => handleMouseLeave(e, "crs-arrow", "black")}
              className="flex flex-col justify-between p-8 rounded-2xl bg-[#111111] text-[#FBFBF9] border border-black/5 h-[320px] shadow-[0_4px_30px_rgba(17,17,17,0.02)] cursor-pointer transition-all overflow-hidden"
            >
              <div className="flex justify-between items-start w-full">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-bold text-[#999999] uppercase tracking-widest">Career Readiness</h3>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getClassificationBadge(summary.scores.crsClassification)}`}>
                    {summary.scores.crsClassification}
                  </span>
                </div>
                <span id="crs-arrow" className="text-[#FBFBF9] text-sm">→</span>
              </div>
              <div className="flex items-baseline mt-auto mb-2">
                <span id="crs-val" className="text-6xl font-semibold tracking-tight leading-none">0</span>
                <span className="text-xl font-normal ml-0.5">%</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-4 text-[10px] text-[#999999] font-semibold uppercase tracking-wider">
                <span>Unified mastery</span>
                <span>Consistency ranking</span>
              </div>
            </div>
          </>
        )}
      </div>

      {summary?.hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 luxe-animate">
          
          {/* Flagged Topics / Adaptive review loop list */}
          <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 shadow-[0_4px_30px_rgba(17,17,17,0.02)] flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-[#111111] tracking-tight">Adaptive Optimization Flags</h2>
              </div>
              {summary.adaptiveFeedbackTriggered && (
                <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md uppercase tracking-wider">
                  Loop Active
                </span>
              )}
            </div>

            {!summary.flaggedTopics?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <FiCheckCircle className="w-8 h-8 text-emerald-400" />
                <span className="text-xs font-semibold">All competency vectors normalized. No flags.</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {summary.flaggedTopics.map((topic, i) => (
                  <div key={i} className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FBFBF9] border border-black/5 transition-all hover:border-black/20">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 mt-0.5 uppercase tracking-wider ${getPriorityBadge(topic.priority)}`}>
                      {topic.priority}
                    </span>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#111111]">{topic.topicName}</p>
                      <p className="text-xs text-[#555555] leading-relaxed">{topic.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 shadow-[0_4px_30px_rgba(17,17,17,0.02)] flex flex-col gap-6">
            <div className="flex items-center gap-2 border-b border-black/5 pb-4">
              <FiTrendingUp className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-bold text-[#111111] tracking-tight">Strategic Learning Actions</h2>
            </div>

            <div className="space-y-3">
              <Link
                to="/growth-trend"
                className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FBFBF9] border border-black/5 hover:border-[#111111] transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <FiActivity className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-[#111111]">Verify Readiness Trends</p>
                  <p className="text-[11px] text-[#555555]">Chronological progression charts analysis</p>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#111111] transition-all" />
              </Link>

              <Link
                to="/interviews"
                className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FBFBF9] border border-black/5 hover:border-[#111111] transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <FiMic className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-[#111111]">Mock Practice Session</p>
                  <p className="text-[11px] text-[#555555]">Trigger custom timed interview loops</p>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#111111] transition-all" />
              </Link>

              <Link
                to="/assignments"
                className="flex items-center gap-3.5 p-4 rounded-xl bg-[#FBFBF9] border border-black/5 hover:border-[#111111] transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <FiBookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs font-bold text-[#111111]">Study Plan Assignments</p>
                  <p className="text-[11px] text-[#555555]">Reinforce flagged focus topics</p>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#111111] transition-all" />
              </Link>
            </div>

            {/* Last updated summary log */}
            {summary.scores?.lastUpdated && (
              <p className="text-[10px] text-slate-400 text-center font-mono mt-auto pt-2">
                METRICS COMPILED AT: {new Date(summary.scores.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>

        </div>
      )}

      {showModal && (
        <ComputeModal onClose={() => setShowModal(false)} onSuccess={fetchSummary} />
      )}

    </div>
  );
};

// Map styling functions for classification labels
const getClassificationBadge = (classification) => {
  const map = {
    "Highly Ready": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Career Ready": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Excellent": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Moderately Ready": "bg-violet-500/10 text-violet-500 border-violet-500/20",
    "On Track": "bg-violet-500/10 text-violet-500 border-violet-500/20",
    "Good": "bg-violet-500/10 text-violet-500 border-violet-500/20",
    "Developing": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "Progressing": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "Fair": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "Needs Significant Improvement": "bg-rose-500/10 text-rose-500 border-rose-500/20",
    "Early Stage": "bg-rose-500/10 text-rose-500 border-rose-500/20",
    "Needs Improvement": "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };
  return map[classification] || "bg-slate-500/10 text-slate-500 border-slate-500/20";
};

export default CareerDashboard;
