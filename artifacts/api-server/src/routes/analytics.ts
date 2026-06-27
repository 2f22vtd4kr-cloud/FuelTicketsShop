import { Router } from "express";
import { db, vouchersTable, stationsTable } from "@workspace/db";

const router = Router();

const NETWORKS = ["Лукойл", "Газпром", "Роснефть", "Shell", "Татнефть"];
const NETWORK_COLORS: Record<string, string> = {
  "Лукойл": "#DC2626",
  "Газпром": "#3B82F6",
  "Роснефть": "#991B1B",
  "Shell": "#F59E0B",
  "Татнефть": "#10B981",
};
const FUEL_TYPES = ["AI-92", "AI-95", "AI-98", "Diesel"];

// GET /analytics/summary
router.get("/summary", async (_req, res) => {
  try {
    const vouchers = await db.select().from(vouchersTable);
    const totalVouchers = vouchers.length;
    const totalLiters = vouchers.reduce((s, v) => s + v.liters, 0);
    const activeVouchers = vouchers.filter((v) => v.status === "active").length;
    const marketAi95 = 61.2;
    const lockedAi95 = 56.8;
    const priceGrowth = +((marketAi95 - lockedAi95) / lockedAi95 * 100).toFixed(1);

    res.json({
      totalVouchers,
      totalLiters: +totalLiters.toFixed(1),
      totalSavings: +(totalLiters * (marketAi95 - lockedAi95)).toFixed(2),
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

    const lockedPrices: Record<string, number> = {
      "AI-92": 48.5, "AI-95": 56.8, "AI-98": 63.4, "Diesel": 54.2,
    };
    const marketPrices: Record<string, number> = {
      "AI-92": 52.3, "AI-95": 61.2, "AI-98": 68.9, "Diesel": 58.7,
    };

    const lockedPrice = lockedPrices[fuelType] ?? 56.8;
    const marketPrice = marketPrices[fuelType] ?? 61.2;
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
