/**
 * Career Intelligence Controller — Module 7
 *
 * Thin controller that delegates all scoring logic to dedicated services.
 * Handles: score computation, growth trend queries, and career summary.
 *
 * Routes (all protected by `protect` middleware):
 *   POST /api/career-intelligence/compute
 *   GET  /api/career-intelligence/growth-trend
 *   GET  /api/career-intelligence/summary
 */

import { catchAsync } from "../utils/errors.js";
import { AppError } from "../utils/errors.js";
import ScoreHistory from "../models/scoreHistory.model.js";
import { calculateIRS } from "../services/irsCalculation.service.js";
import { calculateCCI } from "../services/cciCalculation.service.js";
import { calculateCRS, deriveConsistencyScore } from "../services/crsCalculation.service.js";
import { runCrossAnalysis } from "../services/crossAnalysis.service.js";

class CareerIntelligenceController {
  /**
   * POST /api/career-intelligence/compute
   *
   * Accepts raw session scores, computes IRS/CCI/CRS, runs cross-analysis,
   * saves a new ScoreHistory record, and returns the full computed payload.
   *
   * Expected body:
   * {
   *   technicalScore,       // 0-100, from interview session
   *   behavioralScore,      // 0-100, from interview session
   *   roleSkillMatch,       // 0-100, % match with target role skills
   *   weakInterviewTopics,  // string[], topics where user struggled
   *   grammarAccuracy,      // 0-100, CCI component
   *   logicalSequencing,    // 0-100, CCI component
   *   conceptArticulation,  // 0-100, CCI component
   *   redundancyLevel,      // 0-100, CCI component (higher = more redundant)
   *   starMethodCompliance, // 0-100, CCI component
   *   roleAlignment,        // 0-100, resume role alignment override (optional)
   * }
   */
  computeScores = catchAsync(async (req, res, next) => {
    const user = req.user;
    const {
      technicalScore = 0,
      behavioralScore = 0,
      roleSkillMatch = 0,
      weakInterviewTopics = [],
      grammarAccuracy = 0,
      logicalSequencing = 0,
      conceptArticulation = 0,
      redundancyLevel = 0,
      starMethodCompliance = 0,
      roleAlignment,
    } = req.body;

    // Pull resume strength from user profile (Module 2 integration)
    const resumeStrength = user.resumeData?.strengthScore || 0;

    // Pull learning mastery from user profile (Module 3/4 integration)
    const learningMastery = user.learningProfile?.overallMasteryScore || 0;

    // Count previous attempts for consistency score
    const attemptCount = await ScoreHistory.countDocuments({ userId: user._id });
    const consistencyScore = deriveConsistencyScore(attemptCount + 1); // +1 for current attempt

    // Derive role alignment: use provided value or fallback to resume skill match
    const computedRoleAlignment = roleAlignment !== undefined
      ? roleAlignment
      : (roleSkillMatch || 0);

    // ----- Step 1: Calculate IRS -----
    const irsResult = calculateIRS({
      resumeStrength,
      technicalPerformance: technicalScore,
      behavioralPerformance: behavioralScore,
      roleSkillMatch,
    });

    // ----- Step 2: Calculate CCI -----
    const cciResult = calculateCCI({
      grammarAccuracy,
      logicalSequencing,
      conceptArticulation,
      redundancyLevel,
      starMethodCompliance,
    });

    // ----- Step 3: Calculate CRS -----
    const crsResult = calculateCRS({
      learningMastery,
      interviewReadiness: irsResult.IRS,
      consistencyScore,
      roleAlignment: computedRoleAlignment,
    });

    // ----- Step 4: Cross-analysis & adaptive feedback -----
    const crossAnalysisResult = runCrossAnalysis({
      user,
      technicalScore,
      behavioralScore,
      weakInterviewTopics,
    });

    // ----- Step 5: Persist ScoreHistory record -----
    const scoreRecord = await ScoreHistory.create({
      userId: user._id,

      // IRS fields
      resumeStrength,
      technicalScore,
      behavioralScore,
      roleSkillMatch,
      IRS: irsResult.IRS,
      irsClassification: irsResult.irsClassification,

      // CCI fields
      grammarAccuracy,
      logicalSequencing,
      conceptArticulation,
      redundancyScore: redundancyLevel,
      starMethodCompliance,
      CCI: cciResult.CCI,
      cciClassification: cciResult.cciClassification,

      // CRS fields
      learningMastery,
      consistencyScore,
      roleAlignment: computedRoleAlignment,
      CRS: crsResult.CRS,
      crsClassification: crsResult.crsClassification,

      // Cross-analysis results
      flaggedTopics: crossAnalysisResult.flaggedTopics,
      weaknesses: crossAnalysisResult.weaknesses,
      adaptiveFeedbackTriggered: crossAnalysisResult.adaptiveFeedbackTriggered,
    });

    res.status(201).json({
      success: true,
      message: "Career intelligence scores computed and saved successfully",
      data: {
        scoreRecord: {
          id: scoreRecord._id,
          timestamp: scoreRecord.createdAt,
        },
        scores: {
          IRS: irsResult.IRS,
          irsClassification: irsResult.irsClassification,
          CCI: cciResult.CCI,
          cciClassification: cciResult.cciClassification,
          CRS: crsResult.CRS,
          crsClassification: crsResult.crsClassification,
        },
        breakdowns: {
          irs: irsResult.breakdown,
          cci: cciResult.breakdown,
          crs: crsResult.breakdown,
        },
        crossAnalysis: {
          weaknesses: crossAnalysisResult.weaknesses,
          flaggedTopics: crossAnalysisResult.flaggedTopics,
          adaptiveFeedback: crossAnalysisResult.adaptiveFeedback,
          adaptiveFeedbackTriggered: crossAnalysisResult.adaptiveFeedbackTriggered,
        },
      },
    });
  });

