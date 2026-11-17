import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { API_CONFIG } from '@/constants/api';

/**
 * By default the app runs against an in-browser mock API (MSW), so it works
 * with no backend. Set VITE_API_URL to point it at a real server.
 */
async function bootstrap() {
  if (API_CONFIG.USE_MOCK_API) {
    const { startMockApi } = await import('./mocks/browser');
    await startMockApi();
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
