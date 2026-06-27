# HANDOFF.md — Session Continuity Log

> **Mandatory**: Every session must read this file at the start and append a new entry at the end before finishing. This keeps context alive across repo imports and cold starts.

---

## Project: ТОПливо (TOPLIVO)

A Telegram Mini App for fuel voucher management. Users buy fuel at today's price and redeem it within 90 days regardless of price hikes. Mobile-first React frontend + Express backend, PostgreSQL database, pnpm monorepo.

---

## How to Resume After a Cold Start (Repo Import)

1. **Read this file top-to-bottom** — understand what was done last session and what's pending.
2. **Check env vars** — `DATABASE_URL`, `PORT`, `INTERNAL_API_SECRET` must be set in Replit Secrets.
3. **Start workflows** — two workflows are needed:
   - API server: `pnpm --filter @workspace/api-server run dev` (port from `PORT` env var, default 5000)
   - Frontend: `pnpm --filter @workspace/toplivo run dev` (port from `PORT` env var for the artifact)
4. **Register artifacts** if not visible in the preview dropdown — use the `artifacts` skill.
5. **Pick up pending tasks** from the bottom of this file.

---

## Architecture Summary

| Layer | Package | Notes |
|---|---|---|
| Frontend | `artifacts/toplivo` | React 19, Vite, Tailwind 4, Shadcn, Framer Motion, React Leaflet, TanStack Query, Wouter |
| Backend | `artifacts/api-server` | Express 5, Node 24, Pino logging |
| Database | `lib/db` | PostgreSQL, Drizzle ORM, drizzle-kit for migrations |
| API Contract | `lib/api-spec` | OpenAPI 3.1 YAML — source of truth |
| Generated Client | `lib/api-client-react` | Orval-generated React Query hooks |
| Generated Validation | `lib/api-zod` | Orval-generated Zod schemas |
| UI Sandbox | `artifacts/mockup-sandbox` | Isolated Vite sandbox for component prototyping |

**Golden rule**: Edit `lib/api-spec/openapi.yaml` → run codegen → types flow everywhere.  
Codegen command: `pnpm --filter @workspace/api-spec run codegen`  
DB push command: `pnpm --filter @workspace/db run push`

---

## Known Issues / Incomplete Areas

- **Auth**: Telegram auth (`/users/auth`) is minimal. User identity relies on insecure `x-telegram-id` header — needs proper Telegram `initData` validation.
- **Market prices**: `getMarketPrices` uses hardcoded constants + `Math.random()` — not real data.
- **Analytics**: `getAnalyticsSummary` uses simulated aggregations.
- **Broadcast**: `/admin/broadcast` endpoint lists users but does NOT call Telegram Bot API — messages are never actually sent.
- **Admin security**: `checkAdmin` is a simple secret string comparison, not robust.

---

## Session Log

---

### Session 1 — 2026-06-27

**Status at start**: Fresh repo import. No workflows configured, no artifacts registered in Replit. Codebase fully written and functional in code.

**What was done**:
- Explored the full project structure and documented the architecture above.
- Created this HANDOFF.md file to ensure continuity across sessions.
- User confirmed this file is **mandatory** and must be updated every session.
- Artifacts were auto-registered by Replit: `toplivo` (web, `/`), `api-server` (api, `/api`), `mockup-sandbox` (design, `/__mockup`).

**Station seeding — key findings**:
- User provided new Kardeks xlsx: `attached_assets/Spisok_AZS_Kardeks_1782580569294.xlsx` (13,892 rows, dated 11.06.2026).
- **The new file is content-identical to the old one** (`Spisok_AZS_Kardeks_1782577646945.xlsx`) — same 11,318 fuel rows, same brands, same structure.
- Crimea entries in the xlsx are car washes/services (no Бензин/ДТ) → **0 fuel stations** from file.
- Crimea, ДНР, ЛНР, Херсонская, Запорожская stations come entirely from `EXTRA_STATIONS` in `scripts/seed_stations.py` (47 hardcoded entries).
- Updated seed script to point to new file path.
- **Seed script completed successfully on 2026-06-27** → 10,234 stations + 37,075 price rows in DB.

