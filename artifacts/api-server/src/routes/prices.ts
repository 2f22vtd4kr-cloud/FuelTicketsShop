import { Router } from "express";
import { db, fuelPricesTable, priceHistoryTable } from "@workspace/db";
import { gte } from "drizzle-orm";

const router = Router();

// Base market prices (simulated live market)
function getMarketPrices() {
  const base = { ai92: 52.3, ai95: 56.8, ai98: 63.4, diesel: 58.1 };
  const noise = () => (Math.random() - 0.5) * 0.4;
  return {
    ai92: +(base.ai92 + noise()).toFixed(2),
    ai95: +(base.ai95 + noise()).toFixed(2),
    ai98: +(base.ai98 + noise()).toFixed(2),
    diesel: +(base.diesel + noise()).toFixed(2),
    updatedAt: new Date().toISOString(),
    trend: "up" as const,
  };
}

// GET /prices/live
router.get("/live", async (_req, res) => {
  try {
    res.json(getMarketPrices());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /prices/history
router.get("/history", async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const fuelType = req.query.fuelType as string | undefined;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let history = await db.select().from(priceHistoryTable).where(gte(priceHistoryTable.recordedAt, since));
    if (fuelType) history = history.filter((h) => h.fuelType === fuelType);

    res.json(history.map((h) => ({
      date: h.recordedAt.toISOString().split("T")[0],
      fuelType: h.fuelType,
      price: h.price,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
