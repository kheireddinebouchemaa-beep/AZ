export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    // Get the export page to extract CSRF token
    const cookies = req.headers.cookie || req.query.cookies || '';
    const response = await fetch('https://imir.ecotrack.dz/admin/excel/data', {
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html',
        'Referer': 'https://imir.ecotrack.dz',
      }
    });

    const html = await response.text();
    const match = html.match(/name="_token"\s+value="([^"]+)"/);
    const token = match ? match[1] : null;

    // Forward session cookies
    const setCookie = response.headers.get('set-cookie');

    res.status(200).json({
      token,
      status: response.status,
      cookies: setCookie,
      authenticated: response.status === 200 && !!token
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
