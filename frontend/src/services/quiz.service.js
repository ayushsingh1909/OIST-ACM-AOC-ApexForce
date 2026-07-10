import api from "./api";

export const quizService = {
  startQuiz: async () => {
    const response = await api.post("/quiz/start");
    return response.data;
  },

  getAttempt: async (attemptId) => {
    const response = await api.get(`/quiz/${attemptId}`);
    return response.data;
  },

  saveAnswer: async (attemptId, payload) => {
    const response = await api.patch(`/quiz/${attemptId}/answer`, payload);
    return response.data;
  },

  submitQuiz: async (attemptId) => {
    const response = await api.post(`/quiz/${attemptId}/submit`);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get("/quiz/history");
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/quiz/stats");
    return response.data;
  },
};
