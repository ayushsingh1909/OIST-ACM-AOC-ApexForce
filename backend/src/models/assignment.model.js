import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicName: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    problemStatement: {
      type: String,
      required: true,
    },
    assignmentType: {
      type: String,
      enum: ["Coding", "Mini Project", "Case Study", "Analytical", "Debugging", "System Design"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    submission: {
      mode: {
        type: String,
        enum: ["Code", "File", "Text", "GitHub"],
      },
      content: {
        type: String,
      },
      submittedAt: {
        type: Date,
      },
    },
    evaluation: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      conceptCoverage: [
        {
          concept: { type: String, required: true },
          covered: { type: Boolean, required: true },
        },
      ],
      mistakeBreakdown: [
        {
          category: { type: String, required: true },
          details: { type: String, required: true },
        },
      ],
      improvementSuggestions: [{ type: String }],
      evaluatedAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
