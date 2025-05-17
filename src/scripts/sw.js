import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

//1. Precache static files
precacheAndRoute(self.__WB_MANIFEST);

//2. Caching for SPA routes (Application Shell fallback)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

//3. Caching API story
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new NetworkFirst({ cacheName: 'story-api-cache' })
);

//4. Caching images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

registerRoute(
  ({ url }) => url.origin.includes('tile.openstreetmap.org'),
  new CacheFirst({
    cacheName: 'osm-tiles-cache',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

//5. Push notification
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');

  const showNotification = async () => {
    const data = await event.data.json();
    await self.registration.showNotification(data.title, {
      body: data.options.body,
    });
  };

  event.waitUntil(showNotification());
});


