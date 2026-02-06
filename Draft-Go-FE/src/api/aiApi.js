import axios from "axios";

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:8000";

const aiInstance = axios.create({
  baseURL: AI_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Health Check
export const checkAiHealth = async () => {
  const response = await aiInstance.get("/health");
  return response.data;
};

// 2. Draft Analysis
export const analyzeDraft = async (draftData) => {
  const response = await aiInstance.post("/analyze", draftData);
  return response.data;
};
