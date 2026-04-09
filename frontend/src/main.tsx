import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { applyLegacyHashRedirect } from './helpers/legacy-hash';
import { AuthProvider } from './context/AuthContext';
import { WizardProvider } from './context/WizardContext';
import App from './App';
import './styles/app.scss';

applyLegacyHashRedirect();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <WizardProvider>
        <App />
      </WizardProvider>
    </AuthProvider>
  </BrowserRouter>
);
