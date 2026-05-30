import Redis from 'ioredis';

const WISHLIST_KEY = 'meimei:wishlist';
const MESSAGES_KEY = 'meimei:messages';
const CONTENT_KEY = 'meimei:content';

let redisClient = null;

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

function buildRedisOptions() {
  const host = cleanEnvValue(process.env.REDIS_HOST);
  const port = Number.parseInt(cleanEnvValue(process.env.REDIS_PORT), 10) || 6379;
  const password = cleanEnvValue(process.env.REDIS_PASSWORD);
  const db = Number.parseInt(cleanEnvValue(process.env.REDIS_DB), 10) || 0;
  const username = cleanEnvValue(process.env.REDIS_USERNAME);
  const useTls = /^(1|true|yes)$/i.test(cleanEnvValue(process.env.REDIS_TLS));

  if (host) {
    const options = {
      host,
      port,
      password: password || undefined,
      username: username || undefined,
      db,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    };

    if (useTls) {
      options.tls = {};
    }

    return { options };
  }

  const redisUrl = cleanEnvValue(process.env.REDIS_URL);
  if (redisUrl) {
    return {
      url: redisUrl,
      options: {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      },
    };
  }
  throw new Error('Missing REDIS_URL or REDIS_HOST');
}

export function getRedisClient() {
  if (redisClient) return redisClient;
  const config = buildRedisOptions();
  redisClient = config.url
    ? new Redis(config.url, config.options)
    : new Redis(config.options);
  return redisClient;
}

export async function closeRedisClient() {
  if (!redisClient) return;
  const client = redisClient;
  redisClient = null;
  if (client.status === 'ready') {
    try {
      await client.quit();
      return;
    } catch {
      client.disconnect();
      return;
    }
  }
  client.disconnect();
}

async function kvGet(key) {
  const redis = getRedisClient();
  const result = await redis.get(key);
  return { result };
}

async function kvSet(key, value) {
  const redis = getRedisClient();
  await redis.set(key, JSON.stringify(value));
  return { result: 'OK' };
}

export async function deleteStoreKey(key) {
  const redis = getRedisClient();
  await redis.del(key);
}

export function defaultWishlistState() {
  return {
    done: [],
    userWishes: [],
    baseWishOverrides: {},
    capsuleOpened: [],
    sealClicks: 0,
    secretWishUnlocked: false,
    history: {},
    shownMilestones: [],
    togetherWishes: [],
    himWishes: [],
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
    history: next.history && typeof next.history === 'object' ? next.history : base.history,
    sealClicks: Number.isFinite(next.sealClicks) ? next.sealClicks : base.sealClicks,
    secretWishUnlocked: Boolean(next.secretWishUnlocked),
    muyuCount: Number.isFinite(next.muyuCount) ? next.muyuCount : base.muyuCount,
    updatedAt: Number.isFinite(next.updatedAt) ? next.updatedAt : base.updatedAt,
  };
}

function formatHistoryDate(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date).replace(/\//g, '-');
}

function getRequestIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded || realIp || req.socket?.remoteAddress || '';
  const first = String(raw).split(',')[0].trim();
  if (!first) return '';
  const normalized = first.replace(/^::ffff:/, '');
  if (normalized === '::1' || normalized === '127.0.0.1' || normalized === 'localhost') return '';
  return normalized;
}

function normalizeHistoryEntry(entry) {
  if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
    return {
      date: typeof entry.date === 'string' ? entry.date : '',
      text: typeof entry.text === 'string' ? entry.text : '',
      loc: typeof entry.loc === 'string' ? entry.loc : '',
      ip: typeof entry.ip === 'string' ? entry.ip : '',
      source: typeof entry.source === 'string' ? entry.source : '',
    };
  }
  return {
    date: typeof entry === 'string' ? entry : '',
    text: '',
    loc: '',
    ip: '',
    source: '',
  };
}

function mergeHistoryEntry(currentEntry, nextEntry, stamp) {
  const current = normalizeHistoryEntry(currentEntry);
  const next = normalizeHistoryEntry(nextEntry);
  return {
    ...next,
    date: current.date || next.date || stamp.date,
    ip: current.ip || next.ip || stamp.ip,
    source: current.source || next.source || '',
  };
}

function annotateMainHistory(currentState, nextState, stamp) {
  const nextHistory = nextState.history && typeof nextState.history === 'object' ? nextState.history : {};
  const currentHistory = currentState.history && typeof currentState.history === 'object' ? currentState.history : {};
  const annotated = {};

  Object.entries(nextHistory).forEach(([key, value]) => {
    const nextEntries = Array.isArray(value) ? value : [];
    const currentEntries = Array.isArray(currentHistory[key]) ? currentHistory[key] : [];
    annotated[key] = nextEntries.map((entry, index) => mergeHistoryEntry(currentEntries[index], entry, stamp));
  });

  nextState.history = annotated;
}

function annotateCheckableList(currentList, nextList, stamp) {
  return (Array.isArray(nextList) ? nextList : []).map((item, index) => {
    const safeItem = item && typeof item === 'object' ? item : {};
    const currentItem = Array.isArray(currentList) ? currentList[index] : null;
    const currentHistory = Array.isArray(currentItem?.history) ? currentItem.history : [];
    const nextHistory = Array.isArray(safeItem.history) ? safeItem.history : [];

    return {
      ...safeItem,
      text: typeof safeItem.text === 'string' ? safeItem.text : '',
      done: Boolean(safeItem.done),
      history: nextHistory.map((entry, entryIndex) => mergeHistoryEntry(currentHistory[entryIndex], entry, stamp)),
    };
  });
}

export function annotateWishlistState(currentState, nextState, req) {
  const stamp = {
    date: formatHistoryDate(new Date()),
    ip: getRequestIp(req),
  };
  const annotated = normalizeWishlistState(nextState);
  annotateMainHistory(normalizeWishlistState(currentState), annotated, stamp);
  annotated.togetherWishes = annotateCheckableList(currentState.togetherWishes, annotated.togetherWishes, stamp);
  annotated.himWishes = annotateCheckableList(currentState.himWishes, annotated.himWishes, stamp);
  return annotated;
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
