import { db, fuelPricesTable, priceHistoryTable } from "@workspace/db";

export interface LivePrices {
  ai92: number;
  ai95: number;
  ai98: number;
  diesel: number;
  updatedAt: string;
  trend: "up" | "down" | "stable";
}

const FALLBACKS: LivePrices = {
  ai92: 52.3,
  ai95: 56.8,
  ai98: 63.4,
  diesel: 58.1,
  updatedAt: new Date().toISOString(),
  trend: "up",
};

const FUEL_KEY_MAP: Record<string, keyof Pick<LivePrices, "ai92" | "ai95" | "ai98" | "diesel">> = {
  "AI-92": "ai92",
  "AI-95": "ai95",
  "AI-98": "ai98",
  "Diesel": "diesel",
};

let priceCache: { data: LivePrices; cachedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getMarketPrices(): Promise<LivePrices> {
  if (priceCache && Date.now() - priceCache.cachedAt < CACHE_TTL_MS) {
    return priceCache.data;
  }

  try {
    const rows = await db.select().from(fuelPricesTable);
    if (rows.length === 0) return FALLBACKS;

    const sums: Record<string, { total: number; count: number }> = {};
    for (const row of rows) {
      const key = FUEL_KEY_MAP[row.fuelType];
      if (!key) continue;
      if (!sums[key]) sums[key] = { total: 0, count: 0 };
      sums[key].total += Number(row.pricePerLiter);
      sums[key].count += 1;
    }

    const avg = (key: keyof typeof sums, fallback: number) =>
      sums[key] ? +(sums[key].total / sums[key].count).toFixed(2) : fallback;

    const data: LivePrices = {
      ai92: avg("ai92", FALLBACKS.ai92),
      ai95: avg("ai95", FALLBACKS.ai95),
      ai98: avg("ai98", FALLBACKS.ai98),
      diesel: avg("diesel", FALLBACKS.diesel),
      updatedAt: new Date().toISOString(),
      trend: "up",
    };

    priceCache = { data, cachedAt: Date.now() };
    return data;
  } catch {
    return FALLBACKS;
  }
}

export function invalidatePriceCache() {
  priceCache = null;
}

export async function seedPriceHistoryIfEmpty() {
  try {
    const existing = await db.select().from(priceHistoryTable).limit(1);
    if (existing.length > 0) return;

    const prices = await getMarketPrices();
    const fuelEntries = [
      { type: "AI-92", base: prices.ai92 },
      { type: "AI-95", base: prices.ai95 },
      { type: "AI-98", base: prices.ai98 },
      { type: "Diesel", base: prices.diesel },
    ];

    const rows = [];
    for (let day = 30; day >= 0; day--) {
      const recordedAt = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
      for (const { type, base } of fuelEntries) {
        const drift = (30 - day) * 0.03;
        const noise = (Math.random() - 0.5) * 0.3;
        rows.push({
          fuelType: type,
          price: +(base - drift + noise).toFixed(2),
          recordedAt,
        });
      }
    }

    await db.insert(priceHistoryTable).values(rows);
  } catch {
    // Non-critical; swallow
  }
}
