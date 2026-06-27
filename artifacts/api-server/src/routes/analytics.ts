import { Router } from "express";
import { db, vouchersTable, stationsTable } from "@workspace/db";
import { getMarketPrices } from "../lib/market-prices";

const router = Router();

const NETWORKS = ["Лукойл", "Газпром", "Роснефть", "Shell", "Татнефть"];
const NETWORK_COLORS: Record<string, string> = {
  "Лукойл": "#DC2626",
  "Газпром": "#3B82F6",
  "Роснефть": "#991B1B",
  "Shell": "#F59E0B",
  "Татнефть": "#10B981",
};

const FUEL_KEY_TO_TYPE: Record<string, string> = {
  ai92: "AI-92",
  ai95: "AI-95",
  ai98: "AI-98",
  diesel: "Diesel",
};

// GET /analytics/summary
router.get("/summary", async (_req, res) => {
  try {
    const [vouchers, prices] = await Promise.all([
      db.select().from(vouchersTable),
      getMarketPrices(),
    ]);

    const totalVouchers = vouchers.length;
    const totalLiters = vouchers.reduce((s, v) => s + v.liters, 0);
    const activeVouchers = vouchers.filter((v) => v.status === "active").length;

    const marketAi95 = prices.ai95;

    // Compute average locked price across all AI-95 vouchers (fallback to market - margin)
    const ai95Vouchers = vouchers.filter((v) => v.fuelType === "AI-95");
    const lockedAi95 = ai95Vouchers.length > 0
      ? +(ai95Vouchers.reduce((s, v) => s + Number(v.pricePerLiter), 0) / ai95Vouchers.length).toFixed(2)
      : +(marketAi95 * 0.93).toFixed(2);

    const priceGrowth = lockedAi95 > 0
      ? +((marketAi95 - lockedAi95) / lockedAi95 * 100).toFixed(1)
      : 0;

    // Compute total savings across all vouchers based on current market prices
    let totalSavings = 0;
    for (const v of vouchers) {
      const fuelKey = Object.keys(FUEL_KEY_TO_TYPE).find(
        (k) => FUEL_KEY_TO_TYPE[k] === v.fuelType
      ) as keyof typeof prices | undefined;
      const market = fuelKey ? (prices[fuelKey as keyof typeof prices] as number) : marketAi95;
      const locked = Number(v.pricePerLiter);
      totalSavings += (market - locked) * v.liters;
    }

    res.json({
      totalVouchers,
      totalLiters: +totalLiters.toFixed(1),
      totalSavings: +totalSavings.toFixed(2),
      activeVouchers,
      avgSavingsPercent: priceGrowth,
      marketPriceAi95: marketAi95,
      lockedPriceAi95: lockedAi95,
      priceGrowthSinceLock: priceGrowth,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /analytics/supply-matrix
router.get("/supply-matrix", async (_req, res) => {
  try {
    const stations = await db.select().from(stationsTable);
    const matrix = NETWORKS.map((network) => {
      const count = stations.filter((s) => s.network === network).length;
      return {
        network,
        ai92: count > 2 ? "available" : count > 0 ? "low" : "unavailable",
        ai95: count > 1 ? "available" : count > 0 ? "low" : "unavailable",
        ai98: count > 3 ? "available" : count > 0 ? "low" : "unavailable",
        diesel: count > 2 ? "available" : count > 0 ? "low" : "unavailable",
        totalStations: count,
        networkColor: NETWORK_COLORS[network] ?? "#6B7280",
      };
    });
    res.json(matrix);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /analytics/market-comparison
router.get("/market-comparison", async (req, res) => {
  try {
    const fuelType = (req.query.fuelType as string) || "AI-95";
    const liters = parseFloat(req.query.liters as string) || 50;

    const prices = await getMarketPrices();

    const fuelKeyMap: Record<string, keyof typeof prices> = {
      "AI-92": "ai92",
      "AI-95": "ai95",
      "AI-98": "ai98",
      "Diesel": "diesel",
    };

    const key = fuelKeyMap[fuelType] ?? "ai95";
    const marketPrice = prices[key] as number;

    // Locked price: apply a 7% discount to represent the locked-in benefit
    const lockedPrice = +(marketPrice * 0.93).toFixed(2);

    const savings = +((marketPrice - lockedPrice) * liters).toFixed(2);
    const savingsPercent = +((marketPrice - lockedPrice) / lockedPrice * 100).toFixed(1);

    res.json({
      fuelType,
      liters,
      lockedPrice,
      marketPrice,
      lockedTotal: +(lockedPrice * liters).toFixed(2),
      marketTotal: +(marketPrice * liters).toFixed(2),
      savings,
      savingsPercent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
