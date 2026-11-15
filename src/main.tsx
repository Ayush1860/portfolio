import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { mountBackground } from './background';
import './styles/index.css';

// The butterflies live outside React, on the canvas in index.html.
mountBackground();

// /lab is a bare tuning page for the background; everything else is the site.
const isLab = window.location.pathname.replace(/\/+$/, '') === '/lab';
const Lab = lazy(() => import('./lab/Lab'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isLab ? (
      <Suspense fallback={null}>
        <Lab />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
