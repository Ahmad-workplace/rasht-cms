import {
  Login,
  Register,
  UserProfile,
  ChangePassword,
  ForgetPassword,
  OTP,
  ResendOTP,
  LogOut,
  TokenRefresh,
} from "@/types/api";
import apiClient from "@/lib/api/client";
import { setAuthTokens, clearAuthTokens, setCurrentUserId } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";

export interface LoginResponse {
  access: string;
  refresh: string;
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
    console.error("Failed to decode JWT token:", error);
    throw new Error("Invalid token format");
  }
};

/**
 * User login
 */
export const login = async (credentials: Login): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    "/users/login/",
    credentials
  );

  // Store tokens
  setAuthTokens(response.data.access, response.data.refresh);

  // Extract and store user ID from access token
  const userId = extractUserIdFromToken(response.data.access);
  setCurrentUserId(userId);

  return response.data;
};

/**
 * User registration
 */
export const register = async (userData: Register): Promise<void> => {
  await apiClient.post("/users/register/", userData);
};

/**
 * User logout
 */
export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (refreshToken) {
    try {
      await apiClient.post("/users/logout/", { refresh: refreshToken });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  clearAuthTokens();
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  // const response = await apiClient.get<UserProfile>(`/users/profile/${userId}/`);
  // return response.data;
  return {
    id: "tohid",
    first_name: "tohid",
    last_name: "tohid",
    username: "tohid",
  };
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>(
    `/users/profile/${userId}/`,
    profileData
  );
  return response.data;
};

/**
 * Change password
 */
export const changePassword = async (
  passwordData: ChangePassword
): Promise<void> => {
  await apiClient.post("/users/change_password/", passwordData);
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (data: ResendOTP): Promise<void> => {
  await apiClient.post("/users/forget_password/", data);
};

/**
 * Reset password with code
 */
export const resetPassword = async (data: ForgetPassword): Promise<void> => {
  await apiClient.post("/users/reset_password/", data);
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (data: OTP): Promise<void> => {
  await apiClient.post("/users/verify_code/", data);
};

/**
 * Resend OTP code
 */
export const resendOTP = async (data: ResendOTP): Promise<void> => {
  await apiClient.post("/users/resend_code/", data);
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<TokenRefresh> => {
  const response = await apiClient.post<TokenRefresh>("/users/refresh/", {
    refresh: refreshToken,
  });
  return response.data;
};
