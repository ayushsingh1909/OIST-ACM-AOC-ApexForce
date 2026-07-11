import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { assignmentService } from "../../services/assignment.service";
import { FiClock, FiCheckCircle, FiAlertCircle, FiCode, FiLayers, FiCpu } from "react-icons/fi";
import toast from "react-hot-toast";

const typeIcons = {
  coding: FiCode,
  "mini-project": FiLayers,
  "system-design": FiCpu,
};

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await assignmentService.list();
        setAssignments(res.data?.assignments || []);
      } catch (err) {
        toast.error("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = assignments.filter((a) => {
    if (filter === "pending") return a.status === "pending";
    if (filter === "completed") return a.status === "evaluated";
    return true;
  });

  const pending = assignments.filter((a) => a.status === "pending");
  const completed = assignments.filter((a) => a.status === "evaluated");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Assignments</h1>
        <p className="text-slate-500">Adaptive tasks tailored to your learning gaps</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white border border-slate-100 rounded-3xl shadow-outcrowd flex items-center gap-3">
          <FiAlertCircle className="w-8 h-8 text-amber-400" />
          <div>
            <p className="text-2xl font-bold text-slate-900">{pending.length}</p>
            <p className="text-xs text-slate-500">Pending</p>
          </div>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-3xl shadow-outcrowd flex items-center gap-3">
          <FiCheckCircle className="w-8 h-8 text-emerald-400" />
          <div>
            <p className="text-2xl font-bold text-slate-900">{completed.length}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "pending", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl capitalize transition-all ${
              filter === f
                ? "bg-gradient-to-r from-[#4F46E5] to-[#00D2C4] text-white shadow-lg shadow-[#4F46E5]/25"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(({ assignment, submission, status, dueDate }) => {
          const Icon = typeIcons[assignment.type] || FiCode;
          return (
            <div
              key={assignment._id}
              className="p-5 bg-white border border-slate-100 rounded-3xl shadow-outcrowd hover:border-violet-500/20 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-violet-500/10 rounded-xl">
                  <Icon className="w-6 h-6 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">{assignment.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      status === "evaluated"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {status === "evaluated" ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2 line-clamp-2">{assignment.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>{assignment.topic}</span>
                    <span>{assignment.difficulty}</span>
                    <span>{assignment.estimatedHours}h estimated</span>
                    {dueDate && (
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        Due {new Date(dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {submission?.evaluation && (
                    <p className="mt-2 text-sm text-violet-400">
                      Score: {submission.evaluation.overallScore}%
                    </p>
                  )}
                </div>
                <Link
                  to={status === "evaluated" ? `/assignments/${submission._id}/feedback` : `/assignments/${assignment._id}/submit`}
                  className="px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all shrink-0"
                >
                  {status === "evaluated" ? "View Feedback" : "Submit"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentsPage;
