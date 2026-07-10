import api from "./api";

export const assignmentService = {
  list: async () => {
    const response = await api.get("/assignments");
    return response.data;
  },

  submit: async (assignmentId, formData) => {
    const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getSubmission: async (submissionId) => {
    const response = await api.get(`/assignments/submissions/${submissionId}`);
    return response.data;
  },
};
