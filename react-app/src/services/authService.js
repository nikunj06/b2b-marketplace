// services/authService.js
import { authAPI } from './api';

export const authService = {
  login: async (email, password) => {
    // Backend returns token in HTTP-only cookie, not in response body
    // Axios interceptor handles cookie via withCredentials: true
    const response = await authAPI.login(email, password);
    return response;
  },

  register: async (userData) => {
    // Backend returns token in HTTP-only cookie after successful registration
    const response = await authAPI.register(
      userData.name,
      userData.email,
      userData.password,
      userData.role
    );
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    // Check if user data exists (token is in HTTP-only cookie)
    return !!localStorage.getItem('user');
  },

  getToken: () => {
    // Token is stored in HTTP-only cookie, not localStorage
    // Axios interceptor automatically includes cookies via withCredentials: true
    return null; // Return null as token is managed by browser cookies
  }
};

export default authService;
