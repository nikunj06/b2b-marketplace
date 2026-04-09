// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // Include cookies for JWT auth
});

// Note: JWT token is stored in HTTP-only cookie by backend
// Axios automatically includes cookies via withCredentials: true
// No need to manually add Authorization header
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// API ENDPOINTS GROUPED BY FEATURE
// ============================================================

const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  register: (name, email, password, role) =>
    api.post('/auth/register', { name, email, password, role }),
  logout: () => api.post('/auth/logout')
};

const productAPI = {
  list: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getAllProducts: () => api.get('/products/all'),
  getProductsByManufacturer: (manufacturerId) =>
    api.get(`/products/manufacturer/${manufacturerId}`),
  getProductById: (productId) =>
    api.get(`/products/${productId}`)
};

const variantAPI = {
  list: () => api.get('/variants'),
  listByProduct: (productId) =>
    api.get(`/variants/product/${productId}`),
  getById: (id) => api.get(`/variants/${id}`),
  getProductVariants: (productId) =>
    api.get(`/variants/product/${productId}`),
  getVariant: (variantId) =>
    api.get(`/variants/${variantId}`),
  createVariant: (productId, data) =>
    api.post(`/variants/${productId}/create`, data),
  updateVariant: (variantId, data) =>
    api.put(`/variants/${variantId}`, data),
  deleteVariant: (variantId) =>
    api.delete(`/variants/${variantId}`),
  searchVariants: (params) =>
    api.get('/variants/public/search', { params })
};

const rfqAPI = {
  create: (data) => api.post('/rfq', data),
  list: () => api.get('/rfq'),
  getById: (id) => api.get(`/rfq/${id}`),
  submitResponse: (rfqId, data) =>
    api.post(`/rfq/${rfqId}/respond`, data),
  createRFQ: (data) =>
    api.post('/rfq/create', data),
  getMyRFQs: () =>
    api.get('/rfq/buyer/mine'),
  getPendingRFQs: () =>
    api.get('/rfq/manufacturer/pending'),
  getRFQDetail: (rfqId) =>
    api.get(`/rfq/${rfqId}`),
  respondToRFQ: (rfqId, data) =>
    api.post(`/rfq/${rfqId}/respond`, data),
  getRFQResponses: (rfqId) =>
    api.get(`/rfq/${rfqId}/responses`),
  updateRFQStatus: (rfqId, status) =>
    api.patch(`/rfq/${rfqId}/status`, { status })
};

const orderAPI = {
  list: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getOrders: () => api.get('/orders'),
  getOrderDetail: (orderId) =>
    api.get(`/orders/${orderId}`),
  getOrderHistory: (orderId) =>
    api.get(`/order-status/${orderId}/history`),
  getOrderStatus: (orderId) =>
    api.get(`/order-status/${orderId}`),
  updateOrderStatus: (orderId, status, notes) =>
    api.patch(`/order-status/${orderId}/status`, { status, notes })
};

// Export endpoints grouped by feature
export {
  authAPI,
  productAPI,
  variantAPI,
  rfqAPI,
  orderAPI
};

// Export grouped API object with different name to avoid conflict
export const apiEndpoints = {
  authAPI,
  productAPI,
  variantAPI,
  rfqAPI,
  orderAPI
};

// Export axios instance as default and api shorthand
export { api };
export default api;
