import {
  handleOptions,
  setCommonHeaders,
  getMessages,
  setMessages,
} from './_store.js';

export default async function handler(req, res) {
  setCommonHeaders(res, 'GET, POST, DELETE, OPTIONS');
  if (handleOptions(req, res)) return;

  try {
    if (req.method === 'GET') {
      const msgs = await getMessages();
      return res.status(200).json(msgs);
    }

    if (req.method === 'POST') {
      const msgs = await getMessages();
      msgs.unshift({ ...req.body, id: Date.now() });
      if (msgs.length > 100) msgs.length = 100;
      await setMessages(msgs);
      return res.status(200).json({ ok: true, data: msgs });
    }

    if (req.method === 'DELETE') {
      const id = Number.parseInt(req.query.id, 10);
      const msgs = await getMessages();
      const next = msgs.filter((m) => m.id !== id);
      await setMessages(next);
      return res.status(200).json({ ok: true, data: next });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
