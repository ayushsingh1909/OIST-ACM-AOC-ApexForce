import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiChevronDown, FiChevronUp, FiAward, FiBookOpen, FiActivity, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import interviewService from "../../services/interview.service";

const InterviewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAccordions, setOpenAccordions] = useState({});

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await interviewService.getSession(id);
        if (response.success) {
          const sessData = response.data;
          if (sessData.status !== "Completed") {
            toast.error("This interview session has not been finalized yet.");
            navigate(`/interview/session/${id}`);
            return;
          }
          setSession(sessData);
          // Auto-open the first question accordion
          setOpenAccordions({ 0: true });
        }
      } catch (err) {
        toast.error("Failed to load interview evaluation details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  const toggleAccordion = (index) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500">Loading interview scorecard report...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <FiAlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Report Not Found</h2>
        <p className="text-slate-500 mb-4">The requested scorecard report could not be found.</p>
        <button onClick={() => navigate("/interview")} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-[#4F46E5]/25 font-semibold">
          Return to Onboarding
        </button>
      </div>
    );
  }

  // Score categories averages
  const avgMetrics = session.questions.reduce(
    (acc, q) => {
      if (q.evaluation) {
        acc.keywords += q.evaluation.keywordRelevance || 0;
        acc.depth += q.evaluation.technicalDepth || 0;
        acc.structure += q.evaluation.logicalStructure || 0;
        acc.terminology += q.evaluation.domainTerminology || 0;
        acc.completeness += q.evaluation.completeness || 0;
      }
      return acc;
    },
    { keywords: 0, depth: 0, structure: 0, terminology: 0, completeness: 0 }
  );

  const numQ = session.questions.length || 1;
  const metricsList = [
    { label: "Keyword Density", score: Math.round(avgMetrics.keywords / numQ), desc: "Accuracy matching core ideal answer keywords." },
    { label: "Technical Depth", score: Math.round(avgMetrics.depth / numQ), desc: "Elaboration on execution, constraints, and metrics." },
    { label: "Domain Terminology", score: Math.round(avgMetrics.terminology / numQ), desc: "Use of framework-specific vocabulary and concepts." },
    { label: "Logical Structure", score: Math.round(avgMetrics.structure / numQ), desc: "Chronological flow, paragraphs, and list notation." },
    { label: "Completeness", score: Math.round(avgMetrics.completeness / numQ), desc: "Overall answer word count and prompt requirements coverage." }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Return Button */}
      <button
        onClick={() => navigate("/interview/history")}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition-colors cursor-pointer"
      >
        <FiArrowLeft className="w-4 h-4" /> Back to History
      </button>

      {/* Main Score Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Composite Score Circle Gauge */}
        <div className="p-6 bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center shadow-xl md:col-span-1">
          <FiAward className="w-8 h-8 text-violet-400 mb-4 animate-bounce" />
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Composite Score
          </h2>
          
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90">
              {/* Outer track */}
              <circle
                cx="72"
                cy="72"
                r="64"
                strokeWidth="10"
                stroke="#1e293b"
                fill="transparent"
              />
              {/* Progress track */}
              <circle
                cx="72"
                cy="72"
                r="64"
                strokeWidth="10"
                stroke="url(#gradientScore)"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - session.overallScore / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-extrabold text-slate-900">{session.overallScore}</span>
              <span className="text-slate-500 text-xs block">/ 100</span>
            </div>
          </div>

          <div className="px-2 py-1 rounded text-xs font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
            {session.role}
          </div>
        </div>

        {/* Overall Feedback Details */}
        <div className="p-6 bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl flex flex-col justify-center shadow-xl md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FiActivity className="text-violet-400" /> Evaluation Summary
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {session.overallFeedback}
          </p>
          
          {/* Missing Gaps Panel */}
          <div>
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">
              Detected Conceptual Gaps
            </h3>
            <div className="flex flex-wrap gap-2">
              {session.missingConceptsBreakdown && session.missingConceptsBreakdown.length > 0 ? (
                session.missingConceptsBreakdown.map((concept) => (
                  <span
                    key={concept}
                    className="px-2.5 py-1 text-[11px] font-semibold border border-rose-500/20 bg-rose-500/10 text-rose-350 rounded-lg"
                  >
                    {concept}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                  No critical concept gaps detected! Excellent keyword coverage.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5-Axes Sub-Scores Breakdown */}
      <div className="p-6 bg-slate-50 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl space-y-5">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FiBookOpen className="text-violet-400" /> Assessment Parameter Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
          {metricsList.map((metric) => (
            <div key={metric.label} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-700">{metric.label}</span>
                  <span className="text-[10px] text-slate-500 block">{metric.desc}</span>
                </div>
                <span className="font-mono font-bold text-violet-400">{metric.score} / 100</span>
              </div>
              <div className="w-full h-2 bg-slate-50 border border-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                  style={{ width: `${metric.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion Questions Detailed Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Detailed Responses Breakdown
        </h2>

        {session.questions.map((q, idx) => (
          <div
            key={q._id}
            className="bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Header / Trigger */}
            <button
              onClick={() => toggleAccordion(idx)}
              className="w-full flex items-center justify-between p-5 text-left border-b border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded font-bold bg-slate-50 border border-slate-200 text-slate-500">
                    Question {idx + 1}
                  </span>
                  <span className="font-semibold text-violet-400">
                    {q.vertical}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm md:text-base leading-tight pr-4">
                  {q.questionText}
                </h3>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Score</div>
                  <div className="text-sm font-bold text-violet-400 font-mono">{q.score} / 100</div>
                </div>
                {openAccordions[idx] ? (
                  <FiChevronUp className="w-5 h-5 text-slate-450" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-slate-450" />
                )}
              </div>
            </button>

            {/* Content Body */}
            {openAccordions[idx] && (
              <div className="p-6 space-y-6 text-sm bg-slate-50/20">
                {/* 5-axes breakdown for this question */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-b border-slate-200 pb-5">
                  {q.evaluation && Object.entries(q.evaluation).map(([k, val]) => {
                    if (typeof val !== "number") return null;
                    // Format key name nicely
                    const title = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={k} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</div>
                        <div className="text-base font-extrabold text-slate-900 font-mono">{val}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Response Feedback */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Evaluation & Advice</h4>
                  <p className="text-slate-350 leading-relaxed p-4 bg-violet-500/5 border border-violet-500/10 rounded-xl">
                    {q.evaluation?.feedback || "No feedback compiled."}
                  </p>
                </div>

                {/* Candidate Answer */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Your Submitted Answer</h4>
                  <div className="p-4 bg-slate-50/60 border border-slate-200 rounded-xl font-mono text-xs text-slate-600 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {q.answerText || <em className="text-slate-600">No answer was submitted.</em>}
                  </div>
                </div>

                {/* Model Sample Answer */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Model Ideal Reference Answer</h4>
                  <div className="p-4 bg-slate-50/60 border border-slate-200 rounded-xl font-mono text-xs text-slate-350 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {q.sampleAnswer || <em className="text-slate-600">Sample answer details not available.</em>}
                  </div>
                </div>

                {/* Keywords comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <h5 className="text-[11px] font-bold text-emerald-450 uppercase tracking-wider mb-2">Matched Key Concepts</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {q.idealKeywords.filter(k => !q.evaluation?.missingConcepts?.includes(k)).map(kw => (
                        <span key={kw} className="px-2 py-1 text-[10px] font-semibold rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          {kw}
                        </span>
                      ))}
                      {q.idealKeywords.filter(k => !q.evaluation?.missingConcepts?.includes(k)).length === 0 && (
                        <span className="text-xs text-slate-500 italic">None of the ideal keywords were matched.</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-rose-455 uppercase tracking-wider mb-2">Missing Key Concepts</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {q.evaluation?.missingConcepts && q.evaluation.missingConcepts.map(kw => (
                        <span key={kw} className="px-2 py-1 text-[10px] font-semibold rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
                          {kw}
                        </span>
                      ))}
                      {(!q.evaluation?.missingConcepts || q.evaluation.missingConcepts.length === 0) && (
                        <span className="text-xs text-slate-500 italic">None. Excellent concept matching!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewReport;
