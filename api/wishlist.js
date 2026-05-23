const KV_URL = 'https://prompt-spaniel-134776.upstash.io';
const KV_TOKEN = 'gQAAAAAAg54AAIgcDFmZDg5ZTE0NjE4ODU0ZjM2OTIwMGJmZjQ1NmRkZjNiYQ';

async function kvGet(key) {
  const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: 'no-store'
  });
  const d = await r.json();
  if (!d.result) return null;
  try { return JSON.parse(d.result); } catch(e) { return null; }
}

async function kvSet(key, value) {
  // Upstash REST API: POST /set/key with body as the value string
  const r = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(JSON.stringify(value))
  });
  const d = await r.json();
  console.log('kvSet result:', JSON.stringify(d));
  return d;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const data = await kvGet('meimei:wishlist');
      console.log('GET data:', JSON.stringify(data));
      return res.status(200).json(data || {
        done: [28,29], userWishes: [], history: {},
        capsuleOpened: [false,false,false], shownMilestones: [], updatedAt: 0
      });
    } catch(e) {
      console.error('GET error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('POST body done:', JSON.stringify(body.done));
      await kvSet('meimei:wishlist', body);
      // verify write
      const verify = await kvGet('meimei:wishlist');
      console.log('verify done:', JSON.stringify(verify?.done));
      return res.status(200).json({ ok: true, written: verify?.done });
    } catch(e) {
      console.error('POST error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
