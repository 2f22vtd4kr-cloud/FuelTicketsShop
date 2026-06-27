import { Router } from "express";
import { db, priceHistoryTable } from "@workspace/db";
import { gte } from "drizzle-orm";
import { getMarketPrices } from "../lib/market-prices";

const router = Router();

// GET /prices/live
router.get("/live", async (_req, res) => {
  try {
    const prices = await getMarketPrices();
    res.json(prices);
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

    let history = await db
      .select()
      .from(priceHistoryTable)
      .where(gte(priceHistoryTable.recordedAt, since));

    if (fuelType) history = history.filter((h) => h.fuelType === fuelType);

    res.json(
      history.map((h) => ({
        date: h.recordedAt.toISOString().split("T")[0],
        fuelType: h.fuelType,
        price: h.price,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
