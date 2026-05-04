export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const base = 'https://imir.ecotrack.dz';
  const path = req.query.path || '/api/v1/statistics';
  const url  = `${base}${path}`;

  try {
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json, text/html, */*',
        'User-Agent': 'Mozilla/5.0',
        'Referer': base,
        'Origin': base,
      }
    };

    // Forward cookies for session auth
    if (req.headers.cookie) {
      options.headers['Cookie'] = req.headers.cookie;
    }

    // Forward body for POST
    if (req.method === 'POST' && req.body) {
      const params = new URLSearchParams();
      Object.entries(req.body).forEach(([k, v]) => params.append(k, v));
      options.body = params.toString();
    }

    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';

    // Forward cookies from response
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) res.setHeader('Set-Cookie', setCookie);

    if (contentType.includes('json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', response.headers.get('content-disposition') || 'attachment');
      res.status(response.status).send(Buffer.from(buffer));
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
