import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and rate limiting
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000; // Default 5 seconds
      
      // If this request hasn't been retried yet, wait and retry
      if (!originalRequest._retry429) {
        originalRequest._retry429 = true;
        
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(api(originalRequest));
          }, delay);
        });
      }
      
      // If already retried, reject with a user-friendly message
      return Promise.reject({
        ...error,
        message: 'Too many requests. Please wait a moment before trying again.',
      });
    }

    // Handle 403 Forbidden - Insufficient Permissions
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || 'Access denied. Insufficient permissions';
      
      // Show user-friendly error message
      console.error('Permission denied:', errorMessage);
      
      // Don't redirect on auth endpoints or if already on login page
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      const isLoginPage = window.location.pathname === '/login';
      
      if (!isAuthEndpoint && !isLoginPage) {
        // Store the error message for display
        const permissionError = {
          message: errorMessage,
          path: window.location.pathname,
          timestamp: Date.now()
        };
        sessionStorage.setItem('permissionError', JSON.stringify(permissionError));
        
        // Optionally show a notification (you can integrate with a notification system)
        // For now, we'll just enhance the error message
      }
      
      return Promise.reject({
        ...error,
        message: errorMessage,
        isPermissionError: true
      });
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh-token', {
            refreshToken,
          });
          const { token } = response.data.data;
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

