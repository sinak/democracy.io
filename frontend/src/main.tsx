import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { WizardProvider } from './context/WizardContext';
import App from './App';
import './styles/app.scss';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <WizardProvider>
      <App />
    </WizardProvider>
  </HashRouter>
);