  /**
   * GET /api/career-intelligence/growth-trend
   *
   * Returns historical ScoreHistory records for the logged-in user,
   * ordered chronologically for trend chart rendering.
   *
   * Query params:
   *   limit (optional, default 20) - Max records to return
   */
  getGrowthTrend = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 20;

    const history = await ScoreHistory.find({ userId: req.user._id })
      .sort({ createdAt: 1 })  // Ascending order for chronological trend
      .limit(limit)
      .select("IRS CCI CRS irsClassification cciClassification crsClassification createdAt");

    // Calculate improvement percentage between first and latest record
    let improvementPercentage = null;
    if (history.length >= 2) {
      const first = history[0].CRS;
      const latest = history[history.length - 1].CRS;
      improvementPercentage = first > 0 ? Math.round(((latest - first) / first) * 100) : null;
    }

    res.status(200).json({
      success: true,
      message: "Growth trend data retrieved successfully",
      data: {
        trend: history.map((record) => ({
          timestamp: record.createdAt,
          IRS: record.IRS,
          CCI: record.CCI,
          CRS: record.CRS,
          irsClassification: record.irsClassification,
          cciClassification: record.cciClassification,
          crsClassification: record.crsClassification,
        })),
        meta: {
          totalRecords: history.length,
          improvementPercentage,
        },
      },
    });
  });

  /**
   * GET /api/career-intelligence/summary
   *
   * Returns the most recent IRS, CCI, CRS with classifications
   * and the current adaptive feedback/flagged topics.
   */
  getSummary = catchAsync(async (req, res, next) => {
    const latest = await ScoreHistory.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 });

    if (!latest) {
      return res.status(200).json({
        success: true,
        message: "No score history found. Complete an interview session to generate your career readiness summary.",
        data: {
          hasData: false,
          scores: null,
          flaggedTopics: [],
          adaptiveFeedback: {
            studyPlanInjections: [],
            revisionBoosts: [],
            mockInterviewRecommendations: [],
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Career readiness summary retrieved successfully",
      data: {
        hasData: true,
        scores: {
          IRS: latest.IRS,
          irsClassification: latest.irsClassification,
          CCI: latest.CCI,
          cciClassification: latest.cciClassification,
          CRS: latest.CRS,
          crsClassification: latest.crsClassification,
          lastUpdated: latest.createdAt,
        },
        flaggedTopics: latest.flaggedTopics || [],
        weaknesses: latest.weaknesses || [],
        adaptiveFeedbackTriggered: latest.adaptiveFeedbackTriggered,
      },
    });
  });
}

export default new CareerIntelligenceController();
