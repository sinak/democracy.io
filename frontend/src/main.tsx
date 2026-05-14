import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { WizardProvider } from './context/WizardContext';
import App from './App';
import './styles/app.scss';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  try {
    Sentry.init({
      dsn: sentryDsn,
      tunnel: '/api/1/monitor',
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      defaultIntegrations: false,
    });
  } catch (err) {
    // Never let Sentry init break the app — telemetry is best-effort.
    console.error('Sentry init failed:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <WizardProvider>
      <App />
    </WizardProvider>
  </HashRouter>
);
