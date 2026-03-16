import axios from 'axios';

const API_URL = 'https://web-production-91d7.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

export const accountService = {
  getBalance: () => api.get('/api/account/balance'),
  deposit: (data) => api.post('/api/account/deposit', data),
  send: (data) => api.post('/api/account/send', data),
  getTransactions: () => api.get('/api/account/transactions'),
  lookupWallet: (data) => api.post('/api/account/lookup', data),
  lookupByPhone: (data) => api.post('/api/account/lookup-phone', data),
};

export const billService = {
  getProviders: () => api.get('/api/bills/providers'),
  payBill: (data) => api.post('/api/bills/pay', data),
  getHistory: () => api.get('/api/bills/history'),
};

export default api;
export const notificationService = {
  getAll: () => api.get('/api/notifications/'),
  markRead: (id) => api.post(`/api/notifications/read/${id}`),
  markAllRead: () => api.post('/api/notifications/read-all'),
  clear: () => api.delete('/api/notifications/clear'),
};