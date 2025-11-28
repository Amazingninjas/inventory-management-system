import axios from 'axios';
import { Product, Order, AuthResponse, User } from './types';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token storage
const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (unauthorized) by clearing token and redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.remove();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Log the API URL on initialization (helpful for debugging)
console.log(`🔌 API Client connected to: ${API_BASE_URL}`);

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  checkSession: () => api.get<{ user: User }>('/auth/session'),
};

// Product API
export const productAPI = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  search: (query: string) => api.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`),
  create: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Product>('/products', product),
  update: (id: number, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) =>
    api.put<Product>(`/products/${id}`, product),
  delete: (id: number) => api.delete(`/products/${id}`),
};

// Order API
export const orderAPI = {
  getAll: () => api.get<Order[]>('/orders'),
  getById: (id: number) => api.get<Order>(`/orders/${id}`),
  create: (order: {
    orderType: 'purchase' | 'production' | 'fulfillment' | 'r&d' | 'maintenance' | 'sales' | 'shipping';
    inputs: { productId: number; quantity: number }[];
    outputs: { productId: number; quantity: number }[];
    notes?: string;
    stockPartsCost?: number;
    travelCost?: number;
    carrierCost?: number;
    laborCost?: number;
  }) => api.post<Order>('/orders', order),
  complete: (id: number) => api.put(`/orders/${id}/complete`),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

export default api;
