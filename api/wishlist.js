const KV_URL = 'https://prompt-spaniel-134776.upstash.io';
const KV_TOKEN = 'gQAAAAAAg54AAIgcDFmZDg5ZTE0NjE4ODU0ZjM2OTIwMGJmZjQ1NmRkZjNiYQ';
const HEADERS = { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' };

// Use Upstash pipeline API for reliable read/write
async function kvGet(key) {
  const r = await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify([["GET", key]]),
    cache: 'no-store'
  });
  const d = await r.json();
  console.log('kvGet raw:', JSON.stringify(d));
  const result = d[0]?.result;
  if (!result) return null;
  try { return JSON.parse(result); } catch(e) { return null; }
}

async function kvSet(key, value) {
  const r = await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify([["SET", key, JSON.stringify(value)]])
  });
  const d = await r.json();
  console.log('kvSet raw:', JSON.stringify(d));
  return d;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const data = await kvGet('meimei:wishlist');
    console.log('GET result:', JSON.stringify(data));
    return res.status(200).json(data || {
      done:[28,29], userWishes:[], history:{},
      capsuleOpened:[false,false,false], shownMilestones:[], updatedAt:0
    });
  }

  if (req.method === 'POST') {
    const body = req.body;
    console.log('POST done:', JSON.stringify(body?.done));
    await kvSet('meimei:wishlist', body);
    const verify = await kvGet('meimei:wishlist');
    console.log('verify done:', JSON.stringify(verify?.done));
    return res.status(200).json({ ok: true, verified: verify?.done });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