**Seed script details** (`scripts/seed_stations.py`):
- Source file: `attached_assets/Spisok_AZS_Kardeks_1782580569294.xlsx`
- Skips first 4 rows (headers). Filters rows where col[8] or col[9] == `+` (Бензин/ДТ).
- Maps city/region names to lat/lng via `CITY_COORDS` / `REGION_COORDS` dicts + random jitter.
- Clears all existing stations/prices/vouchers before inserting.
- Requires `openpyxl` and `psycopg2` Python packages (`pip install openpyxl psycopg2`).
- Requires `DATABASE_URL` env var.

**Workflows running (set up 2026-06-27)**:
- `API Server` — `cd /home/runner/workspace && PORT=8080 node --enable-source-maps artifacts/api-server/dist/index.mjs` (console, port 8080)
  - **IMPORTANT**: Must use this direct node command, NOT `pnpm run dev`. The pnpm dev script causes EADDRINUSE race on port 8080.
  - Pre-built binary at `artifacts/api-server/dist/index.mjs`. Rebuild with `pnpm --filter @workspace/api-server run build` if code changes.
- `artifacts/toplivo: web` — auto-managed by platform (Vite dev server, port 21641)
- `artifacts/mockup-sandbox: Component Preview Server` — auto-managed by platform

**Bug fixed 2026-06-27**:
- `artifacts/toplivo/src/pages/map.tsx` had wrong import path for MarkerCluster CSS.
  - Was: `react-leaflet-cluster/lib/assets/MarkerCluster.css`
  - Fixed to: `react-leaflet-cluster/dist/assets/MarkerCluster.css` (same for Default.css)

**Pending / Next steps**:
- All secrets set: `DATABASE_URL`, `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`, `INTERNAL_API_SECRET`, `CRYPTO_BOT_TOKEN`, `ADMIN_TELEGRAM_ID`.
- DB schema pushed + seeded — do NOT re-run seed script casually, it clears all vouchers.
- Address known issues listed above (auth, broadcast, real market prices).

---

### Session 2 — 2026-06-27

**Status at start**: Auth was still insecure (`x-telegram-id` header, no validation). Files `telegram-auth.ts` and `auth.ts` were created but routes/frontend not yet updated.

**What was done**:
- Rewrote `artifacts/api-server/src/routes/users.ts` — `/auth` now validates initData via HMAC-SHA256 (or falls back to body fields in dev); `/me` protected by `requireAuth` middleware.
- Rewrote `artifacts/api-server/src/routes/vouchers.ts` — all routes (`GET /`, `POST /`, `GET /:id`, `POST /:id/activate`) protected by `requireAuth` with ownership checks.
- Added `setDefaultHeader(name, value)` to `lib/api-client-react/src/custom-fetch.ts` — sets module-level headers on every API request.
- Exported `setDefaultHeader` from `lib/api-client-react/src/index.ts`.
- Rewrote `artifacts/toplivo/src/lib/context/user.tsx` — calls `setDefaultHeader("x-telegram-initdata", initData)` before the auth mutation so all subsequent API calls carry the Telegram auth header automatically.
- Rebuilt API server (`pnpm --filter @workspace/api-server run build`) and restarted workflow.

**Verification**:
- `POST /api/users/auth` (dev body fallback) → 200, correct user returned.
- `GET /api/users/me` (dev mock, no header) → 200.
- `GET /api/users/me` (invalid initData hash) → 401 `Invalid hash — initData tampered or from wrong bot`.
- App screenshot: map loads correctly with 329 clustered stations, no browser console errors.

**Auth flow summary**:
- Real Telegram context: `window.Telegram.WebApp.initData` → `x-telegram-initdata` header → HMAC-SHA256 validated server-side.
- Dev (NODE_ENV ≠ production, no header): mock user `{id: 12345, firstName: "Иван"}`.
- Invalid/expired initData (> 24h): 401 rejected.

**Pending / Next steps**:
- Payment integration: CryptoBot (`CRYPTO_BOT_TOKEN` set) — wire up TON payment before voucher creation.
- QR code display on voucher detail screen.
- Voucher redemption endpoint (station-side QR scan → mark `used`).
- Push notifications via Telegram Bot API when voucher < 7 days from expiry.
- Real market prices (replace hardcoded `Math.random()` in analytics/market endpoints).
- Admin broadcast: actually call Telegram Bot API (currently lists users but never sends).

---

### Session 3 — 2026-06-27

**Status at start**: Auth fully secure. No real payments — `POST /vouchers` created vouchers immediately without any payment gate.

**What was done — Payment Integration**:

