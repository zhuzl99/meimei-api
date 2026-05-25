# meimei-api

`meimei-api` has been refactored into a generic Node.js HTTP service so it can run on Alibaba Cloud Function Compute, SAE, or a plain VM without depending on Vercel routing.

## Scripts

```bash
npm install
npm run dev
npm start
npm run reset:data
```

The service listens on `PORT` and exposes:

- `GET/POST /api/content`
- `GET/POST/DELETE /api/messages`
- `POST /api/poke`
- `GET/POST /api/wishlist`
- `GET /health`

## Redis Environment Variables

Use either:

```bash
REDIS_URL=redis://default:password@host:6379/0
```

If the password contains reserved URL characters such as `#`, `@`, `:`, `/`, `?`, or `(`, either URL-encode it first or prefer the explicit host/port/password variables below.

or:

```bash
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_USERNAME=default
REDIS_TLS=false
```

## Transitional Compatibility

If Redis is not configured yet, the service can still fall back to the existing REST-based KV variables during migration:

```bash
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

This lets you migrate in two phases:

1. Move from Vercel routing to the generic Node service.
2. Switch storage from REST KV to Alibaba Cloud Tair / Redis.

## Mail Environment Variables

```bash
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
POKE_TO_EMAIL=
POKE_FROM_NAME=
```

## Alibaba Cloud Mapping

- Runtime: Function Compute custom runtime or Node.js web app
- Storage: Tair / Redis-compatible instance
- Domain: Function Compute custom domain

For mainland production, use an ICP-filed domain before switching traffic.
