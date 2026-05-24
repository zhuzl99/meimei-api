const WISHLIST_KEY = 'meimei:wishlist';
const MESSAGES_KEY = 'meimei:messages';
const CONTENT_KEY = 'meimei:content';

function cleanEnvValue(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^"(.*)"$/, '$1');
}

function parseKvResult(value) {
  if (typeof value !== 'string') return value;
  return JSON.parse(value);
}

export function setCommonHeaders(res, methods) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

export function getKvEnv() {
  const url = cleanEnvValue(process.env.KV_REST_API_URL);
  const token = cleanEnvValue(process.env.KV_REST_API_TOKEN);
  if (!url || !token) {
    throw new Error('Missing KV_REST_API_URL or KV_REST_API_TOKEN');
  }
  return {
    url,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

async function kvGet(key) {
  const { url, headers } = getKvEnv();
  const r = await fetch(`${url}/get/${key}`, { headers, cache: 'no-store' });
  if (!r.ok) {
    throw new Error(`KV GET failed: ${r.status}`);
  }
  return r.json();
}

async function kvSet(key, value) {
  const { url, headers } = getKvEnv();
  const r = await fetch(`${url}/set/${key}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(value),
  });
  if (!r.ok) {
    throw new Error(`KV SET failed: ${r.status}`);
  }
  return r.json();
}

export function defaultWishlistState() {
  return {
    done: [],
    userWishes: [],
    baseWishOverrides: {},
    capsuleOpened: [],
    sealClicks: 0,
    history: {},
    shownMilestones: [],
    togetherWishes: [],
    himWishes: [],
    messages: [],
    muyuCount: 0,
    updatedAt: 0,
  };
}

export function defaultContentPayload() {
  return {
    originalWishes: [],
    wish31: {
      text: '',
      special: true,
      tag: '',
    },
    capsules: [],
    wishRewards: {},
    milestones: {},
    quotes: [],
  };
}

export function normalizeContentPayload(data) {
  const base = defaultContentPayload();
  const next = data && typeof data === 'object' ? data : {};
  return {
    ...base,
    ...next,
    originalWishes: Array.isArray(next.originalWishes) ? next.originalWishes : base.originalWishes,
    wish31: next.wish31 && typeof next.wish31 === 'object' ? next.wish31 : base.wish31,
    capsules: Array.isArray(next.capsules) ? next.capsules : base.capsules,
    wishRewards: next.wishRewards && typeof next.wishRewards === 'object' ? next.wishRewards : base.wishRewards,
    milestones: next.milestones && typeof next.milestones === 'object' ? next.milestones : base.milestones,
    quotes: Array.isArray(next.quotes) ? next.quotes : base.quotes,
  };
}

export function normalizeWishlistState(data) {
  const base = defaultWishlistState();
  const next = data && typeof data === 'object' ? data : {};
  return {
    ...base,
    ...next,
    done: Array.isArray(next.done) ? next.done : base.done,
    userWishes: Array.isArray(next.userWishes) ? next.userWishes : base.userWishes,
    baseWishOverrides: next.baseWishOverrides && typeof next.baseWishOverrides === 'object' ? next.baseWishOverrides : base.baseWishOverrides,
    capsuleOpened: Array.isArray(next.capsuleOpened) ? next.capsuleOpened : base.capsuleOpened,
    shownMilestones: Array.isArray(next.shownMilestones) ? next.shownMilestones : base.shownMilestones,
    togetherWishes: Array.isArray(next.togetherWishes) ? next.togetherWishes : base.togetherWishes,
    himWishes: Array.isArray(next.himWishes) ? next.himWishes : base.himWishes,
    messages: Array.isArray(next.messages) ? next.messages : base.messages,
    history: next.history && typeof next.history === 'object' ? next.history : base.history,
    sealClicks: Number.isFinite(next.sealClicks) ? next.sealClicks : base.sealClicks,
    muyuCount: Number.isFinite(next.muyuCount) ? next.muyuCount : base.muyuCount,
    updatedAt: Number.isFinite(next.updatedAt) ? next.updatedAt : base.updatedAt,
  };
}

export async function getWishlistState() {
  const d = await kvGet(WISHLIST_KEY);
  const parsed = d.result ? parseKvResult(d.result) : null;
  return normalizeWishlistState(parsed);
}

export async function setWishlistState(state) {
  const normalized = normalizeWishlistState(state);
  await kvSet(WISHLIST_KEY, normalized);
  return normalized;
}

export async function getMessages() {
  const d = await kvGet(MESSAGES_KEY);
  if (!d.result) return [];
  try {
    const parsed = parseKvResult(d.result);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setMessages(messages) {
  const safe = Array.isArray(messages) ? messages : [];
  await kvSet(MESSAGES_KEY, safe);
  return safe;
}

export async function getContentPayload() {
  const d = await kvGet(CONTENT_KEY);
  if (!d.result) return defaultContentPayload();
  try {
    const parsed = parseKvResult(d.result);
    return normalizeContentPayload(parsed);
  } catch {
    return defaultContentPayload();
  }
}

export async function setContentPayload(content) {
  const normalized = normalizeContentPayload(content);
  await kvSet(CONTENT_KEY, normalized);
  return normalized;
}
