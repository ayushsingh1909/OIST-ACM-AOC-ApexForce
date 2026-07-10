import User from "../models/user.model.js";
import { Question, QuizAttempt } from "../models/quiz.model.js";
import { ScoreRecord } from "../models/score.model.js";
import masteryService from "./mastery.service.js";
import { AppError } from "../utils/errors.js";

const QUESTION_COUNT = 10;
const TIME_LIMIT_MINUTES = 15;

const DIFFICULTY_ORDER = { easy: 1, medium: 2, hard: 3 };

class QuizService {
  getWeakTopics(user) {
    const topicMastery = user.learningProfile?.topicMastery || [];
    const mistakes = user.learningProfile?.mistakeHistory || [];

    const weakFromMastery = topicMastery
      .filter((t) => t.masteryScore < 60)
      .map((t) => t.topicName);

    const weakFromMistakes = [...new Set(mistakes.map((m) => m.topicName).filter(Boolean))];

    const combined = [...new Set([...weakFromMastery, ...weakFromMistakes])];
    return combined.length > 0 ? combined : ["JavaScript", "React", "Node.js"];
  }

  getTargetDifficulty(user) {
    const mastery = user.learningProfile?.overallMasteryScore || 0;
    if (mastery < 40) return "easy";
    if (mastery < 70) return "medium";
    return "hard";
  }

