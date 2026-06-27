const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

const RUB_PER_STAR = 2;

export function rubToStars(rub: number): number {
  return Math.max(1, Math.ceil(rub / RUB_PER_STAR));
}

async function callBotApi<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE_URL}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json() as { ok: boolean; result: T; description?: string };
  if (!data.ok) {
    throw new Error(`Telegram Bot API error: ${data.description}`);
  }
  return data.result;
}

export async function createStarsInvoiceLink(params: {
  title: string;
  description: string;
  payload: string;
  starsAmount: number;
}): Promise<string> {
  return callBotApi<string>("createInvoiceLink", {
    title: params.title,
    description: params.description,
    payload: params.payload,
    provider_token: "",
    currency: "XTR",
    prices: [{ label: params.title, amount: params.starsAmount }],
  });
}

export async function answerPreCheckoutQuery(preCheckoutQueryId: string, ok: boolean, errorMessage?: string): Promise<void> {
  await callBotApi("answerPreCheckoutQuery", {
    pre_checkout_query_id: preCheckoutQueryId,
    ok,
    ...(errorMessage ? { error_message: errorMessage } : {}),
  });
}

export async function setWebhook(url: string): Promise<void> {
  await callBotApi("setWebhook", {
    url,
    allowed_updates: ["pre_checkout_query", "message"],
  });
}
