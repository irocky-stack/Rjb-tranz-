import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Debug logging
console.log('main.tsx: Starting app initialization...');
console.log('main.tsx: Environment:', import.meta.env.MODE);

// Global error handler to catch unhandled errors
window.addEventListener('error', (event) => {
  console.error('🔴 UNHANDLED ERROR:', event.error);
  console.error('Error message:', event.message);
  console.error('Error stack:', event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔴 UNHANDLED PROMISE REJECTION:', event.reason);
});

// Instead of click, use touchstart or a library like FastClick
document.addEventListener('touchstart', function(event) {
  // Handle touch interactions
}, { passive: true });

console.log('main.tsx: Creating root...');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('main.tsx: Root element not found!');
} else {
  console.log('main.tsx: Root element found, rendering app...');
  try {
    createRoot(rootElement).render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <App />
      </ErrorBoundary>
    );
    console.log('main.tsx: App rendered successfully');
  } catch (error) {
    console.error('🔴 RENDER ERROR:', error);
  }
}
