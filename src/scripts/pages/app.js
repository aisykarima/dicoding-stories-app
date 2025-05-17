import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from '../templates';
import { setupSkipToContent, transitionHelper } from '../utils';
import { getAccessToken, getLogout } from '../utils/auth';
import { routes } from '../routes/routes';
import { subscribePushNotification, unsubscribePushNotification } from '../utils/notification';

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#drawerNavigation.classList.remove('open');
      }

      this.#drawerNavigation.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#drawerNavigation.classList.remove('open');
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain = this.#drawerNavigation.children.namedItem('navlist-main');
    const navList = this.#drawerNavigation.children.namedItem('navlist');

    // User not log in
    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (confirm('Apakah Anda yakin ingin keluar?')) {
        getLogout();

        // Redirect
        location.hash = '/login';
      }
    });
    // panggil async function terpisah tanpa await
    this.#setupPushNotificationToggle();
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url] || routes['/'];
  
    const page = route();
  
    if (!page || !page.render) {
      if (!getAccessToken()) {
        alert('Anda harus login terlebih dahulu.');
        location.hash = '/login';
        return;
      }
    
      this.#content.innerHTML = `<p>Halaman tidak ditemukan.</p>`;
      return;
    }
    
    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        page.afterRender();
      },
    });

    function setupPushButtons() {
      const subscribeBtn = document.getElementById('subscribe-push');
      const unsubscribeBtn = document.getElementById('unsubscribe-push');
      const toggleSwitch = document.getElementById('push-toggle-switch');

      if (toggleSwitch) return; // jika pakai toggle switch, abaikan tombol manual

      if (!subscribeBtn || !unsubscribeBtn) return;

      subscribeBtn.addEventListener('click', async () => {
        await subscribePushNotification();
        subscribeBtn.hidden = true;
        unsubscribeBtn.hidden = false;
      });

      unsubscribeBtn.addEventListener('click', async () => {
        await unsubscribePushNotification();
        subscribeBtn.hidden = false;
        unsubscribeBtn.hidden = true;
      });
    }

    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#setupNavigationList();

      setupPushButtons();  // pastikan tombol subscribe/unsubscribe aktif
    });
  }
  
  async #setupPushNotificationToggle() {
  const toggleSwitch = document.getElementById('push-toggle-switch');
  if (!toggleSwitch) return;

  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  toggleSwitch.checked = !!subscription;

  toggleSwitch.addEventListener('change', async (event) => {
    if (event.target.checked) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await subscribePushNotification();
      } else {
        alert('Izin notifikasi ditolak');
        event.target.checked = false;
      }
    } else {
      await unsubscribePushNotification();
    }
  });
  }
}

