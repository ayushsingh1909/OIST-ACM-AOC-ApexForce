import express from "express";
import multer from "multer";
import { uploadResume, getResumeHistory } from "../controller/resume.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Set up multer memory storage for fast on-the-fly parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit resume size to 5MB
  }
});

// POST /api/resume/upload - Upload resume PDF or send plain text body
router.post("/upload", protect, upload.single("resume"), uploadResume);

// GET /api/resume/history - Retrieve user's previous resume analyses
router.get("/history", protect, getResumeHistory);

export default router;
