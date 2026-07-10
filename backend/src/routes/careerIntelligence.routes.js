/**
 * Career Intelligence Routes — Module 7
 *
 * All routes are protected by the `protect` middleware (Module 1 auth).
 * Business logic lives in careerIntelligence.controller.js.
 *
 * Base: /api/career-intelligence
 */

import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import careerIntelligenceController from "../controllers/careerIntelligence.controller.js";

const router = Router();

// All career intelligence routes require authentication
router.use(protect);

/**
 * POST /api/career-intelligence/compute
 * Compute IRS, CCI, CRS scores from a session's raw inputs.
 * Saves a new ScoreHistory record and runs cross-analysis.
 */
router.post("/compute", careerIntelligenceController.computeScores);

/**
 * GET /api/career-intelligence/growth-trend
 * Returns chronological ScoreHistory for trend chart rendering.
 * Query: limit (default 20)
 */
router.get("/growth-trend", careerIntelligenceController.getGrowthTrend);

/**
 * GET /api/career-intelligence/summary
 * Returns the latest IRS, CCI, CRS with classifications
 * and current flagged topics / adaptive feedback.
 */
router.get("/summary", careerIntelligenceController.getSummary);

export default router;
