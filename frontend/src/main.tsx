import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { WizardProvider } from './context/WizardContext';
import { applyLegacyHashRedirect } from './helpers/legacy-hash';
import { initMicrosoftClarity } from './helpers/clarity';
import { installGlobalDiagnostics } from './helpers/diagnostics';
import App from './App';
import './styles/app.scss';

applyLegacyHashRedirect();
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
    // Telemetry is best-effort and must never block app startup.
    console.error('Sentry init failed:', err);
  }
}

installGlobalDiagnostics();

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <WizardProvider>
          <App />
        </WizardProvider>
      </AuthProvider>
    </BrowserRouter>
  </AppErrorBoundary>
);
