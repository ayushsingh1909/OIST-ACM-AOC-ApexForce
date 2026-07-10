import quizService from "../services/quiz.service.js";
import { catchAsync } from "../utils/errors.js";
import { sendSuccess } from "../utils/response.js";

class QuizController {
  startQuiz = catchAsync(async (req, res) => {
    const data = await quizService.generateAdaptiveQuiz(req.user._id);
    sendSuccess(res, 201, "Adaptive quiz generated successfully", data);
  });

  getAttempt = catchAsync(async (req, res) => {
    const attempt = await quizService.getAttempt(req.params.attemptId, req.user._id);
    sendSuccess(res, 200, "Quiz attempt fetched", {
      attemptId: attempt._id,
      status: attempt.status,
      timeLimitMinutes: attempt.timeLimitMinutes,
      questions: attempt.questions.map((q) => ({
        questionId: q.questionId,
        topic: q.topic,
        type: q.type,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.options,
        userAnswer: q.userAnswer,
        isFlagged: q.isFlagged,
      })),
      startedAt: attempt.startedAt,
    });
  });

  saveAnswer = catchAsync(async (req, res) => {
    const result = await quizService.saveAnswer(req.params.attemptId, req.user._id, req.body);
    sendSuccess(res, 200, "Answer saved", { question: result });
  });

  submitQuiz = catchAsync(async (req, res) => {
    const result = await quizService.submitQuiz(req.params.attemptId, req.user._id);
    sendSuccess(res, 200, "Quiz submitted and evaluated", result);
  });

  getHistory = catchAsync(async (req, res) => {
    const history = await quizService.getQuizHistory(req.user._id);
    sendSuccess(res, 200, "Quiz history fetched", { history });
  });

  getStats = catchAsync(async (req, res) => {
    const stats = await quizService.getQuizStats(req.user._id);
    sendSuccess(res, 200, "Quiz statistics fetched", stats);
  });
}

export default new QuizController();
