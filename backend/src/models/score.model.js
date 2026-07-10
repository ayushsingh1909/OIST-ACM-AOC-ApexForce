import mongoose from "mongoose";

const scoreRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ["quiz", "assignment", "resume", "manual"],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    topic: { type: String, required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    previousMastery: { type: Number, default: 0 },
    newMastery: { type: Number, default: 0 },
    metadata: {
      accuracy: Number,
      difficulty: String,
      attemptNumber: Number,
    },
  },
  { timestamps: true }
);

const spacedRepetitionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: { type: String, required: true },
    nextReviewAt: { type: Date, required: true },
    intervalDays: { type: Number, default: 1 },
    easeFactor: { type: Number, default: 2.5 },
    repetitionCount: { type: Number, default: 0 },
    lastScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["scheduled", "completed", "overdue"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

spacedRepetitionSchema.index({ user: 1, topic: 1 }, { unique: true });

export const ScoreRecord = mongoose.model("ScoreRecord", scoreRecordSchema);
export const SpacedRepetition = mongoose.model(
  "SpacedRepetition",
  spacedRepetitionSchema
);
