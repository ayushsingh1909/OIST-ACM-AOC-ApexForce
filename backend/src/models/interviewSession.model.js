import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["Technical", "Behavioral", "System Design", "Project Deep-Dive"],
    required: true
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true
  },
  userAnswer: {
    type: String,
    default: ""
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String
  },
  missingConcepts: [
    {
      type: String
    }
  ],
  evaluatedAt: {
    type: Date
  }
});

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    targetRole: {
      type: String,
      required: true
    },
    skillStack: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ["ongoing", "completed", "expired"],
      default: "ongoing"
    },
    expiresAt: {
      type: Date,
      required: true
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: {
      type: String
    },
    questions: [interviewQuestionSchema]
  },
  { timestamps: true }
);

const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);
export default InterviewSession;
