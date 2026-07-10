import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, index: true },
    subtopic: { type: String, default: "" },
    type: {
      type: String,
      enum: ["mcq", "code-output", "short-answer"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: "" },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questions: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        topic: String,
        type: String,
        difficulty: String,
        questionText: String,
        options: [String],
        correctAnswer: String,
        userAnswer: { type: String, default: "" },
        isCorrect: { type: Boolean, default: false },
        isFlagged: { type: Boolean, default: false },
        timeSpentSeconds: { type: Number, default: 0 },
      },
    ],
    status: {
      type: String,
      enum: ["in-progress", "completed", "expired"],
      default: "in-progress",
    },
    totalQuestions: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
    score: { type: Number, default: 0, min: 0, max: 100 },
    timeLimitMinutes: { type: Number, default: 15 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    topicBreakdown: [
      {
        topic: String,
        total: Number,
        correct: Number,
        accuracy: Number,
      },
    ],
    adaptiveProfile: {
      weakTopics: [String],
      targetDifficulty: String,
    },
  },
  { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);
export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
