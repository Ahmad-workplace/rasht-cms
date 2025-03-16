import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { getAuthToken, refreshToken, clearAuthTokens } from '@/lib/auth';

// API configuration
const API_URL = 'http://192.168.100.23:8003/api/v1';
export const BASE_URL = 'http://192.168.100.23:8003/';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  
  failedQueue = [];
};

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Accept-Language'] = 'fa'
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // If refresh token request fails with 401, clear tokens and redirect to login
      if (originalRequest.url?.includes('/users/refresh/')) {
        clearAuthTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        if (isRefreshing) {
          try {
            const token = await new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await refreshToken();
          const newToken = getAuthToken();
          
          if (!newToken) {
            throw new Error('No token received after refresh');
          }

          // Update the authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          // Process any requests that were waiting for the token refresh
          processQueue(null, newToken);
          
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens and reject all queued requests
          clearAuthTokens();
          processQueue(refreshError, null);
          
          // Redirect to login page
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;