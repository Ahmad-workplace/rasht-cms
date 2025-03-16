import apiClient from '@/lib/api/client';
import { setAuthTokens, clearAuthTokens, setCurrentUserId } from '@/lib/auth';
import { Login } from '@/types/api';
import { jwtDecode } from 'jwt-decode';

export interface TokenObtainPair {
  access: string;
  refresh: string;
}

export interface TokenRefresh {
  access: string;
}

interface JwtPayload {
  user_id: string;
  exp: number;
}

/**
 * Extract user ID from JWT token
 */
const extractUserIdFromToken = (token: string): string => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.user_id;
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    throw new Error('Invalid token format');
  }
};

/**
 * Obtain token pair (access and refresh tokens)
 */
export const obtainTokenPair = async (credentials: Login): Promise<TokenObtainPair> => {
  const response = await apiClient.post<TokenObtainPair>('/token/', credentials);
  
  // Store tokens
  setAuthTokens(response.data.access, response.data.refresh);
  
  // Extract and store user ID from access token
  const userId = extractUserIdFromToken(response.data.access);
  setCurrentUserId(userId);
  
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<TokenRefresh> => {
  const response = await apiClient.post<TokenRefresh>('/token/refresh/', { refresh: refreshToken });
  
  // Update the access token in storage
  setAuthTokens(response.data.access, refreshToken);
  
  return response.data;
};

/**
 * Clear tokens (logout)
 */
export const clearTokens = (): void => {
  clearAuthTokens();
};