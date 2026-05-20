import axios from 'axios';

// Use current hostname for API (works on localhost and when accessed via IP)
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh for auth endpoints - let the error propagate
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                           originalRequest.url?.includes('/auth/refresh');

    // If 401, not an auth endpoint, and we haven't already retried
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      // While impersonating, the stored refresh token belongs to the original
      // (super admin) user. Refreshing would silently swap the impersonation
      // token for a super admin token and the impersonated session would
      // appear to have super admin permissions. Don't refresh — propagate.
      //NOTE: This change fixed impersonation
      if (localStorage.getItem('originalToken')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Call refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Only clear tokens when the server actually rejected us. A network
        // failure during refresh (no response received) is transient — keep
        // the session so the user can stay in the app while offline.
        const isTransport = !(refreshError as { response?: unknown })?.response;
        if (!isTransport) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('cachedUser');
          localStorage.removeItem('cachedPermissions');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;