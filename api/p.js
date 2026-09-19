export default function handler(req, res) {
  // 1. Ambil URL lengkap setelah tanda tanya (?)
  const queryString = req.url.split('?')[1] || '';
  
  // 2. Pecah berdasarkan tanda '&' untuk mendapatkan setiap parameter
  const params = {};
  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  });

  // 3. Ambil data dari params
  const foto = params.foto;
  const lat = params.lat;
  const lng = params.lng;
  const user = params.u || 'images';

  // 4. Jika tidak ada foto, tampilkan error
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

  // 5. Cek apakah lokasi tersedia
  const hasLocation = lat && lng;
  const mapsLink = hasLocation 
    ? `https://www.google.com/maps?q=${lat},${lng}` 
    : '#';

  // 6. Tampilkan HTML
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
