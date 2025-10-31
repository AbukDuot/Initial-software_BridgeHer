import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production'
    ? 'https://bridgeher-backend.onrender.com'
    : 'http://localhost:5000');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  },
  USERS: `${API_BASE_URL}/api/users`,
  COURSES: `${API_BASE_URL}/api/courses`,
  MENTORS: `${API_BASE_URL}/api/mentors`,
  MENTORSHIP: `${API_BASE_URL}/api/mentorship`,
  COMMUNITY: `${API_BASE_URL}/api/community`,
  DASHBOARDS: {
    LEARNER: `${API_BASE_URL}/api/dashboards/learner`,
    MENTOR: `${API_BASE_URL}/api/dashboards/mentor`,
    ADMIN: `${API_BASE_URL}/api/dashboards/admin`,
  },
  PROFILE: `${API_BASE_URL}/api/profile`,
  SETTINGS: `${API_BASE_URL}/api/settings`,
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  ASSIGNMENTS: `${API_BASE_URL}/api/assignments`,
  QUIZZES: `${API_BASE_URL}/api/quizzes`,
  MODULES: `${API_BASE_URL}/api/modules`,
  ADMIN: `${API_BASE_URL}/api/admin`,
};
