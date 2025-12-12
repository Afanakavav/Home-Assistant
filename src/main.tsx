import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import { logger } from './utils/logger'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Unregister old service workers first to avoid caching issues
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
      // Then register the new one
      navigator.serviceWorker
        .register('/home-assistant/sw.js', { updateViaCache: 'none' })
        .then((registration) => {
          logger.log('Service Worker registered:', registration);
          // Force update on next load
          registration.update();
        })
        .catch((error) => {
          logger.error('Service Worker registration failed:', error);
        });
    });
  });
}

// Ensure we're on the correct base path
const basePath = '/home-assistant';
const currentPath = window.location.pathname;

// Only redirect if we're not already on the base path and not loading a static asset
const isStaticAsset = /\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(currentPath);
if (!isStaticAsset && currentPath !== '/' && !currentPath.startsWith(basePath)) {
  const newPath = basePath + (currentPath === '/' ? '/' : currentPath);
  window.history.replaceState(null, '', newPath);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

