import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      default: "Uploaded Resume",
    },
    targetRole: {
      type: String,
      required: true,
    },
    strengthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scoreBreakdown: {
      skillRelevance: { type: Number, default: 0 },
      projectDepth: { type: Number, default: 0 },
      experienceIndicators: { type: Number, default: 0 },
      structureScore: { type: Number, default: 0 },
    },
    extractedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    detectedProjects: [{ type: String }],
    detectedExperienceYears: { type: Number, default: 0 },
    improvementSuggestions: [{ type: String }],
  },
  { timestamps: true }
);

const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
export default ResumeAnalysis;
