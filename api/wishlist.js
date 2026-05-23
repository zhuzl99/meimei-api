export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  if (req.method === 'GET') {
    const r = await fetch(`${url}/get/meimei:wishlist`, { headers, cache: 'no-store' });
    const d = await r.json();
    const data = d.result ? JSON.parse(d.result) : null;
    return res.status(200).json(data || {
      done:[28,29], userWishes:[], history:{},
      capsuleOpened:[false,false,false], shownMilestones:[], updatedAt:0
    });
  }

  if (req.method === 'POST') {
    const value = JSON.stringify(req.body);
    const r = await fetch(`${url}/set/meimei:wishlist`, {
      method: 'POST', headers,
      body: JSON.stringify(value)
    });
    const d = await r.json();
    console.log('set result:', JSON.stringify(d));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
