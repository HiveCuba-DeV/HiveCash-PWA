import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { Buffer } from 'buffer';

import { BeforeInstallPromptEvent } from './declarations';

window.Buffer = Buffer;

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Defensive measures for browser extension conflicts
try {
  // Prevent extensions from accessing certain globals
  if (typeof window !== 'undefined') {
    // Store original methods that extensions might override
    const originalPostMessage = window.postMessage;
    const originalAddEventListener = window.addEventListener;
    
    // Restore if needed
    if (!window.postMessage || typeof window.postMessage !== 'function') {
      window.postMessage = originalPostMessage;
    }
    
    if (!window.addEventListener || typeof window.addEventListener !== 'function') {
      window.addEventListener = originalAddEventListener;
    }
  }
} catch (error) {
  console.warn('Extension conflict detected, continuing with fallback:', error);
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;

  const installBtn = document.getElementById('installBtn');
  if (installBtn) installBtn.style.display = 'block';

  installBtn?.addEventListener('click', onInstallClick);
});


function onInstallClick() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice => {
    if (choice.outcome === 'accepted') deferredPrompt = null;
  });
}



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registrado:', reg);
    } catch (err) {
      console.error('Error registrando SW:', err);
    }
  });
}