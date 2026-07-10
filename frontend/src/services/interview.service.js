import api from "./api";

const interviewService = {
  /**
   * Get supported roles, default skills, and category weights.
   */
  getRoles: async () => {
    const response = await api.get("/interview/roles");
    return response.data;
  },

  /**
   * Start a new interview session.
   * @param {object} data { role, skillStack, difficulty, timeLimitPerQuestion }
   */
  startSession: async (data) => {
    const response = await api.post("/interview/start", data);
    return response.data;
  },

  /**
   * Get details of a session (in-progress or completed).
   */
  getSession: async (id) => {
    const response = await api.get(`/interview/session/${id}`);
    return response.data;
  },

  /**
   * Submit an answer for the current question.
   * @param {string} id Session ID
   * @param {object} data { answerText, timeSpent }
   */
  submitAnswer: async (id, data) => {
    const response = await api.post(`/interview/session/${id}/answer`, data);
    return response.data;
  },

  /**
   * Complete and finalize the interview session evaluation.
   */
  completeSession: async (id) => {
    const response = await api.post(`/interview/session/${id}/complete`);
    return response.data;
  },

  /**
   * Get user's completed interview records.
   */
  getHistory: async () => {
    const response = await api.get("/interview/history");
    return response.data;
  },
};

export default interviewService;
