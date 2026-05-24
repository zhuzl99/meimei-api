import {
  handleOptions,
  setCommonHeaders,
  getContentPayload,
  setContentPayload,
  normalizeContentPayload,
} from './_store.js';

export default async function handler(req, res) {
  setCommonHeaders(res, 'GET, POST, OPTIONS');
  if (handleOptions(req, res)) return;

  try {
    if (req.method === 'GET') {
      const content = await getContentPayload();
      return res.status(200).json(content);
    }

    if (req.method === 'POST') {
      const current = await getContentPayload();
      const next = normalizeContentPayload({
        ...current,
        ...(req.body || {}),
      });
      const saved = await setContentPayload(next);
      return res.status(200).json({ ok: true, data: saved });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
