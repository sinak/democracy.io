import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { WizardProvider } from './context/WizardContext';
import { initMicrosoftClarity } from './helpers/clarity';
import { installGlobalDiagnostics } from './helpers/diagnostics';
import App from './App';
import './styles/app.scss';

function normalizeLegacyHashbangUrl() {
  const { hash, pathname, search } = window.location;
  if (!hash.startsWith('#!')) return;

  const hashPath = hash.slice(2);
  const normalizedPath = hashPath.startsWith('/') ? hashPath : `/${hashPath}`;
  window.history.replaceState(null, '', `${pathname}${search}#${normalizedPath}`);
}

normalizeLegacyHashbangUrl();

initMicrosoftClarity(import.meta.env.VITE_CLARITY_PROJECT_ID);

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  try {
    Sentry.init({
      dsn: sentryDsn,
      tunnel: '/api/1/monitor',
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      sendDefaultPii: false,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    });
  } catch (err) {
    // Never let Sentry init break the app; telemetry is best-effort.
    console.error('Sentry init failed:', err);
  }
}

installGlobalDiagnostics();

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <HashRouter>
      <WizardProvider>
        <App />
      </WizardProvider>
    </HashRouter>
  </AppErrorBoundary>
);
