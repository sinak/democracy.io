import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { WizardProvider } from './context/WizardContext';
import App from './App';
import './styles/app.scss';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tunnel: '/api/1/monitor',
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <WizardProvider>
      <App />
    </WizardProvider>
  </HashRouter>
);
