import crypto from "crypto";

const BASE_URL = "https://pay.crypt.bot/api";
const TOKEN = process.env.CRYPTO_BOT_TOKEN ?? "";

interface CryptoBotInvoice {
  invoice_id: number;
  hash: string;
  currency_type: string;
  amount: string;
  bot_invoice_url: string;
  mini_app_invoice_url: string;
  web_app_invoice_url: string;
  status: string;
  payload?: string;
}

interface CryptoBotResponse<T> {
  ok: boolean;
  result: T;
  error?: { code: number; name: string };
}

async function callApi<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE_URL}/${method}`, {
    method: "POST",
    headers: {
      "Crypto-Pay-API-Token": TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as CryptoBotResponse<T>;
  if (!data.ok) {
    throw new Error(`CryptoBot error ${data.error?.code}: ${data.error?.name}`);
  }
  return data.result;
}

export async function createCryptoBotInvoice(params: {
  amountRub: number;
  payload: string;
  description: string;
}): Promise<CryptoBotInvoice> {
  return callApi<CryptoBotInvoice>("createInvoice", {
    currency_type: "fiat",
    fiat: "RUB",
    accepted_assets: ["TON", "USDT"],
    amount: params.amountRub.toFixed(2),
    payload: params.payload,
    description: params.description,
    allow_comments: false,
    allow_anonymous: false,
    expires_in: 3600,
  });
}

export function verifyCryptoBotWebhook(body: string, signature: string): boolean {
  const secret = crypto.createHash("sha256").update(TOKEN).digest();
  const checkString = body;
  const hmac = crypto.createHmac("sha256", secret).update(checkString).digest("hex");
  return hmac === signature;
}
