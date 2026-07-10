import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  FiTrendingUp, FiTrendingDown, FiAlertCircle,
  FiRefreshCw, FiArrowUp, FiArrowDown, FiMinus,
} from "react-icons/fi";
import { getGrowthTrend } from "../../services/careerIntelligence.service";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────
// Custom Tooltip for Recharts
// ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// Stat cards above chart
// ─────────────────────────────────────────────
const StatCard = ({ label, value, change, suffix = "" }) => {
  const isUp   = change > 0;
  const isDown = change < 0;
  const color  = isUp ? "text-emerald-400" : isDown ? "text-rose-400" : "text-slate-400";
  const Icon   = isUp ? FiArrowUp : isDown ? FiArrowDown : FiMinus;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-black text-white">
        {value}{suffix}
      </p>
      {change !== null && (
        <p className={`flex items-center gap-1 text-xs mt-1 ${color}`}>
          <Icon className="w-3 h-3" />
          {Math.abs(change)}% from start
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Limit selector
// ─────────────────────────────────────────────
const LIMIT_OPTIONS = [10, 20, 50];

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const GrowthTrend = () => {
  const [trend, setTrend] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(20);

  const fetchTrend = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGrowthTrend(limit);
      const raw = result.data?.trend || [];

      // Format timestamps for chart axis labels
      const formatted = raw.map((record, i) => ({
        ...record,
        label: new Date(record.timestamp).toLocaleDateString("en-US", {
          month: "short", day: "numeric",
        }),
        index: i + 1,
      }));

      setTrend(formatted);
      setMeta(result.data?.meta || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load growth trend data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrend(); }, [limit]);

  // Compute summary stats from trend data
  const latestRecord = trend[trend.length - 1];
  const firstRecord  = trend[0];

  const irsChange = (trend.length >= 2 && firstRecord.IRS > 0)
    ? Math.round(((latestRecord.IRS - firstRecord.IRS) / firstRecord.IRS) * 100)
    : null;
  const crsChange = (trend.length >= 2 && firstRecord.CRS > 0)
    ? Math.round(((latestRecord.CRS - firstRecord.CRS) / firstRecord.CRS) * 100)
    : null;
  const cciChange = (trend.length >= 2 && firstRecord.CCI > 0)
    ? Math.round(((latestRecord.CCI - firstRecord.CCI) / firstRecord.CCI) * 100)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Growth Trend
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Track your IRS, CCI, and CRS score evolution over time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-violet-500"
          >
            {LIMIT_OPTIONS.map(o => <option key={o} value={o}>Last {o} sessions</option>)}
          </select>
          <button onClick={fetchTrend}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchTrend} className="ml-auto underline hover:text-rose-300">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
                <div className="h-3 w-20 bg-slate-800 rounded mb-3" />
                <div className="h-7 w-16 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-72 animate-pulse" />
        </div>
      )}

      {!loading && !error && (
        <>
          {/* No data state */}
          {trend.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
                <FiTrendingUp className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No trend data yet</h3>
              <p className="text-slate-400 text-sm max-w-sm">
                Complete your first interview assessment on the Career Dashboard to start tracking your progress.
              </p>
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="Total Sessions"
                  value={meta?.totalRecords || trend.length}
                  change={null}
                />
                <StatCard
                  label="Latest IRS"
                  value={latestRecord?.IRS ?? "—"}
                  change={irsChange}
                />
                <StatCard
                  label="Latest CCI"
                  value={latestRecord?.CCI ?? "—"}
                  change={cciChange}
                />
                <StatCard
                  label="Career Readiness"
                  value={latestRecord?.CRS ?? "—"}
                  change={meta?.improvementPercentage ?? crsChange}
                />
              </div>

              {/* Area Chart — all three scores */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">
                <h2 className="text-sm font-semibold text-white mb-4">Score Progression — IRS / CCI / CRS</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="irsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cciGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="crsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "12px" }} />
                    <Area type="monotone" dataKey="IRS" name="IRS" stroke="#8b5cf6" fill="url(#irsGrad)" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} activeDot={{ r: 5 }} />
                    <Area type="monotone" dataKey="CCI" name="CCI" stroke="#6366f1" fill="url(#cciGrad)" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} activeDot={{ r: 5 }} />
                    <Area type="monotone" dataKey="CRS" name="CRS" stroke="#10b981" fill="url(#crsGrad)" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart — stability view */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white mb-4">Performance Stability — Line View</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "12px" }} />
                    <Line type="monotone" dataKey="IRS" name="IRS" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="CCI" name="CCI" stroke="#6366f1" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="CRS" name="CRS" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GrowthTrend;
