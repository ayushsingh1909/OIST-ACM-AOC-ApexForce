/**
 * Career Intelligence Frontend Service — Module 7
 *
 * Wraps all /api/career-intelligence/* API calls using the shared Axios instance.
 * All calls automatically include the Bearer token via the request interceptor in api.js.
 */

import api from "./api";

/**
 * Compute career intelligence scores for a session.
 *
 * @param {object} sessionData - Raw session inputs (scores, topics, CCI components)
 * @returns {Promise<object>} Computed scores, breakdowns, and cross-analysis results
 */
export const computeCareerScores = async (sessionData) => {
  const response = await api.post("/career-intelligence/compute", sessionData);
  return response.data;
};

/**
 * Fetch historical score trend data for the logged-in user.
 *
 * @param {number} limit - Max number of records to return (default 20)
 * @returns {Promise<object>} { trend: [...], meta: { totalRecords, improvementPercentage } }
 */
export const getGrowthTrend = async (limit = 20) => {
  const response = await api.get(`/career-intelligence/growth-trend?limit=${limit}`);
  return response.data;
};

/**
 * Fetch the career readiness summary (latest scores + flagged topics).
 *
 * @returns {Promise<object>} { hasData, scores, flaggedTopics, adaptiveFeedbackTriggered }
 */
export const getCareerSummary = async () => {
  const response = await api.get("/career-intelligence/summary");
  return response.data;
};
