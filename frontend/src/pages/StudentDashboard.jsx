import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../services/dashboard.service";
import MasteryHeatmap from "../components/dashboard/MasteryHeatmap";
import {
  FiAlertTriangle,
  FiBookOpen,
  FiTarget,
  FiTrendingUp,
  FiFileText,
  FiCheckCircle,
  FiCalendar,
} from "react-icons/fi";

const riskColors = {
  high: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  moderate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardService.getDashboard();
        setData(res.data);
      } catch {
        /* dashboard may be empty for new users */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">Unable to load dashboard. Please try again.</p>
      </div>
    );
  }

  const { user, overview, masteryHeatmap, upcomingTasks, highRiskItems, recommendedActions, studyRoadmap, adaptiveFeedback } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-1">
          Welcome back, {user.name?.split(" ")[0]}
        </h1>
        <p className="text-slate-400">
          Target role: <span className="text-violet-400">{user.targetRole}</span>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <FiTrendingUp className="w-6 h-6 text-violet-400 mb-2" />
          <p className="text-2xl font-bold text-white">{overview.overallMasteryScore}%</p>
          <p className="text-xs text-slate-500">Overall Mastery</p>
        </div>
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <FiFileText className="w-6 h-6 text-indigo-400 mb-2" />
          <p className="text-2xl font-bold text-white">{overview.resumeScore}</p>
          <p className="text-xs text-slate-500">Resume Score</p>
        </div>
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <FiTarget className="w-6 h-6 text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">{overview.quizAvgAccuracy}%</p>
          <p className="text-xs text-slate-500">Quiz Accuracy</p>
        </div>
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className={`inline-block px-2 py-1 text-xs font-semibold border rounded-full mb-2 ${riskColors[overview.riskLevel]}`}>
            {overview.riskLevel} risk
          </span>
          <p className="text-2xl font-bold text-white">{overview.totalQuizAttempts}</p>
          <p className="text-xs text-slate-500">Quizzes Taken</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiBookOpen className="w-5 h-5 text-violet-400" /> Mastery Heatmap
          </h2>
          <MasteryHeatmap data={masteryHeatmap} />
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5 text-rose-400" /> High-Risk Items
          </h2>
          {highRiskItems.length === 0 ? (
            <p className="text-sm text-slate-500">No high-risk items — great progress!</p>
          ) : (
            <div className="space-y-3">
              {highRiskItems.map((item, i) => (
                <div key={i} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-4">Recommended Actions</h2>
          <div className="space-y-2">
            {recommendedActions.map((action, i) => (
              <Link
                key={i}
                to={action.route}
                className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-violet-500/30 transition-all"
              >
                <span className="text-sm text-slate-200">{action.label}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  action.priority === "high" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
                }`}>
                  {action.priority}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 text-emerald-400" /> Upcoming Tasks
          </h2>
          <div className="space-y-2">
            {upcomingTasks.assignments?.slice(0, 3).map((a) => (
              <div key={a.id} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <p className="text-sm font-medium text-white">{a.title}</p>
                <p className="text-xs text-slate-500">{a.topic} · Due {new Date(a.dueDate).toLocaleDateString()}</p>
              </div>
            ))}
            {upcomingTasks.revisions?.slice(0, 2).map((r, i) => (
              <div key={i} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <p className="text-sm font-medium text-white">Review: {r.topic}</p>
                <p className="text-xs text-slate-500">{new Date(r.nextReviewAt).toLocaleDateString()}</p>
              </div>
            ))}
            {upcomingTasks.assignments?.length === 0 && upcomingTasks.revisions?.length === 0 && (
              <p className="text-sm text-slate-500">No upcoming tasks</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiCalendar className="w-5 h-5 text-indigo-400" /> 7-Day Study Roadmap
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {studyRoadmap.map((day) => (
            <div key={day.date} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
              <p className="text-sm font-semibold text-white mb-2">{day.day}</p>
              {day.tasks.length === 0 ? (
                <p className="text-xs text-slate-600">Rest day</p>
              ) : (
                <div className="space-y-1">
                  {day.tasks.map((task, i) => (
                    <div key={i} className="text-xs text-slate-400">
                      <span className="text-violet-400 capitalize">{task.type}</span>: {task.label}
                      <span className="text-slate-600"> ({task.duration})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-xl text-sm text-slate-300">
        <span className="text-violet-400 font-semibold">Adaptive Engine: </span>
        Suggested difficulty: <span className="text-white">{adaptiveFeedback.suggestedDifficulty}</span>
        {adaptiveFeedback.focusTopics?.length > 0 && (
          <> · Focus: <span className="text-white">{adaptiveFeedback.focusTopics.join(", ")}</span></>
        )}
        {adaptiveFeedback.spacedRepetitionDue > 0 && (
          <> · <span className="text-amber-400">{adaptiveFeedback.spacedRepetitionDue} revision(s) overdue</span></>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
