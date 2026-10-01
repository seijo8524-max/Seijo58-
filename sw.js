// SEIJO58 BET - Exclusively Online Configuration (Offline Disabled)
const CACHE_NAME = 'seijo58-online-v4';

self.addEventListener('install', (event) => {
  // Immediately take over, but do NOT cache offline assets
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purge all old caches to guarantee no offline stale states
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          console.log('Purging offline cache:', name);
          return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strictly network-only with no offline fallbacks: The app operates exclusively online
self.addEventListener('fetch', (event) => {
  // Bypass service worker cache completely for live casino data integrity
  return;
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

