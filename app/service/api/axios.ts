import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { authService } from './auth';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're refreshing the token to avoid multiple refresh requests
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue: any[] = [];

// Process the failed queue when token is refreshed
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, add this request to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const session = await getSession();
        
        if (!session?.user?.refreshToken) {
          // No refresh token available, logout user
          await signOut({ redirect: false });
          return Promise.reject(error);
        }
        
        // Attempt to refresh the token
        const response = await authService.refreshToken(session.user.refreshToken);
        
        if (!response || !response.data || !response.data.access_token) {
          // Invalid response, logout user
          await signOut({ redirect: false });
          return Promise.reject(error);
        }
        
        const { access_token, refresh_token } = response.data;
        
        // Update session with new tokens (this would typically be handled by next-auth)
        // In a real implementation, you'd need to update the session in next-auth
        // For now, we'll just update the request headers
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        
        // Process any queued requests
        processQueue(null, access_token);
        
        isRefreshing = false;
        
        // Retry the original request with new token
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        isRefreshing = false;
        // Only logout on genuine auth failures, not network timeouts
        const isTimeout = refreshError?.code === 'ECONNABORTED' || refreshError?.message?.includes('timeout');
        if (!isTimeout) {
          await signOut({ redirect: false });
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
