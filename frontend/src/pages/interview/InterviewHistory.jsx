import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiClock, FiCalendar, FiArrowLeft, FiAlertCircle, FiChevronRight } from "react-icons/fi";
import interviewService from "../../services/interview.service";

const InterviewHistory = () => {
  const navigate = useNavigate();

  // State
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await interviewService.getHistory();
        if (response.success) {
          setHistory(response.data);
        }
      } catch (err) {
        toast.error("Failed to load interview history records.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Loading interview records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/interview")}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
      >
        <FiArrowLeft className="w-4 h-4" /> Simulator Setup
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-850 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Interview History
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review and track your conceptual progression and scorecard updates over time.
          </p>
        </div>
        <button
          onClick={() => navigate("/interview")}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold shadow-lg shadow-violet-600/15 transition-all"
        >
          Start New Simulation
        </button>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {history.length > 0 ? (
          history.map((record) => {
            // Determine score tier styling
            const score = record.overallScore || 0;
            const scoreColor =
              score >= 80 ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
              score >= 60 ? "border-amber-500/20 bg-amber-500/10 text-amber-400" :
              "border-rose-500/20 bg-rose-500/10 text-rose-400";

            return (
              <div
                key={record._id}
                onClick={() => navigate(`/interview/session/${record._id}/report`)}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl gap-4 transition-all duration-350 cursor-pointer shadow-lg group"
              >
                {/* Details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-violet-400 transition-colors">
                      {record.role}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 border border-slate-800 text-slate-450 uppercase">
                      {record.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(record.endedAt || record.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5 text-slate-500" />
                      {record.timeLimitPerQuestion > 0
                        ? `${record.timeLimitPerQuestion}s limit`
                        : "Unlimited time"}
                    </span>
                  </div>
                </div>

                {/* Score & Navigation */}
                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t border-slate-850 pt-3 sm:pt-0 sm:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Overall Score</span>
                    <span className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${scoreColor}`}>
                      {score} / 100
                    </span>
                  </div>
                  <FiChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all hidden sm:block" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-slate-900/30 border border-slate-850 rounded-2xl space-y-4">
            <FiAlertCircle className="w-12 h-12 text-slate-650 mx-auto" />
            <div>
              <h3 className="font-bold text-white text-base">No Mock Sessions Found</h3>
              <p className="text-slate-500 text-xs mt-1">
                You have not completed any adaptive mock interviews yet.
              </p>
            </div>
            <button
              onClick={() => navigate("/interview")}
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all"
            >
              Start First Simulation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory;
