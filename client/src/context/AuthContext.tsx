import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { Staff, LoginResponse } from '../types/auth';

interface AuthContextType {
  user: Staff | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isImpersonating: boolean;
  can: (permission: string) => boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  impersonate: (accessToken: string, staff: Staff) => Promise<void>;
  exitImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Staff | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const navigate = useNavigate();

  const can = (permission: string): boolean => {
    return permissions.includes('*') || permissions.includes(permission);
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.post('/auth/me');
        setUser(data.staff);
        setPermissions(data.permissions ?? []);
        setIsImpersonating(!!localStorage.getItem('originalToken'));
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('originalToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      identifier,
      password,
    });

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.staff);

    // Fetch permissions after login
    try {
      const { data: meData } = await api.post('/auth/me');
      setPermissions(meData.permissions ?? []);
    } catch {
      setPermissions([]);
    }

    navigate('/');
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('originalToken');
      setUser(null);
      setPermissions([]);
      setIsImpersonating(false);
      navigate('/login');
    }
  };

  const impersonate = async (accessToken: string, staff: Staff) => {
    const current = localStorage.getItem('accessToken');
    if (current) localStorage.setItem('originalToken', current);
    localStorage.setItem('accessToken', accessToken);
    setUser(staff);
    setIsImpersonating(true);
    try {
      const { data } = await api.post('/auth/me');
      setPermissions(data.permissions ?? []);
    } catch {
      setPermissions([]);
    }
    navigate('/');
  };

  const exitImpersonation = async () => {
    const original = localStorage.getItem('originalToken');
    if (!original) return;
    localStorage.setItem('accessToken', original);
    localStorage.removeItem('originalToken');
    setIsImpersonating(false);
    try {
      const { data } = await api.post('/auth/me');
      setUser(data.staff);
      setPermissions(data.permissions ?? []);
    } catch {
      setUser(null);
      setPermissions([]);
      navigate('/login');
    }
    navigate('/system-settings');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        isImpersonating,
        can,
        login,
        logout,
        impersonate,
        exitImpersonation,
      }}
    >
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