import axios from "axios";

const normalizeBaseUrl = (value) => (value || "").trim().replace(/\/+$/, "");

const getBaseUrl = () => {
  const envBaseUrl = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocalHost = host === "localhost" || host === "127.0.0.1";
    if (!isLocalHost) {
      // Safe production fallback when env vars are missing during frontend build.
      return "https://shecare-ai.onrender.com";
    }
  }

  return "http://localhost:8000";
};

const BASE_URL = getBaseUrl();

// Create an axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Set JWT token in headers
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Signup
export const signupUser = async (userData) => {
  const response = await api.post("/auth/signup", userData);
  return response.data;
};

// Login
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data; // { access_token, token_type }
};

// Get current user profile
export const getProfile = async () => {
  const token = localStorage.getItem("shecare_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await api.get("/profile", { headers });
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    // Fallback for deployments that expose the profile at /auth/me.
    if (status === 404 || status === 405) {
      const fallbackResponse = await api.get("/auth/me", { headers });
      return fallbackResponse.data;
    }
    throw error;
  }
};

// PCOS Checker
export const checkPCOS = async (data) => {
  const token = localStorage.getItem("shecare_token");
  const response = await api.post("/pcos-checker", data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

// Cycle Tracker
export const createCycleEntry = async (data) => {
  const token = localStorage.getItem("shecare_token");
  const response = await api.post("/cycle-tracker", data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

export const getCycleHistory = async () => {
  const token = localStorage.getItem("shecare_token");
  const response = await api.get("/cycle-tracker", {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

// Journal
export const createJournalEntry = async (data) => {
  const token = localStorage.getItem("shecare_token");
  const response = await api.post("/journal", data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

export const getJournalEntries = async () => {
  const token = localStorage.getItem("shecare_token");
  const response = await api.get("/journal", {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

// Recommendations
export const getRecommendations = async () => {
  const token = localStorage.getItem("shecare_token");
  const response = await api.get("/recommendations", {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

// Forgot Password
export const forgotPassword = async ({ email }) => {
  // Adjust endpoint as per backend implementation
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const get = (url, config) => api.get(url, config);
export const post = (url, data, config) => api.post(url, data, config);
export const put = (url, data, config) => api.put(url, data, config);
export const del = (url, config) => api.delete(url, config);