**Backend:**
- Added `payment_orders` table (`lib/db/src/schema/payment_orders.ts`) — tracks pending payments before voucher creation. Fields: userId, stationId, fuelType, liters, pricePerLiter, totalAmountRub, paymentMethod, status (pending/paid/failed), externalInvoiceId, voucherId, createdAt, paidAt.
- Created `artifacts/api-server/src/lib/cryptobot.ts` — CryptoBot API client. `createCryptoBotInvoice` creates fiat-RUB invoices paid in TON/USDT. `verifyCryptoBotWebhook` verifies HMAC-SHA256 webhook signatures.
- Created `artifacts/api-server/src/lib/telegram-bot.ts` — Telegram Bot API client. `createStarsInvoiceLink` creates Stars (`XTR`) invoice links. `answerPreCheckoutQuery` responds to Stars pre-checkout. Conversion: 1 Star = 2 RUB (`rubToStars`).
- Created `artifacts/api-server/src/routes/payments.ts` — 4 endpoints:
  - `POST /payments/create-order` (auth required): validates order, inserts pending `payment_order`, calls CryptoBot or Stars API, returns `{ orderId, invoiceUrl, method, totalRub, starsAmount? }`.
  - `GET /payments/order/:id` (auth required): poll order status, returns `{ orderId, status, voucherId }`.
  - `POST /payments/cryptobot-webhook` (no auth, signature verified): marks order paid, calls `createVoucherFromOrder`.
  - `POST /payments/telegram-webhook` (no auth): handles `pre_checkout_query` (answer within 10s) + `successful_payment`, marks order paid, calls `createVoucherFromOrder`.
- `createVoucherFromOrder` is the single function that creates the actual voucher + QR code after payment is confirmed.
- Registered payments router in `artifacts/api-server/src/routes/index.ts`.

**API spec & codegen:**
- Added `CreateOrderInput`, `PaymentOrder`, `PaymentOrderStatus` schemas + `/payments/create-order` (POST) and `/payments/order/{id}` (GET) endpoints to `lib/api-spec/openapi.yaml`.
- Ran `pnpm --filter @workspace/api-spec run codegen` — new hooks `useCreatePaymentOrder`, `useGetPaymentOrder` generated.

**DB:**
- `pnpm --filter @workspace/db run push` — `payment_orders` table created successfully.

**Frontend (`artifacts/toplivo/src/pages/catalog.tsx`):**
- Replaced `useCreateVoucher` with `useCreatePaymentOrder` + `useGetPaymentOrder`.
- `PaymentStep` state machine: `idle → waiting_payment → confirming → done`.
- Stars: calls `Telegram.WebApp.openInvoice(url, callback)` — on `paid` callback transitions to `confirming`, polls `GET /payments/order/:id` (2s interval) until `voucherId` appears.
- CryptoBot: opens `mini_app_invoice_url` via `Telegram.WebApp.openLink()` or browser fallback; polls same endpoint for payment confirmation.
- Payment waiting screen with animated dots, Stars amount preview, cancel button.
- Approximate Stars amount shown in buy panel (`totalRub / 2` capped at min 1).

**Telegram webhook registered:**
- `POST https://api.telegram.org/bot.../setWebhook` → URL: `https://${REPLIT_DEV_DOMAIN}/api/payments/telegram-webhook`, allowed_updates: `pre_checkout_query`, `message`.
- **NOTE**: Webhook URL uses dev domain. On production deploy, must re-register with production domain.

**Verification:**
- API server build: ✅ clean build at 2.2mb.
- DB push: ✅ `payment_orders` table created.
- Codegen: ✅ new hooks generated, typecheck passed.
- `POST /api/payments/create-order` (no auth header, dev mock): returns `{"error":"Station not found"}` — auth passes, route reached correctly.
- Frontend screenshot: catalog page loads with live prices, fuel cards, UI intact.

**Pending / Next steps:**
- Re-register Telegram webhook on production deploy (dev domain changes).
- QR code display on voucher detail screen.
- Voucher redemption (station-side QR scan → mark `used`).
- Push notifications via Telegram Bot API when voucher < 7 days from expiry.
- Real market prices (replace hardcoded `Math.random()` in analytics/market endpoints).
- Admin broadcast: actually call Telegram Bot API (currently logs but never sends).

---

_Next session: append a new `### Session N — YYYY-MM-DD` block above this line._
