import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AUTH_CALLBACK_PATH,
  getAuthCallbackUrl,
  hasSupabaseAuthParams,
  isSupabaseConfigured,
  restoreSupabaseSessionFromUrl,
  supabase,
} from '../lib/supabase-browser';
import { resolveAdminAccess } from '../helpers/campaign-api';
import {
  consumePostAuthRedirect,
  rememberPostAuthRedirect,
} from '../helpers/auth-redirect';
import type { AuthSession, AuthUser } from '../types';

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  authError: string | null;
  pendingPostAuthRedirect: string | null;
  signInWithOtp: (email: string, redirectPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAdminState: () => Promise<boolean>;
  clearPendingPostAuthRedirect: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

async function checkAdminAccess(accessToken: string | undefined) {
  if (!accessToken) {
    return false;
  }

  try {
    return await resolveAdminAccess(accessToken);
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingPostAuthRedirect, setPendingPostAuthRedirect] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      setIsLoading(true);

      const hadAuthParams = hasSupabaseAuthParams();
      const landedOnAuthCallback = window.location.pathname === AUTH_CALLBACK_PATH;
      const { session: nextSession, error } = await restoreSupabaseSessionFromUrl();

      if (cancelled) {
        return;
      }

      if (error) {
        setAuthError(error.message);
        setSession(null);
        setIsAdmin(false);
        setPendingPostAuthRedirect(null);
        setIsLoading(false);
        return;
      }

      setSession(nextSession);
      setAuthError(null);
      setIsAdmin(await checkAdminAccess(nextSession?.access_token));
      setPendingPostAuthRedirect(
        hadAuthParams && nextSession && !landedOnAuthCallback
          ? consumePostAuthRedirect()
          : null
      );
      setIsLoading(false);
    }

    void loadSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void (async () => {
        if (cancelled) {
          return;
        }

        setSession(nextSession);
        setAuthError(null);
        if (!nextSession) {
          setPendingPostAuthRedirect(null);
        }
        setIsLoading(true);
        setIsAdmin(await checkAdminAccess(nextSession?.access_token));
        setIsLoading(false);
      })();
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  async function signInWithOtp(email: string, redirectPath = '/organizer/campaigns') {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase auth is not configured for the frontend.');
    }

    rememberPostAuthRedirect(redirectPath);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    setAuthError(null);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    setSession(null);
    setIsAdmin(false);
    setAuthError(null);
    setPendingPostAuthRedirect(null);
  }

  async function refreshAdminState() {
    const nextIsAdmin = await checkAdminAccess(session?.access_token);
    setIsAdmin(nextIsAdmin);
    return nextIsAdmin;
  }

  function clearPendingPostAuthRedirect() {
    setPendingPostAuthRedirect(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user || null,
      isAdmin,
      isLoading,
      authError,
      pendingPostAuthRedirect,
      signInWithOtp,
      signOut,
      refreshAdminState,
      clearPendingPostAuthRedirect,
    }),
    [authError, isAdmin, isLoading, pendingPostAuthRedirect, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
