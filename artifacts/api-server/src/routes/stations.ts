import { Router } from "express";
import { db, stationsTable, fuelPricesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

async function getStationWithPrices(station: any) {
  const prices = await db.select().from(fuelPricesTable).where(eq(fuelPricesTable.stationId, station.id));
  return {
    ...station,
    prices: prices.map((p) => ({
      fuelType: p.fuelType,
      pricePerLiter: p.pricePerLiter,
      lockedPrice: null,
      updatedAt: p.updatedAt.toISOString(),
    })),
  };
}

// GET /stations
router.get("/", async (req, res) => {
  try {
    const { network, fuelType } = req.query;
    let stations = await db.select().from(stationsTable);
    if (network) stations = stations.filter((s) => s.network === network);
    const result = await Promise.all(stations.map(getStationWithPrices));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /stations/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const stations = await db.select().from(stationsTable).where(eq(stationsTable.id, id)).limit(1);
    if (!stations.length) return res.status(404).json({ error: "Not found" });
    const result = await getStationWithPrices(stations[0]);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
