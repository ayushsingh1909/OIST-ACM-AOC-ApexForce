import api from "./api";

export const resumeService = {
  upload: async (formData) => {
    const response = await api.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  uploadText: async (resumeText, targetRole) => {
    const response = await api.post("/resume/upload", { resumeText, targetRole });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get("/resume/history");
    return response.data;
  },
};
