import mongoose from "mongoose";

/**
 * RoleSkillMapping Model — Module 8: Admin Content Management
 *
 * Manages the canonical mapping of target roles to their required
 * skills and study topics. Used by Module 3 (Quiz Engine) for quiz
 * generation and Module 6 (Interview Engine) for question selection.
 * Admins can CRUD these mappings via the content management API.
 */
const roleSkillMappingSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    topics: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      default: "",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const RoleSkillMapping = mongoose.model("RoleSkillMapping", roleSkillMappingSchema);
export default RoleSkillMapping;
