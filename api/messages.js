export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  if (req.method === 'GET') {
    const r = await fetch(`${url}/get/meimei:messages`, { headers, cache: 'no-store' });
    const d = await r.json();
    const data = d.result ? JSON.parse(d.result) : [];
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const r0 = await fetch(`${url}/get/meimei:messages`, { headers, cache: 'no-store' });
    const d0 = await r0.json();
    const msgs = d0.result ? JSON.parse(d0.result) : [];
    msgs.unshift({ ...req.body, id: Date.now() });
    if (msgs.length > 100) msgs.pop();
    await fetch(`${url}/set/meimei:messages`, {
      method: 'POST', headers, body: JSON.stringify(JSON.stringify(msgs))
    });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const r0 = await fetch(`${url}/get/meimei:messages`, { headers, cache: 'no-store' });
    const d0 = await r0.json();
    const msgs = d0.result ? JSON.parse(d0.result) : [];
    const filtered = msgs.filter(m => m.id !== parseInt(id));
    await fetch(`${url}/set/meimei:messages`, {
      method: 'POST', headers, body: JSON.stringify(JSON.stringify(filtered))
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
