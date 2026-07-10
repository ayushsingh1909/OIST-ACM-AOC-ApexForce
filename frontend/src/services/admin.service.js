/**
 * Admin Frontend Service — Module 8
 *
 * Wraps all /api/admin/* API calls using the shared Axios instance.
 * All calls automatically include the Bearer token and require admin role.
 */

import api from "./api";

// ============================================================
// USER MANAGEMENT
// ============================================================

/**
 * List all users with optional filters.
 * @param {object} params - { page, limit, search, role, status }
 */
export const listUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

/**
 * Get full detail for a specific user.
 * @param {string} userId
 */
export const getUserDetail = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Update a user's role.
 * @param {string} userId
 * @param {string} role - "student" | "admin" | "judge"
 */
export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Toggle a user's active/inactive status.
 * @param {string} userId
 * @param {boolean} isActive
 */
export const toggleUserStatus = async (userId, isActive) => {
  const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
  return response.data;
};

// ============================================================
// QUESTION BANK CRUD
// ============================================================

/**
 * List all questions with optional filters.
 * @param {object} params - { type, topic, role, difficulty, page, limit }
 */
export const listQuestions = async (params = {}) => {
  const response = await api.get("/admin/questions", { params });
  return response.data;
};

/**
 * Create a new question.
 * @param {object} questionData
 */
export const createQuestion = async (questionData) => {
  const response = await api.post("/admin/questions", questionData);
  return response.data;
};

/**
 * Update an existing question.
 * @param {string} questionId
 * @param {object} updates
 */
export const updateQuestion = async (questionId, updates) => {
  const response = await api.put(`/admin/questions/${questionId}`, updates);
  return response.data;
};

/**
 * Delete a question permanently.
 * @param {string} questionId
 */
export const deleteQuestion = async (questionId) => {
  const response = await api.delete(`/admin/questions/${questionId}`);
  return response.data;
};

// ============================================================
// ROLE-SKILL MAPPINGS CRUD
// ============================================================

/**
 * List all role-skill mappings.
 */
export const listRoleSkillMappings = async () => {
  const response = await api.get("/admin/role-skills");
  return response.data;
};

/**
 * Create a new role-skill mapping.
 * @param {object} mappingData - { role, skills[], topics[], description }
 */
export const createRoleSkillMapping = async (mappingData) => {
  const response = await api.post("/admin/role-skills", mappingData);
  return response.data;
};

/**
 * Update an existing role-skill mapping.
 * @param {string} mappingId
 * @param {object} updates
 */
export const updateRoleSkillMapping = async (mappingId, updates) => {
  const response = await api.put(`/admin/role-skills/${mappingId}`, updates);
  return response.data;
};

/**
 * Delete a role-skill mapping.
 * @param {string} mappingId
 */
export const deleteRoleSkillMapping = async (mappingId) => {
  const response = await api.delete(`/admin/role-skills/${mappingId}`);
  return response.data;
};

// ============================================================
// AGGREGATE REPORTING
// ============================================================

/**
 * Fetch platform-wide aggregate report for the admin dashboard.
 */
export const getAggregateReport = async () => {
  const response = await api.get("/admin/reports/aggregate");
  return response.data;
};
