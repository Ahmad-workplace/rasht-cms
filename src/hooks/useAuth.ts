import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login, UserProfile } from '@/types/api';
import { login, logout, getUserProfile } from '@/lib/api';
import { isAuthenticated, getCurrentUserId } from '@/lib/auth';
import { useUserStore } from '@/stores/userStore';
import { obtainTokenPair } from '@/lib/api/endpoints/tokens';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { user, setUser, clearUser } = useUserStore();
  
  // Load user on mount if authenticated
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated() && !user) {
        try {
          const userId = getCurrentUserId();
          if (!userId) {
            throw new Error('No user ID found');
          }
          
          const userProfile = await getUserProfile(userId);
          setUser(userProfile);
        } catch (err) {
          console.error('Failed to load user:', err);
          setError('Failed to load user profile');
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, [user, setUser]);
  
  // Login function
  const handleLogin = useCallback(async (credentials: Login) => {
    setLoading(true);
    setError(null);
    
    try {
      await obtainTokenPair(credentials);
      
      // After login, fetch user profile using stored user ID
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('No user ID found after login');
      }
      
      const userProfile = await getUserProfile(userId);
      setUser(userProfile);
      
      navigate('/dashboard');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials');
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate, setUser]);
  
  // Logout function
  const handleLogout = useCallback(async () => {
    setLoading(true);
    
    try {
      await logout();
      clearUser();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    } finally {
      setLoading(false);
    }
  }, [navigate, clearUser]);
  
  return {
    isAuthenticated: isAuthenticated(),
    user,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout
  };
};