import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { assignmentService } from "../../services/assignment.service";
import { FiArrowLeft, FiCheck, FiX, FiTrendingUp } from "react-icons/fi";

const AssignmentFeedback = () => {
  const { submissionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    if (location.state?.result) {
      setSubmission({
        evaluation: location.state.result.evaluation,
        assignment: location.state.result.assignment,
      });
      return;
    }

    const load = async () => {
      try {
        const res = await assignmentService.getSubmission(submissionId);
        setSubmission(res.data?.submission);
      } catch {
        /* handled below */
      }
    };
    load();
  }, [submissionId, location.state]);

  if (!submission) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { evaluation, assignment } = submission;
  const title = assignment?.title || assignment?.assignment?.title || "Assignment";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/assignments")}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-all"
      >
        <FiArrowLeft /> Back to Assignments
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 mb-4">
          <span className="text-3xl font-extrabold text-violet-400">
            {evaluation.overallScore}%
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-slate-400 text-sm mt-1">Automated evaluation complete</p>
      </div>

      {evaluation.masteryDelta !== undefined && (
        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <FiTrendingUp className={`w-5 h-5 ${evaluation.masteryDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`} />
          <span className="text-sm text-slate-300">
            Topic mastery {evaluation.masteryDelta >= 0 ? "increased" : "decreased"} by{" "}
            <span className={evaluation.masteryDelta >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {Math.abs(evaluation.masteryDelta)} points
            </span>
          </span>
        </div>
      )}

      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Concept Coverage</h2>
        <div className="space-y-3">
          {evaluation.conceptCoverage?.map((cc) => (
            <div key={cc.concept} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl">
              {cc.covered ? (
                <FiCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <FiX className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{cc.concept}</p>
                <p className="text-xs text-slate-500">{cc.coveragePercent}% coverage</p>
              </div>
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${cc.covered ? "bg-emerald-500" : "bg-rose-500"}`}
                  style={{ width: `${cc.coveragePercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {evaluation.feedback?.length > 0 && (
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Feedback</h2>
          <ul className="space-y-2">
            {evaluation.feedback.map((f, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-emerald-400">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.suggestions?.length > 0 && (
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-3">Suggestions for Improvement</h2>
          <ul className="space-y-2">
            {evaluation.suggestions.map((s, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-2">
                <span className="text-violet-400">→</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssignmentFeedback;
