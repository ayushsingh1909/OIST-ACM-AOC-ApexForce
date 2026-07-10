import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity, FiChevronRight, FiRefreshCw, FiZap,
  FiBookOpen, FiMic, FiAlertCircle, FiCheckCircle
} from "react-icons/fi";
import { getCareerSummary, computeCareerScores } from "../../services/careerIntelligence.service";
import toast from "react-hot-toast";
import gsap from "gsap";

// Import reusable cards
import HeroScoreCard from "../../components/cards/HeroScoreCard";
import MetricCard from "../../components/cards/MetricCard";
import StatusRiskCard from "../../components/cards/StatusRiskCard";
import InteractiveListCard from "../../components/cards/InteractiveListCard";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const getStatusFromClassification = (classification) => {
  const readyLabels = ["Highly Ready", "Career Ready", "Excellent"];
  const riskLabels = ["Needs Significant Improvement", "Early Stage", "Needs Improvement"];

  if (readyLabels.includes(classification)) return "ready";
  if (riskLabels.includes(classification)) return "risk";
  return "developing";
};

// ─────────────────────────────────────────────
// Assessment Simulator Modal
// ─────────────────────────────────────────────
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
    { name: "redundancyLevel", label: "Redundancy Level" },
    { name: "starMethodCompliance", label: "STAR Method Compliance" },
  ];

  return (
    <div className="fixed inset-0 bg-[#111111]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#111111]/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 shadow-2xl font-mono">
        <h2 className="text-base font-bold text-[#111111] uppercase tracking-tight mb-1">Simulate Placement Session</h2>
        <p className="text-[#555555] text-[10px] uppercase tracking-wider mb-6">Enter performance values to trigger the diagnostics checkup.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.name}>
              <label htmlFor={f.name} className="flex justify-between text-[10px] font-bold text-[#555555] uppercase tracking-wider mb-1">
                <span>{f.label}</span>
                <span className="text-[#111111]">{form[f.name]}</span>
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
            <label htmlFor="weak-topics-input" className="block text-[10px] font-bold text-[#555555] uppercase tracking-wider mb-1">Weak Topics (comma-separated)</label>
            <input
              id="weak-topics-input"
              type="text" name="weakInterviewTopics" value={form.weakInterviewTopics}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#111111]/10 rounded-xl text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>
          <div className="flex gap-3 pt-4 font-sans">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 text-xs border border-black text-[#000000] hover:bg-black/5 font-bold transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-3 text-xs bg-[#000000] text-white font-bold transition-all disabled:opacity-50">
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
const Readiness = () => {
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

  // Stagger reveal on mount (after data is fetched)
  useEffect(() => {
    if (loading || !summary?.hasData) return;

    gsap.from(".luxe-reveal", {
      opacity: 0,
      y: 35,
      duration: 1.2,
      stagger: 0.12,
      ease: "power4.out"
    });
  }, [loading, summary]);

  // Formatted Action list mapping for the table component
  const getActionRows = () => {
    const actions = [
      {
        id: 1,
        cells: [
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#111111]/5 flex items-center justify-center text-[#111111]">
              <FiActivity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#111111]">Readiness Growth Trend</p>
              <p className="text-[10px] text-[#555555]">Historical evaluation timelines</p>
            </div>
          </div>,
          <Link to="/growth-trend" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#000000] uppercase tracking-widest font-sans underline decoration-1 underline-offset-2">
            Open Chart <FiChevronRight className="w-3 h-3" />
          </Link>
        ]
      },
      {
        id: 2,
        cells: [
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#111111]/5 flex items-center justify-center text-[#111111]">
              <FiMic className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#111111]">Mock Practice Simulator</p>
              <p className="text-[10px] text-[#555555]">Practice targeted speech runs</p>
            </div>
          </div>,
          <Link to="/interviews" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#000000] uppercase tracking-widest font-sans underline decoration-1 underline-offset-2">
            Launch Portal <FiChevronRight className="w-3 h-3" />
          </Link>
        ]
      },
      {
        id: 3,
        cells: [
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#111111]/5 flex items-center justify-center text-[#111111]">
              <FiBookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#111111]">Study Assignments Grid</p>
              <p className="text-[10px] text-[#555555]">Clear weakness backlog list</p>
            </div>
          </div>,
          <Link to="/assignments" className="inline-flex items-center gap-1 text-[10px] font-bold text-[#000000] uppercase tracking-widest font-sans underline decoration-1 underline-offset-2">
            View Tasks <FiChevronRight className="w-3 h-3" />
          </Link>
        ]
      }
    ];
    return actions;
  };

  return (
    <>
      {/* Signature Border Frame & Page Header */}
      <div className="border-b border-[#111111]/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 luxe-reveal">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#000000] uppercase tracking-widest font-sans">Diagnostic Report</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-[#000000] leading-tight">
            Career Readiness Summary
          </h1>
          <p className="text-[#000000] text-xs md:text-sm mt-4 max-w-lg">
            Evaluating capability markers, communication sequence checks, and alignment maps.
          </p>
        </div>
        
        {/* Actions bar */}
        <div className="flex items-center gap-3 mt-6 sm:mt-0">
          <button
            onClick={fetchSummary}
            className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold bg-[#FFFFFF] border border-[#000000] text-[#000000] hover:bg-[#000000]/5 transition-all font-sans tracking-wide"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-5 py-3 text-xs font-bold bg-[#000000] border border-[#000000] text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#000000] transition-all font-sans tracking-wide"
          >
            <FiZap className="w-3.5 h-3.5" /> Run Simulator
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[#B30006] text-xs luxe-reveal">
          <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchSummary} className="ml-auto underline hover:text-[#B30006]/80 font-bold">Retry</button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 luxe-reveal">
        {loading ? (
          <><ScoreSkeleton /><ScoreSkeleton /><ScoreSkeleton /></>
        ) : !summary?.hasData ? (
          
          /* Diagnostic Blank State */
          <div className="col-span-3 flex flex-col items-center justify-center py-24 text-center border border-black/10 bg-[#FFFFFF]">
            <div className="w-12 h-12 bg-black/5 flex items-center justify-center mb-4">
              <FiActivity className="w-6 h-6 text-[#000000]" />
            </div>
            <h3 className="text-sm font-bold text-[#000000] uppercase tracking-widest font-sans mb-2">Diagnostic Data Missing</h3>
            <p className="text-[#000000] text-xs max-w-xs leading-relaxed">
              Activate the assessment engine by initiating your first placements simulation.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-6 flex items-center gap-1.5 px-5 py-3 bg-[#000000] text-[#FFFFFF] font-bold font-sans tracking-wide hover:bg-[#FFFFFF] hover:text-[#000000] border border-[#000000] transition-all"
            >
              <FiZap className="w-3.5 h-3.5" /> Start Simulation
            </button>
          </div>
        ) : (
          <>
            {/* CRS (Hero Score Card) */}
            <HeroScoreCard
              title="Career Readiness Score"
              score={summary.scores.CRS}
              classification={summary.scores.crsClassification}
              status={getStatusFromClassification(summary.scores.crsClassification)}
              subtitle="Unified standing"
              rankText="Placement Index"
            />

            {/* IRS Card (Supporting MetricCard) */}
            <MetricCard
              title="Interview Readiness"
              score={summary.scores.IRS}
              classification={summary.scores.irsClassification}
              description="Evaluates resume relevance matching, technical checks, and behavioral clarity."
              footerLeft="Practical Performance"
              footerRight="SLA Pass"
            />

            {/* CCI Card (Supporting MetricCard) */}
            <MetricCard
              title="Communication Clarity"
              score={summary.scores.CCI}
              classification={summary.scores.cciClassification}
              description="Tracks syntax flow sequencing, concept articulation, and STAR completeness."
              footerLeft="Logical Flow"
              footerRight="Articulation Index"
            />
          </>
        )}
      </div>

      {/* Details Section */}
      {summary?.hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 luxe-reveal">
          
          {/* Priority Alerts */}
          <div className="bg-white border border-[#111111]/7 rounded-2xl p-6 md:p-8 shadow-[0_4px_30px_rgba(17,17,17,0.015)] flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#111111]/5 pb-4">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 text-[#855800]" />
                <h2 className="text-xs font-bold text-[#111111] uppercase tracking-wider font-mono">Optimization Backlog</h2>
              </div>
              {summary.adaptiveFeedbackTriggered && (
                <span className="text-[9px] font-bold px-2 py-0.5 bg-[#FFF9E6] text-[#855800] border border-[#855800]/20 rounded uppercase tracking-wider font-mono">
                  Feedback Active
                </span>
              )}
            </div>

            {!summary.flaggedTopics?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <FiCheckCircle className="w-8 h-8 text-[#0F5132]" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#0F5132]">All vectors optimized</span>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
                {summary.flaggedTopics.map((topic, i) => (
                  <StatusRiskCard
                    key={i}
                    title={topic.topicName}
                    description={topic.reason}
                    priority={topic.priority}
                    badgeText={topic.priority + " Priority"}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Tasks (utilizing InteractiveListCard) */}
          <InteractiveListCard
            title="Strategic Actions"
            subtitle="Recommended training vectors scheduled by the diagnostics engine."
            headers={["Diagnostic Metric Interface", "Shortcut Actions"]}
            rows={getActionRows()}
          />

        </div>
      )}

      {showModal && (
        <ComputeModal onClose={() => setShowModal(false)} onSuccess={fetchSummary} />
      )}

    </>
  );
};

// Map loading skeleton styling
const ScoreSkeleton = () => (
  <div className="flex flex-col justify-between p-8 rounded-2xl bg-white border border-[#111111]/5 h-[340px] animate-pulse">
    <div className="flex justify-between items-start w-full">
      <div className="h-5 w-32 bg-slate-100 rounded" />
      <div className="h-6 w-6 bg-slate-100 rounded-full" />
    </div>
    <div className="h-16 w-36 bg-slate-100 rounded my-auto" />
    <div className="flex justify-between items-center border-t border-[#111111]/5 pt-4 w-full">
      <div className="h-3 w-20 bg-slate-100 rounded" />
      <div className="h-3 w-16 bg-slate-100 rounded" />
    </div>
  </div>
);

export default Readiness;
