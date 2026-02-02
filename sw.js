// Stale-while-revalidate service worker for fresh content
const CACHE = 'novax-cache-v10';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './js/blackhole-interstellar-v5.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  // Immediately activate new service worker
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Clean up old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  // Skip external requests
  if (url.origin !== location.origin) return;

  // Network-first for PDF resume (always get latest)
  if (url.pathname.includes('Resume.pdf')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Stale-while-revalidate for HTML, CSS, JS (serve cached, update in background)
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') || url.pathname === '/' || url.pathname === '') {
    e.respondWith(
      caches.open(CACHE).then(cache => {
        return cache.match(e.request).then(cachedResponse => {
          // Always fetch from network to update cache
          const fetchPromise = fetch(e.request).then(networkResponse => {
            // Update cache with new response
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => cachedResponse); // Fallback to cache if offline

          // Return cached response immediately, or wait for network
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Cache-first for other assets (images, fonts, etc.)
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(response => {
      // Cache the fetched response
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return response;
    }))
  );
});
