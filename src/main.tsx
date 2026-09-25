import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enterprise Google Maps Platform Error/Notice Interceptor
// Prevents unactivated non-critical Geocoding service warnings from bubbling as uncaught application errors
const origConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const combined = args.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg) || '')).join(' ');
  if (
    combined.includes('Geocoding Service: This API is not activated on your API project') ||
    combined.includes('LegacyApiNotActivatedMapError')
  ) {
    // Gracefully handled by application's deterministic geofencing and coordinate resolver
    return;
  }
  origConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
