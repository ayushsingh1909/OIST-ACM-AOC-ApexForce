import mongoose from "mongoose";

const sessionQuestionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewQuestion",
    required: true,
  },
  vertical: {
    type: String,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  idealKeywords: [String],
  sampleAnswer: String,
  answerText: {
    type: String,
    default: "",
  },
  timeSpent: {
    type: Number,
    default: 0, // in seconds
  },
  isAnswered: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  evaluation: {
    keywordRelevance: { type: Number, default: 0 },
    technicalDepth: { type: Number, default: 0 },
    logicalStructure: { type: Number, default: 0 },
    domainTerminology: { type: Number, default: 0 },
    completeness: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    missingConcepts: [String],
  },
});

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "Full-Stack Developer",
    },
    skillStack: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    status: {
      type: String,
      required: true,
      enum: ["Created", "In-Progress", "Completed", "Evaluating"],
      default: "Created",
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    timeLimitPerQuestion: {
      type: Number,
      default: 120, // default 2 minutes (in seconds), 0 = unlimited
    },
    questions: [sessionQuestionSchema],
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    overallFeedback: {
      type: String,
      default: "",
    },
    missingConceptsBreakdown: {
      type: [String],
      default: [],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);
export default InterviewSession;
