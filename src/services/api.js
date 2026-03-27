import axios from 'axios';

const API_URL = 'https://web-production-91d7.up.railway.app';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else       prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (originalRequest.url?.includes('/api/auth/refresh')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(newToken => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const res = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        const newAccessToken = res.data.access_token;
        localStorage.setItem('token', newAccessToken);
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ─────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────
export const authService = {
  login: async (credentials) => {
    const res = await api.post('/api/auth/login', credentials);
    if (res.data.access_token)  localStorage.setItem('token',         res.data.access_token);
    if (res.data.refresh_token) localStorage.setItem('refresh_token', res.data.refresh_token);
    if (res.data.user)          localStorage.setItem('user',          JSON.stringify(res.data.user));
    return res;
  },

  logout: async () => {
    try { await api.post('/api/auth/logout'); }
    catch (e) { console.log('Logout API error:', e); }
    finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  logoutAll: async () => {
    try { await api.post('/api/auth/logout-all'); }
    catch (e) { console.log('Logout-all error:', e); }
    finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },
};

// ─────────────────────────────────────────
// ACCOUNT SERVICE
// ─────────────────────────────────────────
export const accountService = {
  getBalance: () => api.get('/api/account/balance'),

  // ── Paginated transactions ──
  // page: page number (default 1)
  // perPage: items per page (default 20, max 100)
  // filters: { type: 'transfer'|'deposit'|'bill', direction: 'credit'|'debit' }
  getTransactions: (page = 1, perPage = 20, filters = {}) => {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (filters.type)      params.append('type',      filters.type);
    if (filters.direction) params.append('direction', filters.direction);
    return api.get(`/api/account/transactions?${params.toString()}`);
  },

  // Convenience shortcut — load all (for PDF export / charts)
  getAllTransactions: () =>
    api.get('/api/account/transactions?per_page=100&page=1'),

  deposit:    (data) => api.post('/api/account/deposit', data),
  sendMoney:  (data) => api.post('/api/account/send',    data),
  lookupWallet: (wallet_number) => api.post('/api/account/lookup',       { wallet_number }),
  lookupPhone:  (phone)         => api.post('/api/account/lookup-phone', { phone }),
};

// ─────────────────────────────────────────
// BILL SERVICE
// ─────────────────────────────────────────
export const billService = {
  getProviders: ()     => api.get('/api/bills/providers'),
  payBill:      (data) => api.post('/api/bills/pay',     data),
  getHistory:   ()     => api.get('/api/bills/history'),
};

// ─────────────────────────────────────────
// KYC SERVICE
// ─────────────────────────────────────────
export const kycService = {
  getStatus: ()         => api.get('/api/kyc/status'),
  submit:    (formData) => api.post('/api/kyc/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ─────────────────────────────────────────
// NOTIFICATION SERVICE
// ─────────────────────────────────────────
export const notificationService = {
  getAll:      ()    => api.get('/api/notifications'),
  markRead:    (id)  => api.post(`/api/notifications/${id}/read`),
  markAllRead: ()    => api.post('/api/notifications/mark-all-read'),
  clear:       ()    => api.delete('/api/notifications/clear'),
};

// ─────────────────────────────────────────
// PREFERENCES SERVICE
// ─────────────────────────────────────────
export const preferencesService = {
  completeOnboarding:  ()     => api.post('/api/preferences/onboarding/complete'),
  getOnboardingStatus: ()     => api.get('/api/preferences/onboarding/status'),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/api/preferences/avatar/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  removeAvatar: () => api.delete('/api/preferences/avatar/remove'),

  getBeneficiaries:  ()     => api.get('/api/preferences/beneficiaries'),
  saveBeneficiary:   (data) => api.post('/api/preferences/beneficiaries', data),
  deleteBeneficiary: (id)   => api.delete(`/api/preferences/beneficiaries/${id}`),
};

// ─────────────────────────────────────────
// ADMIN SERVICE
// ─────────────────────────────────────────
export const adminService = {
  getDashboard:    ()     => api.get('/api/admin/dashboard'),
  getUsers:        ()     => api.get('/api/admin/users'),
  blockUser:       (data) => api.post('/api/admin/block-user',   data),
  deleteUser:      (data) => api.post('/api/admin/delete-user',  data),
  updateUser:      (data) => api.post('/api/admin/update-user',  data),
  getPendingKYC:   ()     => api.get('/api/admin/kyc/pending'),
  approveKYC:      (data) => api.post('/api/admin/kyc/approve',  data),
  rejectKYC:       (data) => api.post('/api/admin/kyc/reject',   data),
  getTransactions: ()     => api.get('/api/admin/transactions'),
  getLogs:         (params = {}) => {
    const p = new URLSearchParams(params);
    return api.get(`/api/admin/logs?${p.toString()}`);
  },
  getChangeRequests:    ()     => api.get('/api/admin/change-requests'),
  approveChangeRequest: (data) => api.post('/api/admin/change-requests/approve', data),
  rejectChangeRequest:  (data) => api.post('/api/admin/change-requests/reject',  data),
};

// ─────────────────────────────────────────
// ACTIVITY LOGGER
// ─────────────────────────────────────────
export const logActivity = (action, detail = '') => {
  try {
    api.post('/api/admin/logs/add', { action, detail }).catch(() => {});
  } catch (e) {
    // Silent fail
  }
};