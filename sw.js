// Simple offline-first service worker (+ PDF network-first)
const CACHE = 'novax-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './js/blackhole-interstellar-v5.js'
  // If you add icons later, also include:
  // './images/icon-192.png',
  // './images/icon-512.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);

  // Network-first for Divyanshu_Kumar_Resume.pdf so you always get the latest once you upload it
  if (url.pathname.endsWith('/Divyanshu_Kumar_Resume.pdf') || url.pathname.endsWith('Divyanshu_Kumar_Resume.pdf')){
    e.respondWith(
      fetch(e.request).then(r=>{
        const copy = r.clone();
        caches.open(CACHE).then(c=> c.put(e.request, copy));
        return r;
      }).catch(()=> caches.match(e.request))
    );
    return;
  }

  // Everything else: cache-first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
