import { Router } from "express";
import quizController from "../controllers/quiz.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.post("/start", quizController.startQuiz);
router.get("/history", quizController.getHistory);
router.get("/stats", quizController.getStats);
router.get("/:attemptId", quizController.getAttempt);
router.patch("/:attemptId/answer", quizController.saveAnswer);
router.post("/:attemptId/submit", quizController.submitQuiz);

export default router;
