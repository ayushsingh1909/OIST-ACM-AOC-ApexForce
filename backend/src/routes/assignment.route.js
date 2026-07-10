import express from "express";
import multer from "multer";
import { generateAssignment, submitAssignment, getUserAssignments } from "../controller/assignment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Configure multer memory storage for submission attachment uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // Limit ZIP/PDF deliverables to 10MB
  }
});

// POST /api/assignments/generate - Create a new topic-specific assignment
router.post("/generate", protect, generateAssignment);

// POST /api/assignments/:id/submit - Submit assignment text, code, repo link, or file
router.post("/:id/submit", protect, upload.single("file"), submitAssignment);

// GET /api/assignments - Retrieve logged-in user's assignment history
router.get("/", protect, getUserAssignments);

export default router;
