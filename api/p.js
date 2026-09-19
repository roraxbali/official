export default function handler(req, res) {
  // 1. Ambil semua parameter dari URL, termasuk lat dan lng
  const { foto, u, lat, lng, nama } = req.query;
  
  // 2. Jika tidak ada foto, redirect ke halaman utama
  if (!foto) {
    res.writeHead(302, { Location: 'https://infocuaca.online/view.html' });
    res.end();
    return;
  }
  
  const fotoUrl = decodeURIComponent(foto);
  const user = u || 'images';
  const lokasiNama = nama || 'Lokasi Foto';
  
  // 3. Cek apakah koordinat lat & lng tersedia
  const hasLocation = lat && lng;
  
  // 4. Buat link Google Maps jika koordinat tersedia
  const mapsLink = hasLocation 
    ? `https://www.google.com/maps?q=${lat},${lng}` 
    : '#';

  // 5. Tampilkan halaman HTML langsung (tanpa redirect ke domain lain)
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Foto Dibagikan</title>
<meta property="og:title" content="Foto Dibagikan" />
<meta property="og:description" content="Seseorang membagikan foto kepada Anda. Klik untuk melihat lokasinya." />
<meta property="og:image" content="${fotoUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${fotoUrl}" />
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
    <img src="${fotoUrl}" alt="Foto Dibagikan">
    <br>
    ${hasLocation 
      ? `<a href="${mapsLink}" class="btn" target="_blank">📍 Lihat Lokasi Foto</a>`
      : `<a href="#" class="btn btn-disabled" onclick="alert('Lokasi foto tidak tersedia di link ini.'); return false;">📍 Lihat Lokasi Foto</a>`
    }
    <p class="footer">Akan membuka di Google Maps</p>
  </div>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(html);
}
