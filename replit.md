# ТОПливо (TOPLIVO)

A Telegram Mini App where users buy fuel vouchers at today's price and redeem them within 90 days, locking in savings against inflation.

## Run & Operate

- `pnpm --filter @workspace/api-server run build && PORT=8080 node --enable-source-maps artifacts/api-server/dist/index.mjs` — API server (port 8080)
- `PORT=21641 BASE_PATH=/ pnpm --filter @workspace/toplivo run dev` — Frontend dev server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `CRYPTO_BOT_TOKEN`, `INTERNAL_API_SECRET`, `ADMIN_TELEGRAM_ID`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (ESM bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — all Drizzle table definitions
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/` — shared server libs (auth, cryptobot, telegram-bot, logger)
- `artifacts/toplivo/src/pages/` — React pages (map, catalog, vault, analytics, admin)
- `artifacts/toplivo/src/lib/context/user.tsx` — Telegram auth state + global API header
- `HANDOFF.md` — session continuity log (read/append every session)

## Architecture decisions

- **Contract-first API**: OpenAPI spec → `pnpm codegen` → typed React Query hooks + Zod schemas. Never hand-write API types.
- **Payment gate**: Vouchers are only created after payment is confirmed via webhook. The `payment_orders` table holds pending orders; `createVoucherFromOrder` is called only on confirmed payment.
- **Auth**: Telegram `initData` HMAC-SHA256 validated server-side. In dev (`NODE_ENV !== production`), missing header falls back to mock user.
- **Two payment methods**: CryptoBot (TON/USDT, fiat-RUB denominated invoices) + Telegram Stars (XTR, 1 Star = 2 RUB conversion).
- **Telegram webhook**: Must be re-registered on domain change. Dev domain: `REPLIT_DEV_DOMAIN`. Stars `pre_checkout_query` must be answered within 10s.

## Product

- **Map**: Shows 10,000+ fuel stations clustered on a Leaflet map
- **Catalog**: Buy fuel vouchers (AI-92/95/98, Diesel) at locked prices — pay with Telegram Stars or TON crypto
- **Vault**: View active/used/expired vouchers with QR codes
- **Analytics**: Savings tracker, price history charts, supply matrix

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT re-run `scripts/seed_stations.py` casually — it clears all existing vouchers before re-seeding stations.
- API Server workflow builds first (`pnpm run build`) then runs the pre-built dist. If code changes, rebuild.
- Telegram webhook URL must match the current domain. Re-register on deploy.
- Vite proxy (`/api → localhost:8080`) is in `artifacts/toplivo/vite.config.ts` — required for dev.

## Pointers

- See HANDOFF.md for full session history and pending tasks
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
