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
  // Kita pakai domain infocuaca.online karena di situlah view.html berada
  // (sesuai kode lama Anda yang redirect ke https://infocuaca.online/view.html)
  let redirectUrl = 'https://infocuaca.online/view.html?foto=' + encodeURIComponent(foto) + '&u=' + encodeURIComponent(user);
  
  if (lat) redirectUrl += '&lat=' + lat;
  if (lng) redirectUrl += '&lng=' + lng;
  if (nama) redirectUrl += '&nama=' + encodeURIComponent(nama);

  // 4. Redirect (alihkan) ke view.html
  // Menggunakan 302 (Found) agar browser mengikuti redirect
  res.writeHead(302, { Location: redirectUrl });
  res.end();
}
