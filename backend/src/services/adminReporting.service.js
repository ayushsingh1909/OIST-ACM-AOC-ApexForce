/**
 * Admin Reporting Service — Module 8: Admin Platform Management
 *
 * Provides aggregation-based reporting logic for the admin dashboard.
 * Queries across Users, ScoreHistory, and Assignment collections.
 */

import User from "../models/user.model.js";
import ScoreHistory from "../models/scoreHistory.model.js";
import Assignment from "../models/assignment.model.js";

/**
 * Generates a comprehensive aggregate report for admin analytics.
 *
 * @returns {Promise<object>} Report containing:
 *   - totalUsers, activeUsers, inactiveUsers
 *   - cohortAverageCRS, cohortAverageIRS, cohortAverageCCI
 *   - irsDistribution (counts per classification bucket)
 *   - highRiskUserCount
 *   - platformEngagement (assignments completed, avg score)
 *   - recentActivity (new users in last 7 days)
 */
export const generateAggregateReport = async () => {
  // ----- User counts -----
  const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
  ]);

  // ----- High-risk users (riskLevel = "high") -----
  const highRiskUserCount = await User.countDocuments({
    "learningProfile.riskLevel": "high",
  });

  // ----- Cohort averages from ScoreHistory -----
  const cohortScoreAgg = await ScoreHistory.aggregate([
    {
      $group: {
        _id: null,
        avgCRS: { $avg: "$CRS" },
        avgIRS: { $avg: "$IRS" },
        avgCCI: { $avg: "$CCI" },
        totalAttempts: { $sum: 1 },
      },
    },
  ]);

  const cohortAverageCRS = cohortScoreAgg[0] ? Math.round(cohortScoreAgg[0].avgCRS) : 0;
  const cohortAverageIRS = cohortScoreAgg[0] ? Math.round(cohortScoreAgg[0].avgIRS) : 0;
  const cohortAverageCCI = cohortScoreAgg[0] ? Math.round(cohortScoreAgg[0].avgCCI) : 0;
  const totalAttempts    = cohortScoreAgg[0]?.totalAttempts || 0;

  // ----- IRS Distribution (classification buckets) -----
  const irsDistributionAgg = await ScoreHistory.aggregate([
    {
      $group: {
        _id: "$irsClassification",
        count: { $sum: 1 },
      },
    },
  ]);

  // Build a normalized distribution object with 0 defaults
  const irsDistribution = {
    "Highly Ready": 0,
    "Moderately Ready": 0,
    "Developing": 0,
    "Needs Significant Improvement": 0,
  };
  for (const bucket of irsDistributionAgg) {
    if (irsDistribution.hasOwnProperty(bucket._id)) {
      irsDistribution[bucket._id] = bucket.count;
    }
  }

  // ----- Platform Engagement — Assignments (Module 4) -----
  let assignmentEngagement = {
    totalAssignments: 0,
    completedAssignments: 0,
    avgAssignmentScore: 0,
  };

  try {
    const [totalAsgn, completedAsgn, avgScoreAgg] = await Promise.all([
      Assignment.countDocuments({}),
      Assignment.countDocuments({ status: "completed" }),
      Assignment.aggregate([
        { $match: { status: "completed", "evaluation.score": { $exists: true } } },
        { $group: { _id: null, avgScore: { $avg: "$evaluation.score" } } },
      ]),
    ]);

    assignmentEngagement = {
      totalAssignments: totalAsgn,
      completedAssignments: completedAsgn,
      avgAssignmentScore: avgScoreAgg[0] ? Math.round(avgScoreAgg[0].avgScore) : 0,
    };
  } catch {
    // Assignment model may not have data yet — graceful fallback
  }

  // ----- Recent Activity — New users in last 7 days -----
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newUsersLast7Days = await User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  return {
    userStats: {
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsersLast7Days,
      highRiskUserCount,
    },
    cohortScores: {
      cohortAverageCRS,
      cohortAverageIRS,
      cohortAverageCCI,
      totalScoreAttempts: totalAttempts,
    },
    irsDistribution,
    platformEngagement: assignmentEngagement,
  };
};
