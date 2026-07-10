import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
  {
    vertical: {
      type: String,
      required: [true, "Vertical category is required"],
      enum: ["Technical", "Behavioral", "System Design", "Project Deep-Dive"],
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, "Difficulty level is required"],
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    idealKeywords: {
      type: [String],
      required: [true, "Ideal keywords are required for evaluation"],
      default: [],
    },
    roles: {
      type: [String],
      required: [true, "Associated roles are required"],
      default: ["Full-Stack Developer"],
    },
    rubric: {
      keywordRelevance: { type: String, default: "Contains key technical terms corresponding to the problem domain." },
      technicalDepth: { type: String, default: "Explains structural details, performance trade-offs, and underlying mechanics." },
      logicalStructure: { type: String, default: "Includes clear introductory statements, key architectural elements, and summary." },
      domainTerminology: { type: String, default: "Uses correct frameworks, APIs, parameters, and design patterns." },
      completeness: { type: String, default: "Covers all components of the prompt with sufficient explanation." },
    },
    sampleAnswer: {
      type: String,
      required: [true, "A sample/ideal answer is required for reference"],
      trim: true,
    },
  },
  { timestamps: true }
);

// Create indexes for efficient querying during session initialization
interviewQuestionSchema.index({ vertical: 1, difficulty: 1 });
interviewQuestionSchema.index({ roles: 1 });

const InterviewQuestion = mongoose.model("InterviewQuestion", interviewQuestionSchema);
export default InterviewQuestion;
