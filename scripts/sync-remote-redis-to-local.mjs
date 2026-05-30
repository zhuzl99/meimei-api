import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Redis from 'ioredis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const KEYS = [
  'meimei:content',
  'meimei:wishlist',
  'meimei:messages',
];

function cleanEnvValue(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/^"(.*)"$/, '$1');
}

function readRedisBlocks() {
  const envPath = path.join(rootDir, '.env');
  const text = fs.readFileSync(envPath, 'utf8');
  const blocks = [];
  let current = null;

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(REDIS_[A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (key === 'REDIS_URL' || key === 'REDIS_HOST') {
      current = {};
      blocks.push(current);
    }

    if (!current) {
      current = {};
      blocks.push(current);
    }

    current[key] = cleanEnvValue(rawValue);
  }

  return blocks.filter((block) => block.REDIS_URL || block.REDIS_HOST);
}

function createRedisClient(config, label) {
  if (config.REDIS_URL) {
    return new Redis(config.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  }

  if (!config.REDIS_HOST) {
    throw new Error(`Missing ${label} Redis host`);
  }

  const options = {
    host: config.REDIS_HOST,
    port: Number.parseInt(config.REDIS_PORT, 10) || 6379,
    username: config.REDIS_USERNAME || undefined,
    password: config.REDIS_PASSWORD || undefined,
    db: Number.parseInt(config.REDIS_DB, 10) || 0,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  };

  if (/^(1|true|yes)$/i.test(config.REDIS_TLS || '')) {
    options.tls = {};
  }

  return new Redis(options);
}

async function close(client) {
  if (!client) return;
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

async function main() {
  const blocks = readRedisBlocks();
  if (blocks.length < 2) {
    throw new Error('Expected .env to contain local Redis first and remote Redis second');
  }

  const targetConfig = blocks[0];
  const sourceConfig = blocks[blocks.length - 1];

  const source = createRedisClient(sourceConfig, 'source');
  const target = createRedisClient(targetConfig, 'target');

  try {
    console.log('[sync] connecting to remote Redis and local Redis...');
    await Promise.all([source.connect(), target.connect()]);

    console.log('[sync] copying meimei keys from remote to local...');
    for (const key of KEYS) {
      const value = await source.get(key);
      if (value == null) {
        await target.del(key);
        console.log(`[sync] ${key}: remote missing, deleted local key`);
      } else {
        await target.set(key, value);
        console.log(`[sync] ${key}: copied ${Buffer.byteLength(value, 'utf8')} bytes`);
      }
    }

    console.log('[sync] done');
  } finally {
    await Promise.all([close(source), close(target)]);
  }
}

main().catch((error) => {
  console.error('[sync] failed:', error.message || error);
  process.exitCode = 1;
});
