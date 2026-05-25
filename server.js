import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { URL } from 'node:url';
import path from 'node:path';

import contentHandler from './api/content.js';
import { loadEnvFiles } from './env.js';
import messagesHandler from './api/messages.js';
import pokeHandler from './api/poke.js';
import wishlistHandler from './api/wishlist.js';

const routes = new Map([
  ['/api/content', contentHandler],
  ['/api/messages', messagesHandler],
  ['/api/poke', pokeHandler],
  ['/api/wishlist', wishlistHandler],
]);

const rootDir = path.dirname(fileURLToPath(import.meta.url));
loadEnvFiles(rootDir);

function augmentResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  res.json = (payload) => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(payload));
    return res;
  };
}

async function readJsonBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return {};
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function buildQuery(url) {
  const query = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (key in query) {
      const current = query[key];
      query[key] = Array.isArray(current) ? [...current, value] : [current, value];
    } else {
      query[key] = value;
    }
  }
  return query;
}

function createServer() {
  return http.createServer(async (req, res) => {
    augmentResponse(res);

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const handler = routes.get(url.pathname);

    if (!handler) {
      if (url.pathname === '/' || url.pathname === '/health') {
        return res.status(200).json({ ok: true, service: 'meimei-api' });
      }
      return res.status(404).json({ error: 'Not found' });
    }

    try {
      req.query = buildQuery(url);
      req.body = await readJsonBody(req);
      await handler(req, res);
    } catch (error) {
      const message = error?.message || 'Internal server error';
      const status = message === 'Invalid JSON body' ? 400 : 500;
      if (!res.writableEnded) {
        res.status(status).json({ error: message });
      }
    }
  });
}

export { createServer };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = createServer();
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  server.listen(port, () => {
    console.log(`meimei-api listening on http://localhost:${port}`);
  });
}
