/* ══════════════════════════════════════════════════════════════════════════
   CYBER TRACKER — Service Worker (versi 2, revisi 6e)
   PERUBAHAN PENTING:
     • HALAMAN (dashboard.html / 2-dashboard.html / index.html)  -> NETWORK-FIRST
       Artinya: file terbaru dari GitHub SELALU yang dipakai. Tidak lagi
       "nyangkut" di versi lama seperti cache-first versi sebelumnya.
     • Pustaka CDN (leaflet, three.js, crypto-js, gambar)        -> CACHE-FIRST
       (biar tetap cepat & bisa offline)
     • Data live (Firebase, IP, dsb)                             -> NETWORK ONLY
   ══════════════════════════════════════════════════════════════════════════ */

const VERSION       = 'cyberterm-v2.0.0';
const STATIC_CACHE  = VERSION + '-static';
const RUNTIME_CACHE = VERSION + '-runtime';
const HALAMAN_CACHE = VERSION + '-halaman';

/* Pustaka yang di-cache saat install (HALAMAN TIDAK di-cache di sini) */
const STATIC_ASSETS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js',
  'https://cdn.jsdelivr.net/gh/roraxbali/image-hosting@main/images.jpg',
  'https://cdn.jsdelivr.net/gh/roraxbali/image-hosting@main/malam.jpg'
];

/* Selalu ambil dari internet (data live) */
const NETWORK_ONLY = [
  'firebaseio.com', 'firebasedatabase.app', 'googleapis.com',
  'ipapi.co', 'api.ipify.org', 'is.gd',
  'nominatim.openstreetmap.org', 'api.qrserver.com'
];

/* Halaman (HTML) yang dipakai network-first */
function halamanHTML(url, request) {
  if (request.mode === 'navigate') return true;
  if (request.destination === 'document') return true;
  return /\.html($|\?)/i.test(url);
}

/* ─── INSTALL ─── */
self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return Promise.allSettled(
        STATIC_ASSETS.map(function (url) {
          return cache.add(url).catch(function (e) { console.warn('[SW] lewat:', url, e.message); });
        })
      );
    })
  );
});

/* ─── ACTIVATE: buang SEMUA cache versi lama ─── */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== STATIC_CACHE && k !== RUNTIME_CACHE && k !== HALAMAN_CACHE) {
          console.log('[SW] hapus cache lama:', k);
          return caches.delete(k);
        }
        return null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* ─── FETCH ─── */
self.addEventListener('fetch', function (event) {
  const request = event.request;
  const url = request.url;

  if (request.method !== 'GET') return;
  if (url.indexOf('http') !== 0) return;

  /* 1) data live -> selalu internet */
  if (NETWORK_ONLY.some(function (d) { return url.indexOf(d) > -1; })) {
    event.respondWith(
      fetch(request).catch(function () {
        return new Response(JSON.stringify({ offline: true }), {
          status: 503, statusText: 'Offline',
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  /* 2) HALAMAN -> NETWORK-FIRST (selalu ambil file terbaru) */
  if (halamanHTML(url, request)) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(function (res) {
          if (res && res.status === 200 && res.type === 'basic') {
            var salinan = res.clone();
            caches.open(HALAMAN_CACHE).then(function (c) { c.put(request, salinan); });
          }
          return res;
        })
        .catch(function () {
          /* offline -> pakai salinan terakhir */
          return caches.match(request).then(function (c) {
            if (c) return c;
            return caches.match('2-dashboard.html').then(function (c2) {
              return c2 || new Response(
                '<h1 style="font-family:sans-serif">Sedang offline</h1>' +
                '<p style="font-family:sans-serif">Sambungkan internet lalu muat ulang.</p>',
                { status: 200, headers: { 'Content-Type': 'text/html' } });
            });
          });
        })
    );
    return;
  }

  /* 3) aset lain (pustaka, gambar, ubin peta) -> CACHE-FIRST */
  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (res) {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        var salinan = res.clone();
        caches.open(RUNTIME_CACHE).then(function (c) { c.put(request, salinan); });
        return res;
      }).catch(function () {
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});

/* ─── PESAN DARI HALAMAN ─── */
self.addEventListener('message', function (event) {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();

  /* dashboard bisa minta cache dibersihkan (misal setelah update) */
  if (event.data === 'BERSIHKAN_CACHE') {
    event.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) { return caches.delete(k); }));
      })
    );
  }
});

console.log('[SW] Cyber Tracker Service Worker ' + VERSION + ' — halaman memakai network-first');
