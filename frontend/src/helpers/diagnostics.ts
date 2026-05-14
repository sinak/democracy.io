import * as Sentry from '@sentry/react';

type DiagnosticLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

type DiagnosticOptions = {
  level?: DiagnosticLevel;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  exception?: unknown;
};

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

function postDiagnostic(
  name: string,
  options: Required<Omit<DiagnosticOptions, 'exception'>> & { exception?: unknown }
) {
  const body = JSON.stringify({
    name,
    level: options.level,
    tags: options.tags,
    extra: options.extra,
    error: options.exception ? normalizeError(options.exception) : undefined,
    url: window.location.href,
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
  const extra = options.extra ?? {};

  try {
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
