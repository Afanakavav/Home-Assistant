import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import { logger } from './utils/logger'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/peronciolillo-home-assistant/sw.js')
      .then((registration) => {
        logger.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        logger.error('Service Worker registration failed:', error);
      });
  });
}

// Ensure we're on the correct base path
const basePath = '/peronciolillo-home-assistant';
const currentPath = window.location.pathname;

// Redirect to base path if accessed from root or wrong path
if (currentPath === '/' || (!currentPath.startsWith(basePath) && currentPath !== basePath)) {
  const newPath = basePath + (currentPath === '/' ? '/' : currentPath);
  window.history.replaceState(null, '', newPath);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

