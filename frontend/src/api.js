import axios from "axios";

// Use environment variable for backend base URL
const BASE_URL = "http://localhost:8000";

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
  const response = await api.post("/signup", userData);
  return response.data;
};

// Login
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data; // { access_token, token_type }
};

// Get current user profile
export const getProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

// PCOS Checker
export const checkPCOS = async (data) => {
  const response = await api.post("/check_pcos", data);
  return response.data;
};

// Cycle Tracker
export const createCycleEntry = async (data) => {
  const response = await api.post("/cycle", data);
  return response.data;
};

export const getCycleHistory = async () => {
  const response = await api.get("/cycle");
  return response.data;
};

// Journal
export const createJournalEntry = async (data) => {
  const response = await api.post("/journal", data);
  return response.data;
};

export const getJournalEntries = async () => {
  const response = await api.get("/journal");
  return response.data;
};

// Recommendations
export const getRecommendations = async () => {
  const response = await api.get("/recommendations");
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