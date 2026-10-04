import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppPreferencesProvider } from './i18n';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppPreferencesProvider>
      <App />
    </AppPreferencesProvider>
  </StrictMode>
);
