import axios from 'axios';
import { getSession, signIn } from 'next-auth/react';
import { authService } from '@/app/service/api/auth';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Axios instance WITH token (for authenticated APIs)
const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios instance WITHOUT token (for public APIs like login, register, etc.)
export const axiosPublicInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh handling
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor (only for private instance)
axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (only for private instance)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if backend explicitly indicates token expiration
      const isTokenExpired = 
        error.response?.data?.message?.toLowerCase().includes('expired') || 
        error.response?.data?.message?.toLowerCase().includes('invalid token') ||
        error.response?.data?.message?.toLowerCase().includes('unauthorized');
      
      // If backend explicitly reports expired tokens, clear session immediately
      if (isTokenExpired) {
        console.log('Backend reported expired/invalid token. Clearing session immediately...');
        try {
          const { signOut } = require('next-auth/react');
          await signOut({ redirect: false });
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          return Promise.reject(error);
        } catch (signOutError) {
          console.error('Error clearing session:', signOutError);
        }
      }
      
      // Token refresh flow - only if not already refreshing
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const session = await getSession();
        const refreshToken = session?.user?.refreshToken;
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Use the authService to refresh token
        const response = await authService.refreshToken(refreshToken);

        // Unwrap the response based on your API structure
        const accessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        if (!accessToken || !newRefreshToken) {
          throw new Error('Invalid refresh token response');
        }

        // Update NextAuth session with the new tokens
        await signIn('credentials', {
          redirect: false,
          accessToken: accessToken,
          refreshToken: newRefreshToken,
          user: JSON.stringify(session?.user),
        });

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        
        // Handle refresh token expiration or other authentication errors
        // Clear all session cookies by using the signOut function
        try {
          // Import directly from next-auth/react to avoid dynamic import issues
          const { signOut } = require('next-auth/react');
          await signOut({ redirect: false });
          console.log('Session cleared due to refresh token failure');
        } catch (signOutError) {
          console.error('Error clearing session:', signOutError);
        }
        
        // Redirect to login page after token refresh failure
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
