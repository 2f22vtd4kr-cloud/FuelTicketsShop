---
name: Production hardening decisions
description: Key choices made when hardening the API server and frontend for production.
---

# Production Hardening Decisions

## Rate limiting (express-rate-limit)
- General: 200 req/min per IP on `/api/*`
- Payment creation: 15 req/min on `/api/payments/create-order`
- Both limits skip in dev (`NODE_ENV !== production`) so dev flow is unaffected.
- **Why:** Payment endpoint is expensive (calls CryptoBot/Telegram API); tight limit prevents abuse.

## CORS
- Dev: all origins allowed.
- Production: restricted to `web.telegram.org`, `webk.telegram.org`, `webz.telegram.org`.
- **Why:** Mini App runs inside Telegram's WebView; no other origin needs cross-origin API access.

## CryptoBot webhook raw body
- `express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } })` captures raw bytes.
- CryptoBot handler uses `(req as any).rawBody?.toString()` for HMAC-SHA256 verification.
- **Why:** Re-serializing parsed JSON with `JSON.stringify(req.body)` does not reproduce the original byte sequence, so the signature will always fail.

## isAdmin sync on every auth
- `users.ts` sets `isAdmin` on both INSERT and UPDATE.
- **Why:** If `ADMIN_TELEGRAM_ID` changes or the admin user already existed in DB, the old INSERT-only approach would leave `isAdmin = false` permanently until row is deleted.

## Market price caching
- `lib/market-prices.ts` → `getMarketPrices()` caches DB averages for 5 min in memory.
- `invalidatePriceCache()` exported for future use if admin manually triggers price refresh.

## Price history auto-seed
- `seedPriceHistoryIfEmpty()` runs on startup. Generates 30 days of synthetic history if table is empty.
- Based on real DB averages + small random drift (simulates price creep).

## QR code library
- `qrcode.react` → `<QRCodeSVG value={voucher.qrCode} size={200} level="M" />`
- The `qrCode` string stored in DB is `TOPLIVO-{id}-{6hexbytes}` generated at voucher creation.

## Telegram webhook auto-registration
- `index.ts` calls `setWebhook()` on startup using `BOT_WEBHOOK_URL ?? https://${REPLIT_DEV_DOMAIN}`.
- Set `BOT_WEBHOOK_URL` in production to override the dev domain.

## Admin auth
- All `/admin/*` routes use `requireAuth` middleware (Telegram initData) + `isAdmin` DB check.
- Frontend admin page gates purely on `user?.isAdmin` — no PIN, no secret.
