import express from "express";
import { startInterview, submitAnswer, getHistory, getReport } from "../controller/interview.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/interviews/start - Initialize mock interview session
router.post("/start", protect, startInterview);

// POST /api/interviews/:id/submit - Submit answer for active question
router.post("/:id/submit", protect, submitAnswer);

// GET /api/interviews/history - Get brief session logs of previous attempts
router.get("/history", protect, getHistory);

// GET /api/interviews/:id/report - Get full detail report breakdown of session
router.get("/:id/report", protect, getReport);

export default router;
