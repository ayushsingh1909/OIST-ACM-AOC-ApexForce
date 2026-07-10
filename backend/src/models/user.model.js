import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Queries me password by default leak nahi hoga
    },
    role: {
      type: String,
      enum: ["student", "admin", "judge"],
      default: "student",
    },

    // --- Resume Intelligence Module Data ---
    resumeData: {
      resumeUrl: { type: String, default: "" },
      strengthScore: { type: Number, default: 0, min: 0, max: 100 },
      extractedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      detectedProjects: [{ type: String }],
    },

    // --- Adaptive Learning & Performance Metrics ---
    learningProfile: {
      targetRole: { type: String, default: "Full-Stack Developer" },
      overallMasteryScore: { type: Number, default: 0, min: 0, max: 100 },
      riskLevel: {
        type: String,
        enum: ["low", "moderate", "high"],
        default: "high",
      },
      // Topic-wise heat map aur tracking ke liye
      topicMastery: [
        {
          topicName: { type: String, required: true }, // e.g., "React Hooks", "SQL Joins"
          masteryScore: { type: Number, default: 0, min: 0, max: 100 },
          quizAccuracy: { type: Number, default: 0 },
          assignmentScore: { type: Number, default: 0 },
          attemptsCount: { type: Number, default: 0 },
        },
      ],
      mistakeHistory: [
        {
          topicName: { type: String },
          questionId: { type: mongoose.Schema.Types.ObjectId },
          errorPattern: { type: String },
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },

    // --- Account Status & Session Management ---
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordResetToken: {
      type: String,
      default: undefined,
    },
    passwordResetExpires: {
      type: Date,
      default: undefined,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// --- Password Hashing Middleware (Bcrypt) ---
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// --- Password Verification Method ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
