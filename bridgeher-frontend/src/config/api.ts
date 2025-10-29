export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? 'https://bridgeher-backend.onrender.com'
    : 'http://localhost:5000');

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
  },
  USERS: `${API_BASE_URL}/api/users`,
  COURSES: `${API_BASE_URL}/api/courses`,
  MENTORS: `${API_BASE_URL}/api/mentors`,
};
