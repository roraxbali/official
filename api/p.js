export default function handler(req, res) {
  const { foto, u } = req.query;
  
  if (!foto) {
    res.writeHead(302, { Location: 'https://infocuaca.online/view.html' });
    res.end();
    return;
  }
  
  const fotoUrl = decodeURIComponent(foto);
  const user = u || 'images';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Shared Photo</title>
<meta property="og:title" content="Shared Photo" />
<meta property="og:description" content="A photo has been shared with you. View the photo and its location details." />
<meta property="og:image" content="${fotoUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="infocuaca.online" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Shared Photo" />
<meta name="twitter:description" content="A photo has been shared with you. View the photo and its location details." />
<meta name="twitter:image" content="${fotoUrl}" />
<meta http-equiv="refresh" content="0;url=https://infocuaca.online/view.html?foto=${encodeURIComponent(fotoUrl)}&u=${encodeURIComponent(user)}" />
</head>
<body><p style="font-family:sans-serif;text-align:center;padding:40px">Redirecting...</p></body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(html);
}
