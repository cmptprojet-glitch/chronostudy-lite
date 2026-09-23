import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { SupabaseAuthTestPage } from './components/SupabaseAuthTestPage.tsx';
import './index.css';

const rootPage = window.location.pathname === '/auth-test' ? <SupabaseAuthTestPage /> : <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        {rootPage}
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);
