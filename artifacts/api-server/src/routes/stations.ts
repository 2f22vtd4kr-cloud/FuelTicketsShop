import { Router } from "express";
import { db, stationsTable, fuelPricesTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

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
// Supports ?latMin=&latMax=&lngMin=&lngMax=&network=&limit=
router.get("/", async (req, res) => {
  try {
    const { network, latMin, latMax, lngMin, lngMax, limit } = req.query;
    const maxRows = Math.min(parseInt(limit as string) || 300, 500);

    const conditions: any[] = [eq(stationsTable.isActive, true)];
    if (network) conditions.push(eq(stationsTable.network, network as string));
    if (latMin) conditions.push(gte(stationsTable.lat, parseFloat(latMin as string)));
    if (latMax) conditions.push(lte(stationsTable.lat, parseFloat(latMax as string)));
    if (lngMin) conditions.push(gte(stationsTable.lng, parseFloat(lngMin as string)));
    if (lngMax) conditions.push(lte(stationsTable.lng, parseFloat(lngMax as string)));

    const stations = await db
      .select()
      .from(stationsTable)
      .where(and(...conditions))
      .limit(maxRows);

    // Return lightweight markers (no prices) for map view
    if (req.query.mapView === "1") {
      return res.json(stations.map((s) => ({
        id: s.id,
        name: s.name,
        network: s.network,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        networkColor: s.networkColor,
      })));
    }

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
