const REDIRECT_STORAGE_KEY = 'democracy.io.post-auth-redirect';
const DEFAULT_REDIRECT = '/organizer/campaigns';

type BrowserStorageKey = 'sessionStorage' | 'localStorage';

function getBrowserStorage(storageKey: BrowserStorageKey) {
  if (typeof window === 'undefined') {
    return null;
  }

  return storageKey === 'sessionStorage' ? window.sessionStorage : window.localStorage;
}

function readStoredRedirect() {
  return (
    getBrowserStorage('sessionStorage')?.getItem(REDIRECT_STORAGE_KEY) ||
    getBrowserStorage('localStorage')?.getItem(REDIRECT_STORAGE_KEY)
  );
}

function clearStoredRedirect() {
  getBrowserStorage('sessionStorage')?.removeItem(REDIRECT_STORAGE_KEY);
  getBrowserStorage('localStorage')?.removeItem(REDIRECT_STORAGE_KEY);
}

export function buildReturnToPath(pathname: string, search = '', hash = '') {
  return `${pathname}${search}${hash}` || '/';
}

export function normalizeRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_REDIRECT
) {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  if (value.startsWith('/auth/callback')) {
    return fallback;
  }

  return value;
}

export function rememberPostAuthRedirect(path: string) {
  const normalizedPath = normalizeRedirectPath(path);

  getBrowserStorage('sessionStorage')?.setItem(REDIRECT_STORAGE_KEY, normalizedPath);
  getBrowserStorage('localStorage')?.setItem(REDIRECT_STORAGE_KEY, normalizedPath);
}

export function readPostAuthRedirect() {
  return normalizeRedirectPath(readStoredRedirect(), DEFAULT_REDIRECT);
}

export function consumePostAuthRedirect(fallback = DEFAULT_REDIRECT) {
  const value = readStoredRedirect();
  clearStoredRedirect();
  return normalizeRedirectPath(value, fallback);
}