  async generateAdaptiveQuiz(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const weakTopics = this.getWeakTopics(user);
    const targetDifficulty = this.getTargetDifficulty(user);

    const mistakeQuestionIds = (user.learningProfile?.mistakeHistory || [])
      .map((m) => m.questionId)
      .filter(Boolean);

    let questions = await Question.find({
      isActive: true,
      topic: { $in: weakTopics },
      difficulty: targetDifficulty,
    }).limit(QUESTION_COUNT * 2);

    if (questions.length < QUESTION_COUNT) {
      const extra = await Question.find({
        isActive: true,
        topic: { $in: weakTopics },
      }).limit(QUESTION_COUNT);
      questions = [...questions, ...extra];
    }

    if (questions.length < QUESTION_COUNT) {
      const fallback = await Question.find({ isActive: true }).limit(QUESTION_COUNT);
      questions = [...questions, ...fallback];
    }

    const uniqueMap = new Map();
    for (const q of questions) {
      uniqueMap.set(q._id.toString(), q);
    }

    const prioritized = [...uniqueMap.values()].sort((a, b) => {
      const aMistake = mistakeQuestionIds.some((id) => id.toString() === a._id.toString()) ? -1 : 0;
      const bMistake = mistakeQuestionIds.some((id) => id.toString() === b._id.toString()) ? -1 : 0;
      if (aMistake !== bMistake) return aMistake - bMistake;
      return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
    });

    const selected = prioritized.slice(0, QUESTION_COUNT);

    if (selected.length === 0) {
      throw new AppError("No quiz questions available. Please seed the question bank.", 404);
    }

    const attempt = await QuizAttempt.create({
      user: userId,
      questions: selected.map((q) => ({
        questionId: q._id,
        topic: q.topic,
        type: q.type,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
      totalQuestions: selected.length,
      timeLimitMinutes: TIME_LIMIT_MINUTES,
      adaptiveProfile: { weakTopics, targetDifficulty },
    });

    return {
      attemptId: attempt._id,
      timeLimitMinutes: TIME_LIMIT_MINUTES,
      totalQuestions: selected.length,
      questions: attempt.questions.map((q) => ({
        questionId: q.questionId,
        topic: q.topic,
        type: q.type,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.options,
      })),
      adaptiveProfile: attempt.adaptiveProfile,
    };
  }

  async getAttempt(attemptId, userId) {
    const attempt = await QuizAttempt.findOne({ _id: attemptId, user: userId });
    if (!attempt) throw new AppError("Quiz attempt not found", 404);
    return attempt;
  }

  async saveAnswer(attemptId, userId, { questionId, userAnswer, isFlagged, timeSpentSeconds }) {
    const attempt = await this.getAttempt(attemptId, userId);
    if (attempt.status !== "in-progress") {
      throw new AppError("This quiz has already been submitted", 400);
    }

    const qIndex = attempt.questions.findIndex(
      (q) => q.questionId.toString() === questionId.toString()
    );
    if (qIndex === -1) throw new AppError("Question not found in this attempt", 404);

    attempt.questions[qIndex].userAnswer = userAnswer || "";
    if (typeof isFlagged === "boolean") attempt.questions[qIndex].isFlagged = isFlagged;
    if (timeSpentSeconds) attempt.questions[qIndex].timeSpentSeconds = timeSpentSeconds;

    await attempt.save();
    return attempt.questions[qIndex];
  }

  normalizeAnswer(answer) {
    return (answer || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  evaluateAnswer(question, userAnswer) {
    const normalized = this.normalizeAnswer(userAnswer);
    const correct = this.normalizeAnswer(question.correctAnswer);

    if (question.type === "mcq" || question.type === "code-output") {
      return normalized === correct;
    }

    if (question.type === "short-answer") {
      const keywords = correct.split("|").map((k) => k.trim());
      return keywords.some((kw) => normalized.includes(kw));
    }

    return normalized === correct;
  }

  async submitQuiz(attemptId, userId) {
    const attempt = await this.getAttempt(attemptId, userId);
    if (attempt.status === "completed") {
      throw new AppError("Quiz already submitted", 400);
    }

    let correctCount = 0;
    const topicStats = {};

    for (const q of attempt.questions) {
      const isCorrect = this.evaluateAnswer(q, q.userAnswer);
      q.isCorrect = isCorrect;
      if (isCorrect) correctCount++;

      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, correct: 0 };
      }
      topicStats[q.topic].total++;
      if (isCorrect) topicStats[q.topic].correct++;
    }

    const accuracy = Math.round((correctCount / attempt.totalQuestions) * 100);
    const topicBreakdown = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      total: stats.total,
      correct: stats.correct,
      accuracy: Math.round((stats.correct / stats.total) * 100),
    }));

    attempt.correctCount = correctCount;
    attempt.accuracy = accuracy;
    attempt.score = accuracy;
    attempt.topicBreakdown = topicBreakdown;
    attempt.status = "completed";
    attempt.completedAt = new Date();

    await attempt.save();

    const user = await User.findById(userId);
    for (const q of attempt.questions) {
      if (!q.isCorrect) {
        user.learningProfile.mistakeHistory.push({
          topicName: q.topic,
          questionId: q.questionId,
          errorPattern: `Incorrect on ${q.type} question`,
        });
      }
    }

    for (const breakdown of topicBreakdown) {
      await masteryService.updateTopicMastery(user, breakdown.topic, {
        quizAccuracy: breakdown.accuracy,
        scoreDelta: breakdown.accuracy >= 70 ? 5 : -3,
      });

      await ScoreRecord.create({
        user: userId,
        sourceType: "quiz",
        sourceId: attempt._id,
        topic: breakdown.topic,
        score: breakdown.accuracy,
        metadata: { accuracy: breakdown.accuracy, difficulty: attempt.adaptiveProfile?.targetDifficulty },
      });
    }

    user.learningProfile.overallMasteryScore = masteryService.calculateOverallMastery(
      user.learningProfile.topicMastery
    );
    user.learningProfile.riskLevel = masteryService.calculateRiskLevel(
      user.learningProfile.overallMasteryScore,
      user.learningProfile.topicMastery
    );

    await user.save();

    return {
      attemptId: attempt._id,
      correctCount,
      totalQuestions: attempt.totalQuestions,
      accuracy,
      score: accuracy,
      topicBreakdown,
      questions: attempt.questions.map((q) => ({
        questionId: q.questionId,
        topic: q.topic,
        questionText: q.questionText,
        userAnswer: q.userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect: q.isCorrect,
        isFlagged: q.isFlagged,
      })),
      completedAt: attempt.completedAt,
    };
  }

  async getQuizHistory(userId) {
    return QuizAttempt.find({ user: userId, status: "completed" })
      .sort({ completedAt: -1 })
      .select("-questions.correctAnswer");
  }

  async getQuizStats(userId) {
    const attempts = await QuizAttempt.find({ user: userId, status: "completed" });
    const totalAttempts = attempts.length;
    const avgAccuracy =
      totalAttempts > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / totalAttempts)
        : 0;

    const topicMap = {};
    for (const attempt of attempts) {
      for (const tb of attempt.topicBreakdown || []) {
        if (!topicMap[tb.topic]) topicMap[tb.topic] = { total: 0, correct: 0 };
        topicMap[tb.topic].total += tb.total;
        topicMap[tb.topic].correct += tb.correct;
      }
    }

    const topicAccuracy = Object.entries(topicMap).map(([topic, stats]) => ({
      topic,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      questionsAnswered: stats.total,
    }));

    return { totalAttempts, avgAccuracy, topicAccuracy };
  }
}

export default new QuizService();
