import { convertBase64ToUint8Array } from './index'; 
import { getAccessToken } from './auth';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
const API_SUBSCRIBE_URL = 'https://story-api.dicoding.dev/v1/notifications/subscribe';

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes));
}

export async function subscribePushNotification() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Izin notifikasi ditolak');
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const data = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth')),
      },
    };

    const token = getAccessToken();

    const response = await fetch(API_SUBSCRIBE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('[DEBUG] Subscribe response:', result);

    if (!response.ok || result.error) {
      throw new Error(result.message || 'Gagal subscribe');
    }

    alert(result.message);
  } catch (err) {
    alert(`Gagal subscribe: ${err.message}`);
    console.error('[ERROR] Subscribe failed:', err);
  }
}

export async function unsubscribePushNotification() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      alert('Tidak ada langganan aktif');
      return;
    }

    const endpoint = subscription.endpoint;
    console.log('[DEBUG] Current subscription endpoint:', endpoint);

    const unsubscribed = await subscription.unsubscribe();
    console.log('[DEBUG] Unsubscribed from pushManager:', unsubscribed);

    const token = getAccessToken();

    const response = await fetch(API_SUBSCRIBE_URL, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });

    const result = await response.json();
    console.log('[DEBUG] Unsubscribe response:', result);

    if (!response.ok || result.error) {
      throw new Error(result.message || 'Gagal unsubscribe dari server');
    }

    alert(result.message);
  } catch (err) {
    alert(`Gagal unsubscribe: ${err.message}`);
    console.error('[ERROR] Unsubscribe failed:', err);
  }
}
