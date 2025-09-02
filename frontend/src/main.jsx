import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
// Import CSS in proper order - base to specific
import './unified-agricultural-theme.css';     // Base theme system (highest priority)
import './admin-theme-fix.css';               // Admin visibility fixes
import './accessible-forms.css';              // Form accessibility
import './mobile-responsive-admin.css';       // Mobile responsiveness
import './styles.css';                        // Legacy styles (lower priority)
import './admin-layout.css';                  // Admin layout (override legacy)
import './agricultural-theme.css';            // Enhanced theme (final overrides)
import './utils/mobileTouch.js';
import './utils/progressiveEnhancement.js';
import './utils/performanceTesting.js';

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              showUpdateNotification();
            }
          });
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Show update notification when new version is available
function showUpdateNotification() {
  if (confirm('A new version of Adonai Farm is available. Would you like to update?')) {
    window.location.reload();
  }
}

// Handle PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;

  // Show custom install prompt
  showInstallPrompt();
});

function showInstallPrompt() {
  const installPrompt = document.createElement('div');
  installPrompt.className = 'pwa-install-prompt';
  installPrompt.innerHTML = `
    <div style="flex: 1;">
      <strong>📱 Install Adonai Farm</strong><br>
      <small>Add to your home screen for quick access</small>
    </div>
    <button class="btn install-btn">Install</button>
    <button class="btn dismiss-btn" style="background: transparent; color: white;">Later</button>
  `;

  document.body.appendChild(installPrompt);

  // Show the prompt
  setTimeout(() => {
    installPrompt.classList.add('show');
  }, 1000);

  // Handle install button click
  installPrompt.querySelector('.install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
    }
    installPrompt.remove();
  });

  // Handle dismiss button click
  installPrompt.querySelector('.dismiss-btn').addEventListener('click', () => {
    installPrompt.remove();
    // Don't show again for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(installPrompt)) {
      installPrompt.remove();
    }
  }, 10000);
}

// Check if install prompt was recently dismissed
window.addEventListener('load', () => {
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed) {
    const dismissedTime = parseInt(dismissed);
    const now = Date.now();
    const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);

    if (hoursSinceDismissed < 24) {
      // Don't show install prompt if dismissed within last 24 hours
      return;
    } else {
      // Clear the dismissed flag after 24 hours
      localStorage.removeItem('pwa-install-dismissed');
    }
  }
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
