export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function getMsgs() {
    const r = await fetch(`${url}/get/meimei:messages`, { headers, cache: 'no-store' });
    const d = await r.json();
    if (!d.result) return [];
    try {
      const parsed = JSON.parse(d.result);
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) { return []; }
  }

  async function setMsgs(msgs) {
    await fetch(`${url}/set/meimei:messages`, {
      method: 'POST', headers,
      body: JSON.stringify(JSON.stringify(msgs))
    });
  }

  if (req.method === 'GET') {
    const msgs = await getMsgs();
    return res.status(200).json(msgs);
  }

  if (req.method === 'POST') {
    const msgs = await getMsgs();
    msgs.unshift({ ...req.body, id: Date.now() });
    if (msgs.length > 100) msgs.pop();
    await setMsgs(msgs);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const msgs = await getMsgs();
    await setMsgs(msgs.filter(m => m.id !== parseInt(id)));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
