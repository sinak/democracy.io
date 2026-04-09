class AuthApiError extends Error {}

function createMemoryStorage() {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

function getStorage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }

  return createMemoryStorage();
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id || user.sub || '',
    email: user.email || null,
  };
}

function normalizeSession(payload, fallbackUser = null) {
  const source = payload?.session || payload;

  if (!source?.access_token || !source?.refresh_token) {
    return null;
  }

  const expiresIn = source.expires_in ? Number(source.expires_in) : undefined;
  const expiresAt =
    source.expires_at
      ? Number(source.expires_at)
      : expiresIn
        ? Math.floor(Date.now() / 1000) + expiresIn
        : undefined;

  return {
    access_token: source.access_token,
    refresh_token: source.refresh_token,
    token_type: source.token_type || 'bearer',
    expires_in: expiresIn,
    expires_at: expiresAt,
    user: normalizeUser(source.user || payload?.user || fallbackUser),
  };
}

function toAuthError(error) {
  if (error instanceof AuthApiError) {
    return error;
  }

  return new AuthApiError(error instanceof Error ? error.message : String(error));
}

export function createClient(projectUrl, anonKey, options = {}) {
  const normalizedProjectUrl = String(projectUrl || '').replace(/\/+$/, '');
  const storage = options.auth?.storage || getStorage();
  const storageKey = options.auth?.storageKey || 'supabase.auth.session';
  const listeners = new Set();

  function readSession() {
    const raw = storage.getItem(storageKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      storage.removeItem(storageKey);
      return null;
    }
  }

  function writeSession(session) {
    if (!session) {
      storage.removeItem(storageKey);
      return;
    }

    storage.setItem(storageKey, JSON.stringify(session));
  }

  function emit(event, session) {
    listeners.forEach((listener) => {
      listener(event, session);
    });
  }

  async function request(path, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set('apikey', anonKey);

    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${normalizedProjectUrl}${path}`, {
      ...init,
      headers,
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new AuthApiError(
        payload?.msg ||
          payload?.message ||
          payload?.error_description ||
          payload?.error ||
          `Auth error: ${response.status}`
      );
    }

    return payload;
  }

  async function fetchUser(accessToken) {
    try {
      const payload = await request('/auth/v1/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return normalizeUser(payload);
    } catch {
      return null;
    }
  }

  async function setSession(sessionInput) {
    try {
      const user = await fetchUser(sessionInput.access_token);
      const session = normalizeSession(sessionInput, user);

      if (!session) {
        return {
          data: { session: null, user: null },
          error: new AuthApiError('Invalid auth session payload.'),
        };
      }

      writeSession(session);
      emit('SIGNED_IN', session);

      return {
        data: { session, user: session.user },
        error: null,
      };
    } catch (error) {
      return {
        data: { session: null, user: null },
        error: toAuthError(error),
      };
    }
  }

  async function refreshSession() {
    const currentSession = readSession();

    if (!currentSession?.refresh_token) {
      return {
        data: { session: currentSession },
        error: null,
      };
    }

    try {
      const payload = await request('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        body: JSON.stringify({
          refresh_token: currentSession.refresh_token,
        }),
      });

      const nextSession = normalizeSession(payload, currentSession.user);

      if (!nextSession) {
        return {
          data: { session: currentSession },
          error: null,
        };
      }

      writeSession(nextSession);
      emit('TOKEN_REFRESHED', nextSession);

      return {
        data: { session: nextSession },
        error: null,
      };
    } catch (error) {
      return {
        data: { session: currentSession },
        error: toAuthError(error),
      };
    }
  }

  async function getSession() {
    const currentSession = readSession();

    if (
      currentSession?.expires_at &&
      currentSession.expires_at * 1000 <= Date.now() + 15_000
    ) {
      return refreshSession();
    }

    return {
      data: { session: currentSession },
      error: null,
    };
  }

  async function signInWithOtp({ email, options: signInOptions = {} }) {
    try {
      await request('/auth/v1/otp', {
        method: 'POST',
        body: JSON.stringify({
          email,
          create_user: signInOptions.shouldCreateUser ?? true,
          data: signInOptions.data,
          email_redirect_to: signInOptions.emailRedirectTo,
          redirect_to: signInOptions.emailRedirectTo,
          gotrue_meta_security: {},
        }),
      });

      return {
        data: { session: null, user: null },
        error: null,
      };
    } catch (error) {
      return {
        data: { session: null, user: null },
        error: toAuthError(error),
      };
    }
  }

  async function signOut() {
    const currentSession = readSession();

    try {
      if (currentSession?.access_token) {
        await request('/auth/v1/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
          },
          body: JSON.stringify({}),
        });
      }
    } catch {
      // Best-effort logout.
    }

    writeSession(null);
    emit('SIGNED_OUT', null);

    return {
      error: null,
    };
  }

  async function exchangeCodeForSession(code) {
    try {
      const payload = await request('/auth/v1/token?grant_type=pkce', {
        method: 'POST',
        body: JSON.stringify({
          auth_code: code,
        }),
      });

      const nextSession = normalizeSession(payload);

      if (!nextSession) {
        return {
          data: { session: null, user: null },
          error: new AuthApiError('Unable to exchange the auth code for a session.'),
        };
      }

      writeSession(nextSession);
      emit('SIGNED_IN', nextSession);

      return {
        data: { session: nextSession, user: nextSession.user },
        error: null,
      };
    } catch (error) {
      return {
        data: { session: null, user: null },
        error: toAuthError(error),
      };
    }
  }

  async function verifyOtp({ token_hash: tokenHash, type }) {
    try {
      const payload = await request('/auth/v1/verify', {
        method: 'POST',
        body: JSON.stringify({
          token_hash: tokenHash,
          type,
        }),
      });

      const nextSession = normalizeSession(payload);

      if (!nextSession) {
        return {
          data: { session: null, user: null },
          error: new AuthApiError('Unable to verify the magic link.'),
        };
      }

      writeSession(nextSession);
      emit('SIGNED_IN', nextSession);

      return {
        data: { session: nextSession, user: nextSession.user },
        error: null,
      };
    } catch (error) {
      return {
        data: { session: null, user: null },
        error: toAuthError(error),
      };
    }
  }

  return {
    auth: {
      getSession,
      onAuthStateChange(callback) {
        listeners.add(callback);

        return {
          data: {
            subscription: {
              unsubscribe() {
                listeners.delete(callback);
              },
            },
          },
        };
      },
      signInWithOtp,
      signOut,
      setSession,
      exchangeCodeForSession,
      verifyOtp,
    },
  };
}
