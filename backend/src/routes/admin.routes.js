/**
 * Admin Routes — Module 8
 *
 * All routes are protected by BOTH:
 *   1. `protect`   — verifies JWT and loads req.user (Module 1)
 *   2. `adminOnly` — restricts access to role === "admin" (Module 8)
 *
 * Base: /api/admin
 */

import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/adminOnly.middleware.js";
import adminController from "../controllers/admin.controller.js";

const router = Router();

// Apply auth + admin guard to ALL routes in this file
router.use(protect, adminOnly);

// ============================================================
// USER MANAGEMENT
// ============================================================

/** GET  /api/admin/users              - List all users (paginated, searchable) */
router.get("/users", adminController.listUsers);

/** GET  /api/admin/users/:id          - Get full user detail */
router.get("/users/:id", adminController.getUserDetail);

/** PATCH /api/admin/users/:id/role    - Update user role */
router.patch("/users/:id/role", adminController.updateUserRole);

/** PATCH /api/admin/users/:id/status  - Activate/deactivate user account */
router.patch("/users/:id/status", adminController.toggleUserStatus);

// ============================================================
// QUESTION BANK CRUD
// ============================================================

/** GET    /api/admin/questions         - List all questions (filterable) */
router.get("/questions", adminController.getQuestions);

/** POST   /api/admin/questions         - Create new question */
router.post("/questions", adminController.createQuestion);

/** PUT    /api/admin/questions/:id     - Update existing question */
router.put("/questions/:id", adminController.updateQuestion);

/** DELETE /api/admin/questions/:id     - Delete question permanently */
router.delete("/questions/:id", adminController.deleteQuestion);

// ============================================================
// ROLE-SKILL MAPPING CRUD
// ============================================================

/** GET    /api/admin/role-skills       - List all role-skill mappings */
router.get("/role-skills", adminController.getRoleSkillMappings);

/** POST   /api/admin/role-skills       - Create new mapping */
router.post("/role-skills", adminController.createRoleSkillMapping);

/** PUT    /api/admin/role-skills/:id   - Update existing mapping */
router.put("/role-skills/:id", adminController.updateRoleSkillMapping);

/** DELETE /api/admin/role-skills/:id   - Delete mapping */
router.delete("/role-skills/:id", adminController.deleteRoleSkillMapping);

// ============================================================
// AGGREGATE REPORTING
// ============================================================

/** GET /api/admin/reports/aggregate   - Platform-wide aggregate stats */
router.get("/reports/aggregate", adminController.getAggregateReport);

export default router;
