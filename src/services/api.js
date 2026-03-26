import axios from 'axios';

const API_URL = 'https://web-production-91d7.up.railway.app';

// ── Base axios instance ──
const api = axios.create({ baseURL: API_URL });

// ── Attach access token to every request ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Auto-refresh on 401 ──
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

      // If the refresh endpoint itself returned 401 — full logout
      if (originalRequest.url?.includes('/api/auth/refresh')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // If another request is already refreshing — queue this one
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

        // Call refresh endpoint using plain axios (not our intercepted instance)
        const res = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        const newAccessToken = res.data.access_token;

        // Update stored token
        localStorage.setItem('token', newAccessToken);

        // Update user data if returned
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }

        // Flush the queue with new token
        processQueue(null, newAccessToken);

        // Retry original request
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
    if (res.data.access_token) {
      localStorage.setItem('token', res.data.access_token);
    }
    if (res.data.refresh_token) {
      localStorage.setItem('refresh_token', res.data.refresh_token);
    }
    if (res.data.user) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.log('Logout API error:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  logoutAll: async () => {
    try {
      await api.post('/api/auth/logout-all');
    } catch (e) {
      console.log('Logout-all error:', e);
    } finally {
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
  getBalance:      ()       => api.get('/api/account/balance'),
  getTransactions: ()       => api.get('/api/account/transactions'),
  deposit:         (data)   => api.post('/api/account/deposit', data),
  sendMoney:       (data)   => api.post('/api/account/send', data),
  changePassword:  (data)   => api.post('/api/account/change-password', data),
  changePin:       (data)   => api.post('/api/account/change-pin', data),
};

// ─────────────────────────────────────────
// BILL SERVICE
// ─────────────────────────────────────────
export const billService = {
  getProviders: ()      => api.get('/api/bills/providers'),
  payBill:      (data)  => api.post('/api/bills/pay', data),
  getHistory:   ()      => api.get('/api/bills/history'),
};

// ─────────────────────────────────────────
// KYC SERVICE
// ─────────────────────────────────────────
export const kycService = {
  getStatus:  ()           => api.get('/api/kyc/status'),
  submit:     (formData)   => api.post('/api/kyc/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ─────────────────────────────────────────
// NOTIFICATION SERVICE
// ─────────────────────────────────────────
export const notificationService = {
  getAll:      ()     => api.get('/api/notifications'),
  markRead:    (id)   => api.post(`/api/notifications/${id}/read`),
  markAllRead: ()     => api.post('/api/notifications/mark-all-read'),
  clear:       ()     => api.delete('/api/notifications/clear'),
};

// ─────────────────────────────────────────
// PREFERENCES SERVICE
// ─────────────────────────────────────────
export const preferencesService = {
  // Onboarding
  completeOnboarding:  ()      => api.post('/api/preferences/onboarding/complete'),
  getOnboardingStatus: ()      => api.get('/api/preferences/onboarding/status'),

  // Avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/api/preferences/avatar/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  removeAvatar: () => api.delete('/api/preferences/avatar/remove'),

  // Beneficiaries
  getBeneficiaries:   ()      => api.get('/api/preferences/beneficiaries'),
  saveBeneficiary:    (data)  => api.post('/api/preferences/beneficiaries', data),
  deleteBeneficiary:  (id)    => api.delete(`/api/preferences/beneficiaries/${id}`),
};

// ─────────────────────────────────────────
// ACTIVITY LOGGER
// ─────────────────────────────────────────
export const logActivity = (action, detail = '') => {
  try {
    api.post('/api/admin/log-activity', { action, detail }).catch(() => {});
  } catch (e) {
    // Silent fail — logging should never break the app
  }
};