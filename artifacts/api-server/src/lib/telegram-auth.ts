import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface ValidatedInitData {
  user: TelegramUser;
  auth_date: number;
  query_id?: string;
}

const MAX_AGE_SECONDS = 24 * 60 * 60;

export function validateTelegramInitData(initData: string): ValidatedInitData {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN not configured");

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new Error("Missing hash in initData");

  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const expectedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const hashBuf = Buffer.from(hash, "hex");
  const expectedBuf = Buffer.from(expectedHash, "hex");

  if (
    hashBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(hashBuf, expectedBuf)
  ) {
    throw new Error("Invalid hash — initData tampered or from wrong bot");
  }

  const authDate = parseInt(params.get("auth_date") ?? "0");
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > MAX_AGE_SECONDS) {
    throw new Error("initData expired (older than 24 hours)");
  }

  const userJson = params.get("user");
  if (!userJson) throw new Error("Missing user field in initData");

  let user: TelegramUser;
  try {
    user = JSON.parse(userJson);
  } catch {
    throw new Error("Invalid user JSON in initData");
  }

  return {
    user,
    auth_date: authDate,
    query_id: params.get("query_id") ?? undefined,
  };
}
