import {
  handleOptions,
  setCommonHeaders,
  getWishlistState,
  setWishlistState,
  annotateWishlistState,
} from './_store.js';

export default async function handler(req, res) {
  setCommonHeaders(res, 'GET, POST, OPTIONS');
  if (handleOptions(req, res)) return;

  try {
    if (req.method === 'GET') {
      const state = await getWishlistState();
      return res.status(200).json(state);
    }

    if (req.method === 'POST') {
      const current = await getWishlistState();
      const next = annotateWishlistState(current, {
        ...current,
        ...(req.body || {}),
        updatedAt: Date.now(),
      }, req);
      const saved = await setWishlistState(next);
      return res.status(200).json({ ok: true, data: saved });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
