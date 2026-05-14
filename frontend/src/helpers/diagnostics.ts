import * as Sentry from '@sentry/react';

type DiagnosticLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

type DiagnosticOptions = {
  level?: DiagnosticLevel;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  exception?: unknown;
};

let globalDiagnosticsInstalled = false;

function normalizeError(exception: unknown) {
  if (exception instanceof Error) {
    return {
      name: exception.name,
      message: exception.message,
      stack: exception.stack,
    };
  }

  return { message: String(exception) };
}

function getDiagnosticSessionId() {
  try {
    const existing = sessionStorage.getItem('dio:diagnostic-session-id');
    if (existing) return existing;

    const next =
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('dio:diagnostic-session-id', next);
    return next;
  } catch {
    return 'unavailable';
  }
}

function getSafeLocation() {
  const searchKeys = Array.from(new URLSearchParams(window.location.search).keys());
  return {
    href: `${window.location.origin}${window.location.pathname}${window.location.hash}`,
    path: window.location.pathname,
    hash: window.location.hash,
    searchKeys,
  };
}

function postDiagnostic(
  name: string,
  options: Required<Omit<DiagnosticOptions, 'exception'>> & { exception?: unknown }
) {
  const location = getSafeLocation();
  const body = JSON.stringify({
    name,
    level: options.level,
    tags: options.tags,
    extra: {
      ...options.extra,
      diagnosticSessionId: getDiagnosticSessionId(),
      location,
    },
    error: options.exception ? normalizeError(options.exception) : undefined,
    url: location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon('/api/1/exception', blob)) return;
    }
  } catch {
    // Fall back to fetch below.
  }

  fetch('/api/1/exception', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Diagnostics are best-effort.
  });
}

export function reportDiagnostic(name: string, options: DiagnosticOptions = {}) {
  const level = options.level ?? 'warning';
  const tags = options.tags ?? {};
  const extra = {
    ...(options.extra ?? {}),
    diagnosticSessionId: getDiagnosticSessionId(),
  };

  try {
    Sentry.addBreadcrumb({
      category: 'diagnostic',
      message: name,
      level,
      data: tags,
    });

    const context = { level, tags, extra };
    if (options.exception) {
      Sentry.captureException(options.exception, context);
    } else {
      Sentry.captureMessage(name, context);
    }
  } catch (err) {
    console.error('Sentry capture failed:', err);
  }

  postDiagnostic(name, {
    level,
    tags,
    extra,
    exception: options.exception,
  });
}

export function installGlobalDiagnostics() {
  if (globalDiagnosticsInstalled) return;
  globalDiagnosticsInstalled = true;

  window.addEventListener('error', (event) => {
    reportDiagnostic('window-error', {
      level: 'error',
      tags: {
        source: 'window-error',
      },
      extra: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        path: window.location.pathname,
        hash: window.location.hash,
      },
      exception: event.error || event.message,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportDiagnostic('unhandled-promise-rejection', {
      level: 'error',
      tags: {
        source: 'unhandledrejection',
      },
      extra: {
        reason:
          event.reason instanceof Error
            ? { name: event.reason.name, message: event.reason.message }
            : String(event.reason),
        path: window.location.pathname,
        hash: window.location.hash,
      },
      exception: event.reason,
    });
  });
}
