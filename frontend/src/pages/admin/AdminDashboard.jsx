import React, { useEffect, useState } from "react";
import {
  FiUsers, FiAlertTriangle, FiActivity, FiTrendingUp,
  FiRefreshCw, FiAlertCircle, FiCheckCircle, FiBarChart2,
} from "react-icons/fi";
import { getAggregateReport } from "../../services/admin.service";

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon: Icon, color = "violet" }) => {
  const colorMap = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-400/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-400/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-400/20" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-400/20" },
    indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-400/20" },
  };
  const c = colorMap[color] || colorMap.violet;

  return (
    <div className={`bg-slate-900 border ${c.border} rounded-2xl p-5 transition-all hover:scale-[1.01]`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
      </div>
      <p className="text-3xl font-black text-white mb-1">{value ?? "—"}</p>
      <p className="text-sm font-medium text-slate-300">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
};

const DistributionBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{count} ({pct}%)</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const SectionSkeleton = ({ rows = 2 }) => (
  <div className="animate-pulse space-y-3">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="h-12 bg-slate-800 rounded-xl" />
    ))}
  </div>
);

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAggregateReport();
      setReport(result.data?.report);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const totalIrsAttempts = report
    ? Object.values(report.irsDistribution).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-400/30">
              Admin
            </span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Platform-wide analytics and user intelligence overview.</p>
        </div>
        <button onClick={fetchReport}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
          <FiRefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchReport} className="ml-auto underline hover:text-rose-300">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse h-32" />
            ))}
          </div>
          <SectionSkeleton rows={4} />
        </div>
      ) : report && (
        <>
          {/* User Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Users"
              value={report.userStats.totalUsers}
              sub={`${report.userStats.newUsersLast7Days} new this week`}
              icon={FiUsers}
              color="violet"
            />
            <StatCard
              label="Active Users"
              value={report.userStats.activeUsers}
              sub={`${report.userStats.inactiveUsers} inactive`}
              icon={FiCheckCircle}
              color="emerald"
            />
            <StatCard
              label="High-Risk Users"
              value={report.userStats.highRiskUserCount}
              sub="Need immediate attention"
              icon={FiAlertTriangle}
              color="rose"
            />
            <StatCard
              label="Score Attempts"
              value={report.cohortScores.totalScoreAttempts}
              sub="Total assessments completed"
              icon={FiActivity}
              color="indigo"
            />
          </div>

          {/* Cohort Averages + IRS Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Cohort Averages */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiTrendingUp className="w-5 h-5 text-violet-400" />
                <h2 className="text-sm font-semibold text-white">Cohort Average Scores</h2>
              </div>
              <div className="space-y-5">
                {[
                  { label: "Avg. IRS (Interview Readiness)", value: report.cohortScores.cohortAverageIRS, color: "bg-violet-500" },
                  { label: "Avg. CCI (Communication Clarity)", value: report.cohortScores.cohortAverageCCI, color: "bg-indigo-500" },
                  { label: "Avg. CRS (Career Readiness)", value: report.cohortScores.cohortAverageCRS, color: "bg-emerald-500" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">{label}</span>
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%`, transition: "width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IRS Distribution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiBarChart2 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">IRS Classification Distribution</h2>
              </div>
              <DistributionBar label="Highly Ready"     count={report.irsDistribution["Highly Ready"]}    total={totalIrsAttempts} color="bg-emerald-500" />
              <DistributionBar label="Moderately Ready" count={report.irsDistribution["Moderately Ready"]} total={totalIrsAttempts} color="bg-violet-500" />
              <DistributionBar label="Developing"       count={report.irsDistribution["Developing"]}       total={totalIrsAttempts} color="bg-amber-500" />
              <DistributionBar label="Needs Improvement" count={report.irsDistribution["Needs Significant Improvement"]} total={totalIrsAttempts} color="bg-rose-500" />
            </div>
          </div>

          {/* Platform Engagement */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <FiActivity className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Platform Engagement — Assignments</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Assignments", value: report.platformEngagement.totalAssignments },
                { label: "Completed", value: report.platformEngagement.completedAssignments },
                { label: "Avg. Score", value: `${report.platformEngagement.avgAssignmentScore}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
