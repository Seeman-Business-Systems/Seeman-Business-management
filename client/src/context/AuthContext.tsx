import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { Staff, LoginResponse } from '../types/auth';
import { prefetchOfflineData } from '../lib/offline/prefetch';

const CACHED_USER_KEY = 'cachedUser';
const CACHED_PERMISSIONS_KEY = 'cachedPermissions';

function readCachedUser(): Staff | null {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? (JSON.parse(raw) as Staff) : null;
  } catch {
    return null;
  }
}

function readCachedPermissions(): string[] {
  try {
    const raw = localStorage.getItem(CACHED_PERMISSIONS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeAuthCache(user: Staff | null, permissions: string[]) {
  if (user) {
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
    localStorage.setItem(CACHED_PERMISSIONS_KEY, JSON.stringify(permissions));
  } else {
    localStorage.removeItem(CACHED_USER_KEY);
    localStorage.removeItem(CACHED_PERMISSIONS_KEY);
  }
}

function isTransportError(err: unknown): boolean {
  // axios: no response received = transport-level (network down, CORS preflight, etc.)
  return Boolean(err && typeof err === 'object' && (err as { response?: unknown }).response === undefined);
}

interface AuthContextType {
  user: Staff | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isImpersonating: boolean;
  can: (permission: string) => boolean;
  login: (identifier: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  impersonate: (accessToken: string, staff: Staff) => Promise<void>;
  exitImpersonation: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
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

  // Check if user is already logged in on mount.
  // Strategy: hydrate immediately from cache (offline-safe), then verify with the
  // server in the background. Only clear tokens if the server explicitly rejects
  // the session — never on network errors, so an offline reload keeps the user in.
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    const cachedUser = readCachedUser();
    if (cachedUser) {
      setUser(cachedUser);
      setPermissions(readCachedPermissions());
      setIsImpersonating(!!localStorage.getItem('originalToken'));
      setIsLoading(false);
    }

    (async () => {
      try {
        const { data } = await api.post('/auth/me');
        setUser(data.staff);
        setPermissions(data.permissions ?? []);
        setIsImpersonating(!!localStorage.getItem('originalToken'));
        writeAuthCache(data.staff, data.permissions ?? []);
        prefetchOfflineData();
      } catch (err) {
        if (isTransportError(err)) {
          // Offline / unreachable — keep cached session as-is.
          return;
        }
        // Server actually rejected us (401/403). Clear the session.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('originalToken');
        writeAuthCache(null, []);
        setUser(null);
        setPermissions([]);
      } finally {
        setIsLoading(false);
      }
    })();
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
    let perms: string[] = [];
    try {
      const { data: meData } = await api.post('/auth/me');
      perms = meData.permissions ?? [];
      setPermissions(perms);
    } catch {
      setPermissions([]);
    }
    writeAuthCache(data.staff, perms);
    prefetchOfflineData();

    navigate('/');
  };

  const loginDemo = async () => {
    const { data } = await api.post<LoginResponse>('/auth/demo');

    localStorage.removeItem('originalToken');
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.staff);
    setIsImpersonating(false);

    let perms: string[] = [];
    try {
      const { data: meData } = await api.post('/auth/me');
      perms = meData.permissions ?? [];
      setPermissions(perms);
    } catch {
      setPermissions([]);
    }
    writeAuthCache(data.staff, perms);
    prefetchOfflineData();

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
      writeAuthCache(null, []);
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
    setPermissions([]);
    try {
      const { data } = await api.post('/auth/me');
      setPermissions(data.permissions ?? []);
    } catch {
      setPermissions([]);
    }
    // Navigation is the caller's responsibility — do not navigate here.
    // This ensures state is committed before the caller navigates.
  };

  const refreshPermissions = async () => {
    try {
      const { data } = await api.post('/auth/me');
      setPermissions(data.permissions ?? []);
    } catch {
      // silently ignore — stale permissions remain until next auth action
    }
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
        loginDemo,
        logout,
        impersonate,
        exitImpersonation,
        refreshPermissions,
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
