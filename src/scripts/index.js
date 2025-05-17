import '../styles/styles.css';
import '../styles/responsive.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';
import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
    skipLinkButton: document.getElementById('skip-link'),
  });

  // Register SW dulu, baru render page
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./dicoding-stories-app/sw.bundle.js');
      console.log('✅ Service Worker ready & registered');
    } catch (err) {
      console.error('❌ SW registration failed:', err);
    }
  }

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    Camera.stopAllStreams();
  });
});
