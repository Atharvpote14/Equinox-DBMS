import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/client';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('equinox_token') || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('command-center');
  const [refreshTimer, setRefreshTimer] = useState(null);
  const [paymentLocked, setPaymentLocked] = useState(false);

  const loadDashboard = useCallback(async (options = {}) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await authApi.bootstrap();
      if (response.success) {
        setData(response);
        if (!options.silent) {
          console.log('Dashboard loaded');
        }
      } else {
        if (!options.silent) {
          console.error('Dashboard load failed:', response.error);
        }
        logout();
      }
    } catch (error) {
      if (!options.silent) {
        console.error('Dashboard error:', error);
      }
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  const startAutoRefresh = useCallback(() => {
    if (refreshTimer) clearInterval(refreshTimer);
    const timer = setInterval(() => {
      loadDashboard({ silent: true });
    }, 30000);
    setRefreshTimer(timer);
  }, [refreshTimer, loadDashboard]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      setRefreshTimer(null);
    }
  }, [refreshTimer]);

  const login = useCallback(async (email, password) => {
    const response = await authApi.login({ email, password });
    if (!response.success) {
      throw new Error(response.error || 'Login failed');
    }
    setToken(response.token);
    localStorage.setItem('equinox_token', response.token);
    await loadDashboard();
  }, [loadDashboard]);

  const register = useCallback(async (formData) => {
    const response = await authApi.register(formData);
    if (!response.success) {
      throw new Error(response.error || 'Registration failed');
    }
    return response;
  }, []);

  const logout = useCallback(() => {
    stopAutoRefresh();
    setData(null);
    setToken('');
    setActiveSection('command-center');
    setPaymentLocked(false);
    localStorage.removeItem('equinox_token');
  }, [stopAutoRefresh]);

  const switchSection = useCallback((sectionId) => {
    setActiveSection(sectionId);
  }, []);

  useEffect(() => {
    if (token) {
      loadDashboard();
    }
    return () => stopAutoRefresh();
  }, [token, loadDashboard, stopAutoRefresh]);

  const value = {
    token,
    data,
    loading,
    activeSection,
    paymentLocked,
    setPaymentLocked,
    login,
    register,
    logout,
    switchSection,
    loadDashboard,
    startAutoRefresh,
    stopAutoRefresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}