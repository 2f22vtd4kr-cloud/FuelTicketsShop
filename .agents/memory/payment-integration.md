---
name: Payment integration (CryptoBot + Telegram Stars)
description: Architecture and key decisions for the two-phase payment flow before voucher creation.
---

# Payment Integration

## Flow
1. `POST /api/payments/create-order` (auth required) — creates a `payment_orders` row (status=pending), calls the payment provider, returns `invoiceUrl`.
2. Frontend opens the invoice (Stars via `WebApp.openInvoice`, CryptoBot via `WebApp.openLink`).
3. Provider sends webhook → backend marks order `paid`, calls `createVoucherFromOrder` which inserts the voucher.
4. Frontend polls `GET /api/payments/order/:id` every 2s until `voucherId` appears, then navigates to vault.

## CryptoBot
- Lib: `artifacts/api-server/src/lib/cryptobot.ts`
- Uses `currency_type: "fiat"`, `fiat: "RUB"`, `accepted_assets: ["TON", "USDT"]` — user pays in crypto, we denominate in rubles.
- Webhook signature: HMAC-SHA256 of raw request body with `sha256(CRYPTO_BOT_TOKEN)` as key.
- Webhook endpoint: `POST /api/payments/cryptobot-webhook` (no auth, signature verified).

## Telegram Stars
- Lib: `artifacts/api-server/src/lib/telegram-bot.ts`
- Currency: `XTR` (Stars). Conversion rate: 1 Star = 2 RUB (`rubToStars` helper).
- Invoice created via Bot API `createInvoiceLink` with `provider_token: ""`.
- Frontend opens via `Telegram.WebApp.openInvoice(url, callback)`.
- Webhook MUST answer `pre_checkout_query` within 10 seconds or payment fails.
- Webhook endpoint: `POST /api/payments/telegram-webhook`.

**Why:** Webhook registration: `POST /setWebhook` with `allowed_updates: ["pre_checkout_query", "message"]`. Must re-register on each domain change (dev domain ≠ prod domain).

**How to apply:** On production deploy, re-call `setWebhook` with the production domain URL. Dev domain (`REPLIT_DEV_DOMAIN`) is ephemeral.

## DB
- Table: `payment_orders` in `lib/db/src/schema/payment_orders.ts`
- Voucher is only created AFTER payment is confirmed (in `createVoucherFromOrder`).
- `payment_orders.voucherId` is set after voucher creation — this is what the frontend polls for.

## Stars amount preview
Frontend shows `Math.ceil(totalRub / 2)` as a Stars estimate before the invoice is created.
