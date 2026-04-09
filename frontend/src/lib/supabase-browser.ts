import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://example.supabase.co';
const FALLBACK_ANON_KEY = 'public-anon-key';
const STORAGE_KEY = 'democracy.io.supabase.session';

const viteEnv = (import.meta.env ?? {}) as Record<string, string | undefined>;
const globalScope = globalThis as typeof globalThis & {
  process?: {
    env?: Record<string, string | undefined>;
  };
};
const processEnv =
  typeof globalScope.process?.env === 'object' && globalScope.process.env
    ? globalScope.process.env
    : {};

const supabaseUrl = String(
  viteEnv.VITE_SUPABASE_URL ?? processEnv.VITE_SUPABASE_URL ?? ''
).trim();
const supabaseAnonKey = String(
  viteEnv.VITE_SUPABASE_ANON_KEY ?? processEnv.VITE_SUPABASE_ANON_KEY ?? ''
).trim();

export const AUTH_CALLBACK_PATH = '/auth/callback';
export const DEV_AUTH_CALLBACK_URL = 'http://localhost:3000/auth/callback';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseProjectUrl = supabaseUrl;
export const supabasePublicAnonKey = supabaseAnonKey;

export const supabase = createClient(
  supabaseUrl || FALLBACK_URL,
  supabaseAnonKey || FALLBACK_ANON_KEY,
  {
    auth: {
      storageKey: STORAGE_KEY,
    },
  }
);

export function getAuthCallbackUrl() {
  if (typeof window === 'undefined') {
    return DEV_AUTH_CALLBACK_URL;
  }

  if (window.location.origin === 'http://localhost:3000') {
    return DEV_AUTH_CALLBACK_URL;
  }

  return new URL(AUTH_CALLBACK_PATH, window.location.origin).toString();
}

function createAuthError(message: string) {
  return new Error(message);
}

function readParamsFromHash(hash: string) {
  const normalizedHash = hash.startsWith('#') ? hash.slice(1) : hash;
  return new URLSearchParams(normalizedHash);
}

function stripAuthParamsFromUrl(url: URL) {
  const cleanedUrl = new URL(url.toString());

  [
    'code',
    'token',
    'token_hash',
    'type',
    'error',
    'error_code',
    'error_description',
    'access_token',
    'refresh_token',
    'expires_at',
    'expires_in',
    'token_type',
    'redirect_to',
  ].forEach((key) => cleanedUrl.searchParams.delete(key));

  cleanedUrl.hash = '';
  return `${cleanedUrl.pathname}${cleanedUrl.search}`;
}

export function hasSupabaseAuthParams(urlValue = window.location.href) {
  const url = new URL(urlValue);
  const searchParams = url.searchParams;
  const hashParams = readParamsFromHash(url.hash);

  return [
    'code',
    'token',
    'token_hash',
    'type',
    'error',
    'error_code',
    'error_description',
    'access_token',
    'refresh_token',
    'expires_at',
    'expires_in',
    'token_type',
  ].some((key) => searchParams.has(key) || hashParams.has(key));
}

export async function restoreSupabaseSessionFromUrl(urlValue = window.location.href) {
  const url = new URL(urlValue);
  const searchParams = url.searchParams;
  const hashParams = readParamsFromHash(url.hash);

  const errorDescription =
    searchParams.get('error_description') || hashParams.get('error_description');
  const errorMessage = searchParams.get('error') || hashParams.get('error');

  if (errorDescription || errorMessage) {
    return {
      session: null,
      error: createAuthError(errorDescription || errorMessage || 'Sign-in failed.'),
    };
  }

  const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
  const expiresIn =
    Number(hashParams.get('expires_in') || searchParams.get('expires_in')) || undefined;
  const expiresAt =
    Number(hashParams.get('expires_at') || searchParams.get('expires_at')) || undefined;

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      expires_in: expiresIn,
      token_type: hashParams.get('token_type') || searchParams.get('token_type') || 'bearer',
    });

    if (!error) {
      window.history.replaceState({}, '', stripAuthParamsFromUrl(url));
    }

    return {
      session: data.session,
      error,
    };
  }

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const authType = searchParams.get('type');

  if (tokenHash && authType) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: authType,
    });

    if (!error) {
      window.history.replaceState({}, '', stripAuthParamsFromUrl(url));
    }

    return {
      session: data.session,
      error,
    };
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      window.history.replaceState({}, '', stripAuthParamsFromUrl(url));
    }

    return {
      session: data.session,
      error,
    };
  }

  const { data, error } = await supabase.auth.getSession();
  return {
    session: data.session,
    error,
  };
}
