import mongoose from "mongoose";

/**
 * ScoreHistory Model — Module 7: Career Intelligence Engine
 *
 * Stores one record per interview/assessment attempt per user.
 * Used by the growth trend API and career readiness summary API.
 */
const scoreHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Indexed for fast per-user queries
    },

    // ----- Interview Readiness Score (IRS) components -----
    resumeStrength: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    technicalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    behavioralScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    roleSkillMatch: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ----- Computed Scores -----
    IRS: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    irsClassification: {
      type: String,
      enum: ["Highly Ready", "Moderately Ready", "Developing", "Needs Significant Improvement"],
      default: "Needs Significant Improvement",
    },

    // ----- Communication Clarity Index (CCI) components -----
    grammarAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    logicalSequencing: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    conceptArticulation: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    redundancyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      // Note: Higher redundancy = lower CCI contribution. This stores the raw redundancy level.
    },
    starMethodCompliance: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    CCI: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    cciClassification: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Needs Improvement"],
      default: "Needs Improvement",
    },

    // ----- Career Readiness Score (CRS) components -----
    learningMastery: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    consistencyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    roleAlignment: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    CRS: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    crsClassification: {
      type: String,
      enum: ["Career Ready", "On Track", "Progressing", "Early Stage"],
      default: "Early Stage",
    },

    // ----- Cross-Analysis Results -----
    flaggedTopics: [
      {
        topicName: { type: String },
        priority: { type: String, enum: ["High", "Medium", "Low"], default: "High" },
        reason: { type: String }, // e.g. "Weak interview response + low mastery score"
      },
    ],
    weaknesses: [
      {
        area: { type: String }, // e.g. "React Hooks", "SQL"
        source: { type: String }, // e.g. "interview", "quiz", "resume"
        details: { type: String },
      },
    ],
    adaptiveFeedbackTriggered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ScoreHistory = mongoose.model("ScoreHistory", scoreHistorySchema);
export default ScoreHistory;
