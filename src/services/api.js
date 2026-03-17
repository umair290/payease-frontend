import axios from 'axios';

const API_URL = 'https://web-production-91d7.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auto-attach JWT token ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Activity Logger ──
export const logActivity = async (action, detail = '') => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    await api.post('/api/admin/logs/add', { action, detail });
  } catch (e) {
    // Silent fail
  }
};

// ── Auth ──
export const authService = {
  login:          (data) => api.post('/api/auth/login', data),
  register:       (data) => api.post('/api/auth/register', data),
  initRegister:   (data) => api.post('/api/auth/register/initiate', data),
  verifyRegister: (data) => api.post('/api/auth/register/verify', data),
  resendOtp:      (data) => api.post('/api/auth/register/resend-otp', data),
};

// ── Account ──
export const accountService = {
  getBalance:      ()     => api.get('/api/account/balance'),
  deposit:         (data) => api.post('/api/account/deposit', data),
  send:            (data) => api.post('/api/account/send', data),
  getTransactions: ()     => api.get('/api/account/transactions'),
  lookupWallet:    (data) => api.post('/api/account/lookup', data),
  lookupByPhone:   (data) => api.post('/api/account/lookup-phone', data),
  updateProfile:   (data) => api.post('/api/otp/update-profile', data),
};

// ── Bills ──
export const billService = {
  getProviders: ()     => api.get('/api/bills/providers'),
  payBill:      (data) => api.post('/api/bills/pay', data),
  getHistory:   ()     => api.get('/api/bills/history'),
};

// ── Notifications ──
export const notificationService = {
  getAll:      ()    => api.get('/api/notifications/'),
  markRead:    (id)  => api.post(`/api/notifications/read/${id}`),
  markAllRead: ()    => api.post('/api/notifications/read-all'),
  clear:       ()    => api.delete('/api/notifications/clear'),
};

// ── Admin ──
export const adminService = {
  getDashboard:         ()     => api.get('/api/admin/dashboard'),
  getUsers:             ()     => api.get('/api/admin/users'),
  getTransactions:      ()     => api.get('/api/admin/transactions'),
  getPendingKyc:        ()     => api.get('/api/admin/kyc/pending'),
  getLogs:              ()     => api.get('/api/admin/logs'),
  getChangeRequests:    ()     => api.get('/api/admin/change-requests'),
  blockUser:            (data) => api.post('/api/admin/block-user', data),
  deleteUser:           (data) => api.post('/api/admin/delete-user', data),
  updateUser:           (data) => api.post('/api/admin/update-user', data),
  approveKyc:           (data) => api.post('/api/admin/kyc/approve', data),
  rejectKyc:            (data) => api.post('/api/admin/kyc/reject', data),
  approveChangeRequest: (data) => api.post('/api/admin/change-requests/approve', data),
  rejectChangeRequest:  (data) => api.post('/api/admin/change-requests/reject', data),
  submitChangeRequest:  (data) => api.post('/api/admin/change-requests/submit', data),
};

export default api;