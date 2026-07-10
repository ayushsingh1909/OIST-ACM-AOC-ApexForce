import mongoose from "mongoose";

/**
 * Question Model — Module 8: Admin Content Management
 *
 * Unified schema for both quiz questions (Module 3) and
 * interview questions (Module 6). Admins manage these via the
 * content management API.
 */
const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["quiz", "interview"],
      required: [true, "Question type (quiz or interview) is required"],
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
    },
    targetRole: {
      type: String,
      trim: true,
      default: "General",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    // Quiz-specific: multiple choice options and correct answer
    options: [{ type: String }],
    correctAnswer: {
      type: String,
      default: null,
    },

    // Interview-specific: expected answer keywords / ideal response hints
    expectedKeywords: [{ type: String }],
    idealResponseHint: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
