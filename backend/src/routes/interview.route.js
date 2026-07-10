import express from "express";
import {
  getRoles,
  startSession,
  getSession,
  submitAnswer,
  completeSession,
  getUserHistory
} from "../controllers/interview.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to protect all simulator APIs
router.use(protect);

// Configuration and onboarding queries
router.get("/roles", getRoles);

// Session lifecycle routes
router.post("/start", startSession);
router.get("/session/:id", getSession);
router.post("/session/:id/answer", submitAnswer);
router.post("/session/:id/complete", completeSession);

// Session history route
router.get("/history", getUserHistory);

export default router;
