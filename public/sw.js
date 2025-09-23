// Service Worker para HiveCash - Billetera HBD Offline
const CACHE_NAME = "hivecash-v1.2.93";

const urlsToCache = [
  "/",
  "/index.html",
  "/index.js",
  "/favicon.png",
  "/images/logoHC.png",
  "/images/favicon192.png",
  "/images/favicon512.png",
  "/images/logo_keychain_hive.png",
  "/assets/index.css",
  "/assets/secp256k1.wasm",
  "/manifest.json",
  "/sounds/qrnotify.mp3",
  //"/qr-scanner-worker.min.js"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
      )
    )
    .then(() => self.clients.claim())
  );
});


self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);  

  // 1. Rutas SPA: siempre servir index.html para navegaciones
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then(resp => resp || fetch(request))
    );
    return;
  }

  // 2. API dinámicas: network-first con fallback a caché
  if (url.pathname.startsWith('/mint/')) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          const copy = networkResponse.clone();
          caches.open('api-cache').then(cache => cache.put(request, copy));
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3. Archivos estáticos: cache-first
  event.respondWith(
    caches.match(request)
      .then(resp => resp || fetch(request))
  );
});

