const API_BASE = '/api/1';

export type ApiError = Error & {
  code?: number;
  data?: unknown;
};

export interface ApiRequestOptions extends RequestInit {
  accessToken?: string | null;
}

function buildHeaders(options?: ApiRequestOptions) {
  const headers = new Headers(options?.headers);

  if (!headers.has('Content-Type') && options?.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (options?.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  return headers;
}

export async function apiFetch<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  if (!response.ok) {
    const error = new Error(`API error: ${response.status}`) as ApiError;
    error.code = response.status;

    try {
      const json = await response.json();
      if (typeof json?.message === 'string') {
        error.message = json.message;
      }
      error.data = json?.data;
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();
  return json.data ?? json;
}
