const CACHE_NAME = 'tu-rutina-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for the app shell; network-first-ish passthrough for everything
// else (YouTube thumbnails/embeds, fonts, music) so those always try live first.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isCoreAsset = CORE_ASSETS.some((asset) => url.pathname.endsWith(asset.replace('./', '/')));

  if (isCoreAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // External requests (YouTube, fonts, wger, etc.) are left untouched —
  // the browser handles them normally.
});
