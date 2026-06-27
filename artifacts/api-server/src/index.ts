import app from "./app";
import { logger } from "./lib/logger";
import { setWebhook } from "./lib/telegram-bot";
import { seedPriceHistoryIfEmpty } from "./lib/market-prices";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function onStartup() {
  // Seed price history if the table is empty (first run)
  await seedPriceHistoryIfEmpty().catch((err) =>
    logger.warn({ err }, "Price history seeding skipped")
  );

  // Auto-register Telegram webhook
  const webhookBase =
    process.env.BOT_WEBHOOK_URL ??
    (process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : null);

  if (webhookBase && process.env.TELEGRAM_BOT_TOKEN) {
    const webhookUrl = `${webhookBase}/api/payments/telegram-webhook`;
    await setWebhook(webhookUrl)
      .then(() => logger.info({ webhookUrl }, "Telegram webhook registered"))
      .catch((err) => logger.warn({ err }, "Telegram webhook registration failed"));
  } else {
    logger.warn("Telegram webhook not registered: set REPLIT_DEV_DOMAIN or BOT_WEBHOOK_URL");
  }
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  onStartup();
});
