/* ═══════════════════════════════════════════════
   CYBER TERMINAL — Service Worker
   Strategi: Cache-First untuk aset statis,
             Network-First untuk data live
   ═══════════════════════════════════════════════ */

const VERSION = 'cyberterm-v1.0.0';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

/* Aset yang di-cache saat install (biar offline tetap jalan) */
const STATIC_ASSETS = [
  '/dashboard.html',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js',
  'https://cdn.jsdelivr.net/gh/roraxbali/image-hosting@main/images.jpg',
  'https://cdn.jsdelivr.net/gh/roraxbali/image-hosting@main/malam.jpg'
];

/* Domain yang TIDAK boleh di-cache (data live) */
const NETWORK_ONLY = [
  'firebaseio.com',
  'firebasedatabase.app',
  'googleapis.com',
  'ipapi.co',
  'api.ipify.org',
  'is.gd',
  'nominatim.openstreetmap.org',
  'api.qrserver.com',
  'infocuaca.online'
];

/* ─── INSTALL ─── */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Skip cache:', url, err.message))
        )
      );
    })
  );
});

/* ─── ACTIVATE ─── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('cyberterm-') && k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ─── FETCH ─── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = request.url;

  /* Skip non-GET */
  if (request.method !== 'GET') return;

  /* Skip chrome-extension, data:, dll */
  if (!url.startsWith('http')) return;

  /* Network-only untuk data live (Firebase, IP, shortlink, dll) */
  const isNetworkOnly = NETWORK_ONLY.some(d => url.includes(d));
  if (isNetworkOnly) {
    event.respondWith(
      fetch(request).catch(() => {
        /* Kalau offline & data live → kembalikan response kosong biar tidak error */
        return new Response(JSON.stringify({ offline: true }), {
          status: 503,
          statusText: 'Offline — data live tidak tersedia',
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  /* Cache-first untuk aset statis (dashboard, library, gambar, tile peta) */
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        /* Update cache di background (stale-while-revalidate) */
        fetch(request)
          .then(res => {
            if (res && res.status === 200 && res.type === 'basic') {
              caches.open(RUNTIME_CACHE).then(c => c.put(request, res.clone()));
            }
          })
          .catch(() => {});
        return cached;
      }

      /* Belum ada di cache → fetch & simpan */
      return fetch(request)
        .then(res => {
          if (!res || res.status !== 200 || res.type === 'opaque') return res;
          const resClone = res.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(request, resClone));
          return res;
        })
        .catch(() => {
          /* Fallback: halaman offline sederhana */
          if (request.mode === 'navigate') {
            return caches.match('/dashboard.html');
          }
          return new Response('', { status: 408, statusText: 'Offline' });
        });
    })
  );
});

/* ─── MESSAGE (dari halaman) ─── */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ─── BACKGROUND SYNC (opsional, untuk retry data) ─── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-targets') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(c => c.postMessage({ type: 'SYNC_NOW' }));
      })
    );
  }
});

console.log('[SW] Cyber Terminal Service Worker v1.0.0 loaded');
