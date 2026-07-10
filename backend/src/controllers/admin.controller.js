/**
 * Admin Controller — Module 8: Admin Platform Management
 *
 * Thin controller delegating to services and models.
 * All routes require `protect` + `adminOnly` middleware.
 *
 * Handles:
 *   - User management (list, view, update role, toggle status)
 *   - Question bank CRUD (quiz + interview questions)
 *   - Role-skill mapping CRUD
 *   - Aggregate reporting
 */

import { catchAsync } from "../utils/errors.js";
import { AppError } from "../utils/errors.js";
import User from "../models/user.model.js";
import Question from "../models/question.model.js";
import RoleSkillMapping from "../models/roleSkillMapping.model.js";
import { generateAggregateReport } from "../services/adminReporting.service.js";

class AdminController {
  // ============================================================
  // USER MANAGEMENT
  // ============================================================

  /**
   * GET /api/admin/users
   * Lists all users with pagination and search support.
   * Query params: page, limit, search (name/email), role, status
   */
  listUsers = catchAsync(async (req, res, next) => {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const filter = {};

    // Optional search by name or email
    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    // Optional filter by role
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Optional filter by active status
    if (req.query.status === "active")   filter.isActive = true;
    if (req.query.status === "inactive") filter.isActive = false;

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select("-password -passwordResetToken -passwordResetExpires")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  });

  /**
   * GET /api/admin/users/:id
   * Returns full user details including learning profile and resume data.
   */
  getUserDetail = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
      .select("-password -passwordResetToken -passwordResetExpires");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "User detail retrieved successfully",
      data: { user },
    });
  });

  /**
   * PATCH /api/admin/users/:id/role
   * Updates a user's role (student / admin / judge).
   * Body: { role }
   */
  updateUserRole = catchAsync(async (req, res, next) => {
    const { role } = req.body;
    const validRoles = ["student", "admin", "judge"];

    if (!role || !validRoles.includes(role)) {
      return next(new AppError(`Invalid role. Must be one of: ${validRoles.join(", ")}`, 400));
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user._id.toString() && role !== "admin") {
      return next(new AppError("Admins cannot change their own role.", 403));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: `User role updated to "${role}" successfully`,
      data: { user },
    });
  });

  /**
   * PATCH /api/admin/users/:id/status
   * Activates or deactivates a user account.
   * Body: { isActive: true | false }
   */
  toggleUserStatus = catchAsync(async (req, res, next) => {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return next(new AppError("isActive must be a boolean (true or false)", 400));
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString() && !isActive) {
      return next(new AppError("Admins cannot deactivate their own account.", 403));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const action = isActive ? "activated" : "deactivated";
    res.status(200).json({
      success: true,
      message: `User account ${action} successfully`,
      data: { user },
    });
  });

  // ============================================================
  // QUESTION BANK CRUD
  // ============================================================

  /**
   * GET /api/admin/questions
   * Lists all questions with optional filters.
   * Query: type (quiz|interview), topic, role, difficulty, page, limit
   */
  getQuestions = catchAsync(async (req, res, next) => {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.type)       filter.type = req.query.type;
    if (req.query.topic)      filter.topic = new RegExp(req.query.topic, "i");
    if (req.query.role)       filter.targetRole = new RegExp(req.query.role, "i");
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === "true";
    }

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email"),
      Question.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: "Questions retrieved successfully",
      data: {
        questions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  });

  /**
   * POST /api/admin/questions
   * Creates a new question (quiz or interview type).
   * Body: { text, type, topic, targetRole, difficulty, options, correctAnswer, expectedKeywords, idealResponseHint }
   */
  createQuestion = catchAsync(async (req, res, next) => {
    const {
      text, type, topic, targetRole, difficulty,
      options, correctAnswer, expectedKeywords, idealResponseHint,
    } = req.body;

    if (!text || !type || !topic) {
      return next(new AppError("text, type, and topic are required fields", 400));
    }

    // Quiz questions require correct answer
    if (type === "quiz" && !correctAnswer) {
      return next(new AppError("Quiz questions require a correctAnswer", 400));
    }

    const question = await Question.create({
      text, type, topic, targetRole, difficulty,
      options: options || [],
      correctAnswer: correctAnswer || null,
      expectedKeywords: expectedKeywords || [],
      idealResponseHint: idealResponseHint || "",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: { question },
    });
  });

  /**
   * PUT /api/admin/questions/:id
   * Updates an existing question.
   * Body: any updatable fields from Question schema
   */
  updateQuestion = catchAsync(async (req, res, next) => {
    const allowedUpdates = [
      "text", "type", "topic", "targetRole", "difficulty",
      "options", "correctAnswer", "expectedKeywords", "idealResponseHint", "isActive",
    ];

    // Filter request body to only allowed fields
    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!question) {
      return next(new AppError("Question not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: { question },
    });
  });

  /**
   * DELETE /api/admin/questions/:id
   * Deletes a question permanently.
   */
  deleteQuestion = catchAsync(async (req, res, next) => {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return next(new AppError("Question not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
      data: null,
    });
  });

  // ============================================================
  // ROLE-SKILL MAPPING CRUD
  // ============================================================

  /**
   * GET /api/admin/role-skills
   * Returns all role-skill mappings.
   */
  getRoleSkillMappings = catchAsync(async (req, res, next) => {
    const mappings = await RoleSkillMapping.find()
      .sort({ role: 1 })
      .populate("updatedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Role-skill mappings retrieved successfully",
      data: { mappings },
    });
  });

  /**
   * POST /api/admin/role-skills
   * Creates a new role-skill mapping.
   * Body: { role, skills[], topics[], description }
   */
  createRoleSkillMapping = catchAsync(async (req, res, next) => {
    const { role, skills, topics, description } = req.body;

    if (!role) {
      return next(new AppError("Role name is required", 400));
    }

    const mapping = await RoleSkillMapping.create({
      role,
      skills: skills || [],
      topics: topics || [],
      description: description || "",
      updatedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Role-skill mapping created successfully",
      data: { mapping },
    });
  });

  /**
   * PUT /api/admin/role-skills/:id
   * Updates a role-skill mapping.
   * Body: { role, skills[], topics[], description }
   */
  updateRoleSkillMapping = catchAsync(async (req, res, next) => {
    const { role, skills, topics, description } = req.body;

    const mapping = await RoleSkillMapping.findByIdAndUpdate(
      req.params.id,
      { role, skills, topics, description, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!mapping) {
      return next(new AppError("Role-skill mapping not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Role-skill mapping updated successfully",
      data: { mapping },
    });
  });

  /**
   * DELETE /api/admin/role-skills/:id
   * Deletes a role-skill mapping.
   */
  deleteRoleSkillMapping = catchAsync(async (req, res, next) => {
    const mapping = await RoleSkillMapping.findByIdAndDelete(req.params.id);

    if (!mapping) {
      return next(new AppError("Role-skill mapping not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Role-skill mapping deleted successfully",
      data: null,
    });
  });

  // ============================================================
  // AGGREGATE REPORTING
  // ============================================================

  /**
   * GET /api/admin/reports/aggregate
   * Returns platform-wide aggregate stats for admin dashboard.
   */
  getAggregateReport = catchAsync(async (req, res, next) => {
    const report = await generateAggregateReport();

    res.status(200).json({
      success: true,
      message: "Aggregate report generated successfully",
      data: { report },
    });
  });
}

export default new AdminController();
