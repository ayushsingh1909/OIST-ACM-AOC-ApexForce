import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity, FiTrendingUp, FiAlertCircle, FiCheckCircle,
  FiTarget, FiMessageSquare, FiRefreshCw, FiChevronRight,
  FiZap, FiBookOpen, FiMic,
} from "react-icons/fi";
import { getCareerSummary, computeCareerScores } from "../../services/careerIntelligence.service";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Returns Tailwind color classes based on score value.
 */
const getScoreColor = (score) => {
  if (score >= 80) return { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", ring: "shadow-emerald-500/20" };
  if (score >= 60) return { text: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/30", ring: "shadow-violet-500/20" };
  if (score >= 40) return { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", ring: "shadow-amber-500/20" };
  return { text: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/30", ring: "shadow-rose-500/20" };
};

/**
 * Returns badge color classes for classification labels.
 */
const getClassificationBadge = (classification) => {
  const map = {
    "Highly Ready":    "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
    "Career Ready":    "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
    "Excellent":       "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
    "Moderately Ready":"bg-violet-400/10 text-violet-400 border-violet-400/30",
    "On Track":        "bg-violet-400/10 text-violet-400 border-violet-400/30",
    "Good":            "bg-violet-400/10 text-violet-400 border-violet-400/30",
    "Developing":      "bg-amber-400/10 text-amber-400 border-amber-400/30",
    "Progressing":     "bg-amber-400/10 text-amber-400 border-amber-400/30",
    "Fair":            "bg-amber-400/10 text-amber-400 border-amber-400/30",
    "Needs Significant Improvement": "bg-rose-400/10 text-rose-400 border-rose-400/30",
    "Early Stage":     "bg-rose-400/10 text-rose-400 border-rose-400/30",
    "Needs Improvement":"bg-rose-400/10 text-rose-400 border-rose-400/30",
  };
  return map[classification] || "bg-slate-400/10 text-slate-400 border-slate-400/30";
};

const getPriorityBadge = (priority) => {
  const map = {
    High:   "bg-rose-400/10 text-rose-400 border-rose-400/30",
    Medium: "bg-amber-400/10 text-amber-400 border-amber-400/30",
    Low:    "bg-slate-400/10 text-slate-400 border-slate-400/30",
  };
  return map[priority] || "bg-slate-400/10 text-slate-400 border-slate-400/30";
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/**
 * Animated circular score meter
 */
const ScoreMeter = ({ score, label, classification, icon: Icon, description }) => {
  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 54; // r=54
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center p-6 rounded-2xl bg-slate-900 border ${colors.border} shadow-xl ${colors.ring} transition-all hover:scale-[1.02]`}>
      <div className="relative w-36 h-36 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background track */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="10" />
          {/* Score arc */}
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke="currentColor"
            className={colors.text}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1.2s ease-in-out" }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${colors.text}`}>{score}</span>
          <span className="text-xs text-slate-500 mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Icon + label */}
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colors.text}`} />
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>

      {/* Classification badge */}
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getClassificationBadge(classification)}`}>
        {classification}
      </span>

      <p className="mt-3 text-xs text-slate-500 text-center leading-relaxed">{description}</p>
    </div>
  );
};

/**
 * Skeleton loader for score cards
 */
const ScoreSkeleton = () => (
  <div className="flex flex-col items-center p-6 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse">
    <div className="w-36 h-36 rounded-full bg-slate-800 mb-4" />
    <div className="h-4 w-24 bg-slate-800 rounded mb-2" />
    <div className="h-5 w-32 bg-slate-800 rounded" />
  </div>
);

/**
 * Demo compute modal — lets user simulate an interview session
 */
const ComputeModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    technicalScore: 70, behavioralScore: 65, roleSkillMatch: 75,
    grammarAccuracy: 80, logicalSequencing: 70, conceptArticulation: 75,
    redundancyLevel: 20, starMethodCompliance: 65,
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-white mb-1">Simulate Interview Session</h2>
        <p className="text-slate-400 text-sm mb-5">Enter session scores to compute your career readiness metrics.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}: <span className="text-violet-400">{form[f.name]}</span></label>
              <input
                type="range" min="0" max="100"
                name={f.name} value={form[f.name]}
                onChange={handleChange}
                className="w-full accent-violet-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Weak Interview Topics (comma-separated)</label>
            <input
              type="text" name="weakInterviewTopics" value={form.weakInterviewTopics}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
              {loading ? "Computing…" : "Compute Scores"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
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

  useEffect(() => { fetchSummary(); }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Career Readiness Dashboard
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Your unified intelligence summary — IRS, CCI, and CRS at a glance.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchSummary}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-violet-600/20">
            <FiZap className="w-4 h-4" /> Run Assessment
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchSummary} className="ml-auto underline hover:text-rose-300">Retry</button>
        </div>
      )}

      {/* Score meters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {loading ? (
          <><ScoreSkeleton /><ScoreSkeleton /><ScoreSkeleton /></>
        ) : !summary?.hasData ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
              <FiActivity className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No data yet</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              Complete your first interview assessment to generate your career readiness scores.
            </p>
            <button onClick={() => setShowModal(true)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors">
              <FiZap className="w-4 h-4" /> Run First Assessment
            </button>
          </div>
        ) : (
          <>
            <ScoreMeter
              score={summary.scores.IRS}
              label="Interview Readiness Score"
              classification={summary.scores.irsClassification}
              icon={FiTarget}
              description="Weighted composite of resume strength, technical & behavioral performance, and role skill match."
            />
            <ScoreMeter
              score={summary.scores.CCI}
              label="Communication Clarity Index"
              classification={summary.scores.cciClassification}
              icon={FiMessageSquare}
              description="Measures grammar, logical flow, concept articulation, redundancy avoidance, and STAR compliance."
            />
            <ScoreMeter
              score={summary.scores.CRS}
              label="Career Readiness Score"
              classification={summary.scores.crsClassification}
              icon={FiTrendingUp}
              description="Master score combining learning mastery, interview readiness, consistency, and role alignment."
            />
          </>
        )}
      </div>

      {summary?.hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Flagged Topics / Recommendations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiAlertCircle className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-white">High-Priority Focus Areas</h2>
              {summary.adaptiveFeedbackTriggered && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Adaptive Feedback Active
                </span>
              )}
            </div>

            {!summary.flaggedTopics?.length ? (
              <div className="flex items-center gap-3 py-8 justify-center text-slate-500">
                <FiCheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">No critical gaps detected. Keep it up!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {summary.flaggedTopics.map((topic, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 ${getPriorityBadge(topic.priority)}`}>
                      {topic.priority}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{topic.topicName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{topic.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiZap className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-semibold text-white">Recommended Actions</h2>
            </div>

            <div className="space-y-3">
              <Link to="/growth-trend"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/30 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <FiTrendingUp className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">View Growth Trend</p>
                  <p className="text-xs text-slate-500">Track your score progression over time</p>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
              </Link>

              <button onClick={() => setShowModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/30 transition-colors group text-left">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <FiMic className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Mock Interview</p>
                  <p className="text-xs text-slate-500">Practice targeted interview scenarios</p>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </button>

              <button
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-colors group text-left">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FiBookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Study Plan</p>
                  <p className="text-xs text-slate-500">Review injected high-priority topics</p>
                </div>
                <FiChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </button>
            </div>

            {/* Last updated */}
            {summary.scores?.lastUpdated && (
              <p className="mt-4 text-xs text-slate-600 text-center">
                Last updated: {new Date(summary.scores.lastUpdated).toLocaleString()}
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

export default CareerDashboard;
