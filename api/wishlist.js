const KV_URL = 'https://prompt-spaniel-134776.upstash.io';
const KV_TOKEN = 'gQAAAAAAg54AAIgcDFmZDg5ZTE0NjE4ODU0ZjM2OTIwMGJmZjQ1NmRkZjNiYQ';

async function kvGet(key) {
  const r = await fetch(`${KV_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  const d = await r.json();
  return d.result ? JSON.parse(d.result) : null;
}

async function kvSet(key, value) {
  await fetch(`${KV_URL}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.stringify(value))
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const data = await kvGet('meimei:wishlist');
    return res.status(200).json(data || {
      done: [28, 29], userWishes: [], history: {},
      capsuleOpened: [false, false, false], shownMilestones: []
    });
  }

  if (req.method === 'POST') {
    await kvSet('meimei:wishlist', req.body);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
