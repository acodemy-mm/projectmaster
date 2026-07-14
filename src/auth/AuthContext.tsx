import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AUTH_STORAGE_KEY,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_USER,
  VIEW_PASSWORD,
  type AuthRole,
  type AuthSession,
} from './config';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  signInViewer: (password: string) => string | null;
  signInSuperAdmin: (username: string, password: string) => string | null;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed.role !== 'viewer' && parsed.role !== 'super_admin') return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistSession(session: AuthSession | null) {
  if (session) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readStoredSession);

  const signInViewer = useCallback((password: string): string | null => {
    if (password !== VIEW_PASSWORD) {
      return 'Incorrect view password.';
    }
    const next: AuthSession = { role: 'viewer', signedInAt: Date.now() };
    setSession(next);
    persistSession(next);
    return null;
  }, []);

  const signInSuperAdmin = useCallback(
    (username: string, password: string): string | null => {
      const user = username.trim();
      if (user !== SUPER_ADMIN_USER || password !== SUPER_ADMIN_PASSWORD) {
        return 'Invalid Super Admin username or password.';
      }
      const next: AuthSession = {
        role: 'super_admin',
        username: user,
        signedInAt: Date.now(),
      };
      setSession(next);
      persistSession(next);
      return null;
    },
    []
  );

  const signOut = useCallback(() => {
    setSession(null);
    persistSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      isSuperAdmin: session?.role === 'super_admin',
      signInViewer,
      signInSuperAdmin,
      signOut,
    }),
    [session, signInViewer, signInSuperAdmin, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function roleLabel(role: AuthRole) {
  return role === 'super_admin' ? 'Super Admin' : 'Viewer';
}
