const CACHE = 'cogen-v3';
const ASSETS = ['/manifest.json', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await Promise.allSettled(
        ASSETS.map(async (asset) => {
          const response = await fetch(asset, { cache: 'no-store' });
          if (!response.ok) throw new Error(`Failed to cache ${asset}: ${response.status}`);
          await cache.put(asset, response);
        }),
      );
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse.ok) return networkResponse;

        const copy = networkResponse.clone();
        caches.open(CACHE).then((cache) => {
          cache.put(event.request, copy).catch(() => {});
        });

        return networkResponse;
      });
    }),
  );
});
