import api from "./api";

export const dashboardService = {
  getDashboard: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },

  getMasteryMatrix: async () => {
    const response = await api.get("/dashboard/mastery");
    return response.data;
  },
};
