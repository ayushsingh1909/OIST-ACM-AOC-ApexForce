import mongoose from "mongoose";
import User from "../models/user.model.js";
import { Question, QuizAttempt } from "../models/quiz.model.js";
import { ScoreRecord } from "../models/score.model.js";
import masteryService from "./mastery.service.js";
import { AppError } from "../utils/errors.js";

const QUESTION_COUNT = 10;
const TIME_LIMIT_MINUTES = 15;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

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

  normalizeDifficulty(difficulty) {
    const value = String(difficulty || "").toLowerCase();
    if (value === "easy" || value === "medium" || value === "hard") {
      return value;
    }
    return "medium";
  }

  cleanJsonPayload(text) {
    const stripped = String(text || "")
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstObject = stripped.indexOf("{");
    const firstArray = stripped.indexOf("[");
    const startIndex = firstArray !== -1 && (firstArray < firstObject || firstObject === -1)
      ? firstArray
      : firstObject;
    const endIndex = Math.max(stripped.lastIndexOf("}"), stripped.lastIndexOf("]"));

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      return stripped;
    }

    return stripped.slice(startIndex, endIndex + 1);
  }

  normalizeGeneratedQuestion(question, fallbackTopic, fallbackDifficulty) {
    const type = this.normalizeQuestionType(question?.type);
    const difficulty = this.normalizeDifficulty(question?.difficulty || fallbackDifficulty);
    const topic = String(question?.topic || fallbackTopic || "General").trim() || "General";
    const questionText = String(question?.questionText || question?.question || "").trim();
    const correctAnswer = String(question?.correctAnswer || "").trim();

    if (!questionText || !correctAnswer) {
      return null;
    }

    const options = Array.isArray(question?.options)
      ? [...new Set(question.options.map((option) => String(option).trim()).filter(Boolean))]
      : [];

    if (type === "mcq" && options.length < 4) {
      return null;
    }

    return {
      topic,
      type,
      difficulty,
      questionText,
      options: type === "mcq" ? options.slice(0, 4) : [],
      correctAnswer,
      explanation: String(question?.explanation || "").trim(),
      tags: Array.isArray(question?.tags)
        ? question.tags.map((tag) => String(tag).trim()).filter(Boolean)
        : [],
    };
  }

  normalizeQuestionType(type) {
    const value = String(type || "short-answer").toLowerCase();
    if (value === "mcq" || value === "short-answer" || value === "code-output") {
      return value;
    }
    return "short-answer";
  }

  buildAttemptQuestion(question, generated = false) {
    return {
      questionId: generated ? new mongoose.Types.ObjectId() : question._id,
      topic: question.topic,
      type: question.type,
      difficulty: question.difficulty,
      questionText: question.questionText,
      options: Array.isArray(question.options) ? question.options : [],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      tags: Array.isArray(question.tags) ? question.tags : [],
    };
  }

  async generateQuestionsWithGemini(weakTopics, targetDifficulty) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return [];
    }

    const prompt = `
Generate ${QUESTION_COUNT} quiz questions for an adaptive learning platform.

Requirements:
- Return JSON only, no markdown, no code fences, no commentary.
- The root object must have a "questions" array.
- Each question must include: topic, type, difficulty, questionText, options, correctAnswer, explanation, tags.
- Use only these types: "mcq" or "short-answer".
- Use lower-case difficulties: "easy", "medium", or "hard".
- Mix questions across these weak topics where possible: ${weakTopics.join(", ")}
- Prefer the target difficulty: ${targetDifficulty}.
- For mcq questions, include exactly 4 unique options and make correctAnswer match one option exactly.
- For short-answer questions, keep correctAnswer concise and factual.

Return a balanced mix of practical, interview-style questions suitable for a full-stack learner.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const rawText = payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!rawText) {
      throw new Error("Gemini returned an empty response");
    }

    const parsed = JSON.parse(this.cleanJsonPayload(rawText));
    const questionList = Array.isArray(parsed) ? parsed : parsed.questions;

    if (!Array.isArray(questionList)) {
      throw new Error("Gemini response did not contain a questions array");
    }

    return questionList
      .map((question, index) => this.normalizeGeneratedQuestion(
        question,
        weakTopics[index % weakTopics.length],
        targetDifficulty
      ))
      .filter(Boolean)
      .map((question) => this.buildAttemptQuestion(question, true))
      .slice(0, QUESTION_COUNT);
  }

  async generateAdaptiveQuiz(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const weakTopics = this.getWeakTopics(user);
    const targetDifficulty = this.getTargetDifficulty(user);

    let questions = [];

    try {
      questions = await this.generateQuestionsWithGemini(weakTopics, targetDifficulty);
    } catch (error) {
      console.warn(`Gemini quiz generation failed, falling back to question bank: ${error.message}`);
    }

    const mistakeQuestionIds = (user.learningProfile?.mistakeHistory || [])
      .map((m) => m.questionId)
      .filter(Boolean);

    if (questions.length < QUESTION_COUNT) {
      let bankQuestions = await Question.find({
        isActive: true,
        topic: { $in: weakTopics },
        difficulty: targetDifficulty,
      }).limit(QUESTION_COUNT * 2);

      if (bankQuestions.length < QUESTION_COUNT) {
        const extra = await Question.find({
          isActive: true,
          topic: { $in: weakTopics },
        }).limit(QUESTION_COUNT);
        bankQuestions = [...bankQuestions, ...extra];
      }

      if (bankQuestions.length < QUESTION_COUNT) {
        const fallback = await Question.find({ isActive: true }).limit(QUESTION_COUNT);
        bankQuestions = [...bankQuestions, ...fallback];
      }

      const uniqueMap = new Map();
      for (const q of bankQuestions) {
        uniqueMap.set(q._id.toString(), q);
      }

      const prioritized = [...uniqueMap.values()].sort((a, b) => {
        const aMistake = mistakeQuestionIds.some((id) => id.toString() === a._id.toString()) ? -1 : 0;
        const bMistake = mistakeQuestionIds.some((id) => id.toString() === b._id.toString()) ? -1 : 0;
        if (aMistake !== bMistake) return aMistake - bMistake;
        return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      });

      const fallbackSelected = prioritized
        .slice(0, QUESTION_COUNT)
        .map((question) => this.buildAttemptQuestion(question));

      questions = [...questions, ...fallbackSelected];
    }

    const selected = questions.slice(0, QUESTION_COUNT);

    if (selected.length === 0) {
      throw new AppError("No quiz questions available. Please seed the question bank.", 404);
    }

    const normalizedSelected = selected.map((question) =>
      question.questionId ? question : this.buildAttemptQuestion(question)
    );

    const attempt = await QuizAttempt.create({
      user: userId,
      questions: normalizedSelected,
      totalQuestions: normalizedSelected.length,
      timeLimitMinutes: TIME_LIMIT_MINUTES,
      adaptiveProfile: { weakTopics, targetDifficulty },
    });

    return {
      attemptId: attempt._id,
      timeLimitMinutes: TIME_LIMIT_MINUTES,
      totalQuestions: normalizedSelected.length,
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
