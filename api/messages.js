import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const KEY = 'meimei:messages';

  if (req.method === 'GET') {
    try {
      const msgs = await kv.get(KEY);
      return res.status(200).json(msgs || []);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const msg = req.body;
      const msgs = (await kv.get(KEY)) || [];
      msgs.unshift({ ...msg, id: Date.now() });
      if (msgs.length > 100) msgs.pop();
      await kv.set(KEY, msgs);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const msgs = (await kv.get(KEY)) || [];
      const filtered = msgs.filter(m => m.id !== parseInt(id));
      await kv.set(KEY, filtered);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
