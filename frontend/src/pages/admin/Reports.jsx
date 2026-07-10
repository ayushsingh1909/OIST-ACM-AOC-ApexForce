import React, { useEffect, useState } from "react";
import {
  FiFileText, FiDownload, FiRefreshCw, FiAlertCircle, FiTrendingUp, FiTarget, FiMessageSquare
} from "react-icons/fi";
import { getAggregateReport } from "../../services/admin.service";
import toast from "react-hot-toast";

const Reports = () => {
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
      setError(err.response?.data?.message || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportCSV = () => {
    if (!report) return;
    
    // Construct CSV content
    const csvRows = [
      ["Metric", "Value"],
      ["Total Users", report.userStats.totalUsers],
      ["Active Users", report.userStats.activeUsers],
      ["Inactive Users", report.userStats.inactiveUsers],
      ["High-Risk Users", report.userStats.highRiskUserCount],
      ["Cohort Average CRS", report.cohortScores.cohortAverageCRS],
      ["Cohort Average IRS", report.cohortScores.cohortAverageIRS],
      ["Cohort Average CCI", report.cohortScores.cohortAverageCCI],
      ["Total Assessment Attempts", report.cohortScores.totalScoreAttempts],
      ["Total Assignments", report.platformEngagement.totalAssignments],
      ["Completed Assignments", report.platformEngagement.completedAssignments],
      ["Average Assignment Score", `${report.platformEngagement.avgAssignmentScore}%`]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ACIE_Cohort_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully!");
  };

  const handleExportPDFPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 max-w-6xl mx-auto print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-400/30">
              Admin
            </span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
            Cohort Analytics & Reports
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Generate and export cohort-level reports for platform performance metrics.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchReport}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={handleExportCSV}
            disabled={!report}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <FiDownload className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={handleExportPDFPrint}
            disabled={!report}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <FiFileText className="w-4 h-4" /> Print PDF
          </button>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block mb-8 border-b border-slate-300 pb-4">
        <h1 className="text-3xl font-bold text-black">ACIE Cohort Analytics Report</h1>
        <p className="text-slate-600">Generated on: {new Date().toLocaleString()}</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm print:hidden">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchReport} className="ml-auto underline hover:text-rose-300">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : report && (
        <div className="space-y-8">
          {/* Cohort Score Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900 border border-slate-800 print:border-slate-300 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 print:text-slate-700 font-semibold uppercase">Average CRS</span>
                <FiTrendingUp className="text-emerald-400 w-5 h-5" />
              </div>
              <p className="text-4xl font-black text-white print:text-black mb-2">{report.cohortScores.cohortAverageCRS}</p>
              <p className="text-xs text-slate-400 print:text-slate-600">Career Readiness Score average across all evaluated students.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 print:border-slate-300 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 print:text-slate-700 font-semibold uppercase">Average IRS</span>
                <FiTarget className="text-violet-400 w-5 h-5" />
              </div>
              <p className="text-4xl font-black text-white print:text-black mb-2">{report.cohortScores.cohortAverageIRS}</p>
              <p className="text-xs text-slate-400 print:text-slate-600">Interview Readiness Score average across all evaluated students.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 print:border-slate-300 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 print:text-slate-700 font-semibold uppercase">Average CCI</span>
                <FiMessageSquare className="text-indigo-400 w-5 h-5" />
              </div>
              <p className="text-4xl font-black text-white print:text-black mb-2">{report.cohortScores.cohortAverageCCI}</p>
              <p className="text-xs text-slate-400 print:text-slate-600">Communication Clarity Index average across all evaluated students.</p>
            </div>
          </div>

          {/* Detailed Statistics Table */}
          <div className="bg-slate-900 border border-slate-800 print:border-slate-300 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white print:text-black mb-4 flex items-center gap-2">
              <FiFileText className="text-rose-400" /> Key Platform Metrics
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 print:border-slate-300 text-slate-500 print:text-slate-700 font-medium">
                    <th className="py-3">Metric Category</th>
                    <th className="py-3">Metric Detail</th>
                    <th className="py-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300 text-slate-300 print:text-black">
                  <tr>
                    <td className="py-3 font-semibold">User Demographics</td>
                    <td className="py-3">Total Registered Users</td>
                    <td className="py-3 text-right font-bold">{report.userStats.totalUsers}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">User Demographics</td>
                    <td className="py-3">Active Accounts</td>
                    <td className="py-3 text-right font-bold text-emerald-400 print:text-emerald-600">{report.userStats.activeUsers}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">User Demographics</td>
                    <td className="py-3">Inactive Accounts</td>
                    <td className="py-3 text-right font-bold">{report.userStats.inactiveUsers}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">Platform Risk</td>
                    <td className="py-3">High-Risk Students (Overall Mastery &lt; 50%)</td>
                    <td className="py-3 text-right font-bold text-rose-400 print:text-rose-600">{report.userStats.highRiskUserCount}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">Platform Engagement</td>
                    <td className="py-3">Total Assignments Generated</td>
                    <td className="py-3 text-right font-bold">{report.platformEngagement.totalAssignments}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">Platform Engagement</td>
                    <td className="py-3">Assignments Completed</td>
                    <td className="py-3 text-right font-bold">{report.platformEngagement.completedAssignments}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">Platform Engagement</td>
                    <td className="py-3">Average Assignment score</td>
                    <td className="py-3 text-right font-bold">{report.platformEngagement.avgAssignmentScore}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">Growth Tracking</td>
                    <td className="py-3">Total Assessment Attempts (Score History records)</td>
                    <td className="py-3 text-right font-bold">{report.cohortScores.totalScoreAttempts}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
