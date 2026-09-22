/* ══════════════════════════════════════════════════════════════════════════
   Cyber Tracker — sw.js  ·  versi 4.0.0
   Aturan kerja: SELALU AMBIL VERSI TERBARU DARI INTERNET (network-first).
   Cache hanya dipakai sebagai cadangan saat internet mati.
   Tujuannya: halaman tidak pernah lagi "nyangkut" menampilkan versi lama.
   ══════════════════════════════════════════════════════════════════════════ */
var VERSI = '4.0.0';
var CACHE = 'cyber-tracker-v4';
var INTI  = ['./dashboard.html', './sw.js'];

/* ── pasang: langsung aktif, tidak menunggu ── */
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(INTI.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () { /* biarkan */ });
      }));
    })
  );
});

/* ── aktif: hapus cache versi lama, ambil alih semua tab ── */
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (kunci) {
      return Promise.all(kunci.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* ── permintaan ── */
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;

  var u;
  try { u = new URL(r.url); } catch (err) { return; }

  /* Hanya berkas halaman sendiri yang diurus.
     Firebase, peta, video, dan CDN tidak disentuh → data selalu baru. */
  if (u.origin !== self.location.origin) return;
  if (u.pathname.indexOf('/lokasi/') === 0) return;

  e.respondWith(
    fetch(r).then(function (jawab) {
      if (jawab && jawab.ok) {
        var salinan = jawab.clone();
        caches.open(CACHE).then(function (c) { c.put(r, salinan).catch(function () {}); });
      }
      return jawab;
    }).catch(function () {
      /* internet mati → pakai salinan terakhir */
      return caches.match(r).then(function (m) {
        return m || caches.match('./dashboard.html');
      });
    })
  );
});

/* ── pesan dari halaman (mis. minta versi) ── */
self.addEventListener('message', function (e) {
