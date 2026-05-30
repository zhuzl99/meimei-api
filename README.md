# meimei-api

`meimei-api` is a plain Node.js HTTP API service for the wishlist frontend. In production, Nginx serves `meimei-wishlist` static files directly and reverse proxies `/api/*` to this Node service.

## Scripts

```bash
npm install
npm run dev
npm start
npm run sync:remote-redis
```

The service listens on `PORT`. It does not serve frontend static files. It exposes:

- `GET/POST /api/content`
- `GET/POST/DELETE /api/messages`
- `POST /api/poke`
- `GET/POST /api/wishlist`
- `GET /api/health`

## Environment Variables

Create `.env` in this directory on the server:

```bash
PORT=3000

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_TLS=false

EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
POKE_TO_EMAIL=
POKE_FROM_NAME=
```

`REDIS_URL` is also supported:

```bash
REDIS_URL=redis://default:password@127.0.0.1:6379/0
```

Production runtime no longer falls back to Serverless KV.

## Sync Data From Remote Redis

During migration, `.env` can keep local Redis config first and remote Redis/Tair config later. `npm start` uses the first Redis block through `env.js`, while the sync script copies data from the last Redis block into the first one.

```bash
npm run sync:remote-redis
```

The sync script copies:

- `meimei:content`
- `meimei:wishlist`
- `meimei:messages`

from remote Redis/Tair into local Redis. It overwrites local values for those keys.

## BaoTa Deployment

1. Install Node.js, Redis, and Nginx from BaoTa.
2. Enable Redis persistence in BaoTa Redis settings, preferably AOF plus regular snapshots/backups.
3. Upload or pull both projects onto the server:
   - frontend: `meimei-wishlist`
   - backend: `meimei-api`
4. In `meimei-api`, run `npm install` and create `.env`.
5. Create a BaoTa Node project or PM2 process:
   - project directory: `meimei-api`
   - start command: `npm start`
   - port: `3000`
6. Create the website in BaoTa with the site root pointing to `meimei-wishlist`. Nginx will serve `index.html`, `sw.js`, `manifest.json`, icons, and other static files directly.
7. Add this Nginx reverse proxy config to the website. Only `/api/*` requests should go to Node:

```nginx
location /api/ {
  proxy_pass http://127.0.0.1:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

8. Enable HTTPS for the domain in BaoTa.
9. Verify:

```bash
curl https://your-domain/api/health
curl https://your-domain/api/content
curl https://your-domain/api/wishlist
curl https://your-domain/api/messages
```

The frontend uses same-origin `/api/*`, so no Alibaba Cloud Function Compute domain is required.

For local testing with the same topology, run `meimei-api` on port 3000 and use Nginx, BaoTa local site, or another static server for `meimei-wishlist`, with `/api/` proxied to `http://127.0.0.1:3000`.
