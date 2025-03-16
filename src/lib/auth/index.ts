import { TokenRefresh } from '@/types/api';
import axiosInstance from '@/lib/api/client';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_ID_KEY = 'current_user_id';

/**
 * Get the current auth token from storage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get the current refresh token from storage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Get the current user ID from storage
 */
export const getCurrentUserId = (): string | null => {
  return localStorage.getItem(CURRENT_USER_ID_KEY);
};

/**
 * Set auth tokens in storage
 */
export const setAuthTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Set current user ID in storage
 */
export const setCurrentUserId = (userId: string): void => {
  localStorage.setItem(CURRENT_USER_ID_KEY, userId);
};

/**
 * Clear auth tokens from storage
 */
export const clearAuthTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_ID_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Refresh the access token using the refresh token
 */
export const refreshToken = async (): Promise<void> => {
  const currentRefreshToken = getRefreshToken();
  
  if (!currentRefreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    // Create a new axios instance to avoid interceptors loop
    const response = await axiosInstance.post<TokenRefresh>('/users/refresh/', {
      refresh: currentRefreshToken
    });
    
    if (response.data.access) {
      // Update only the access token
      localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access);
    } else {
      throw new Error('No access token in response');
    }
  } catch (error) {
    clearAuthTokens();
    throw error;
  }
};