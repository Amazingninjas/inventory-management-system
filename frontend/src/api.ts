import axios from 'axios';
import { Product, Order } from './types';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the API URL on initialization (helpful for debugging)
console.log(`🔌 API Client connected to: ${API_BASE_URL}`);

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
  create: (order: { type: 'production' | 'fulfillment'; inputs: { productId: number; quantity: number }[]; notes?: string }) =>
    api.post<Order>('/orders', order),
  complete: (id: number) => api.put(`/orders/${id}/complete`),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

export default api;
