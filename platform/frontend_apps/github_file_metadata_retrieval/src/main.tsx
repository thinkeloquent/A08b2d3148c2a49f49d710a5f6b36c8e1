import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import '@/index.css';

// Trusted Types policy for ECharts (uses innerHTML for tooltips)
if (typeof window !== 'undefined' && window.trustedTypes && !window.trustedTypes.defaultPolicy) {
  try {
    window.trustedTypes.createPolicy('default', {
      createHTML: (s: string) => s,
    });
  } catch { /* policy may already exist */ }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
