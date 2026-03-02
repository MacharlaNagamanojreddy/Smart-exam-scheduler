import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
};

export const studentsApi = {
  list: () => api.get("/students"),
  add: (payload) => api.post("/students/add", payload),
  remove: (studentId) => api.delete(`/students/${studentId}`),
};

export const subjectsApi = {
  list: () => api.get("/subjects"),
  add: (payload) => api.post("/subjects/add", payload),
  remove: (code) => api.delete(`/subjects/${code}`),
};

export const hallsApi = {
  list: () => api.get("/halls"),
  add: (payload) => api.post("/halls/add", payload),
  remove: (hallId) => api.delete(`/halls/${hallId}`),
};

export const scheduleApi = {
  stats: () => api.get("/schedule/stats"),
  all: () => api.get("/schedule/all"),
  generate: (payload) => api.post("/schedule/generate", payload),
};
