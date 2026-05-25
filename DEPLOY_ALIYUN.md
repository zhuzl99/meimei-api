# Deploy `meimei-api` To Alibaba Cloud

This project now runs as a generic Node.js HTTP service. The recommended Alibaba Cloud target is:

- Runtime: Function Compute
- Storage: Tair / Redis-compatible instance
- Domain: Function Compute custom domain

## 1. Prepare Redis

Create a Tair or Redis-compatible instance and record:

- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `REDIS_DB`
- `REDIS_USERNAME` if required
- `REDIS_TLS` if the instance requires TLS

You can also use a single `REDIS_URL`.

## 2. Prepare Environment Variables

At minimum:

```bash
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
POKE_TO_EMAIL=
POKE_FROM_NAME=
```

## 3. Local Verification

```bash
npm install
npm start
```

Health check:

```bash
GET /health
```

## 4. Function Compute Deployment Notes

Deploy this repo as a Node.js web application and expose `server.js` as the startup entry.

Expected behavior:

- FC forwards HTTP traffic to the Node process
- The service listens on `PORT`
- API paths stay unchanged:
  - `/api/content`
  - `/api/messages`
  - `/api/poke`
  - `/api/wishlist`

## 5. Data Initialization

After Redis is ready, run:

```bash
npm run reset:data
```

This initializes:

- `meimei:content`
- `meimei:wishlist`
- `meimei:messages`

## 6. Frontend Switch

After FC and the custom domain are ready, update `meimei-wishlist` to use the new API base domain.
