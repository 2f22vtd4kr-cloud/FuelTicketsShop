import { Router } from "express";
import { db, vouchersTable, stationsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateVoucherBody } from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();

function genQrCode(voucherId: number): string {
  return `TOPLIVO-${voucherId}-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

async function enrichVoucher(v: any) {
  const station = await db.select().from(stationsTable).where(eq(stationsTable.id, v.stationId)).limit(1);
  return {
    ...v,
    lockedAt: v.lockedAt.toISOString(),
    expiresAt: v.expiresAt.toISOString(),
    stationName: station[0]?.name ?? "Неизвестно",
    stationNetwork: station[0]?.network ?? "Неизвестно",
    savingsAmount: null,
  };
}

// GET /vouchers — user vouchers by telegramId header
router.get("/", async (req, res) => {
  try {
    const telegramIdHeader = req.headers["x-telegram-id"];
    if (!telegramIdHeader) {
      // return demo vouchers for testing
      return res.json([]);
    }
    const telegramId = parseInt(telegramIdHeader as string);
    const users = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramId)).limit(1);
    if (!users.length) return res.json([]);

    const vouchers = await db.select().from(vouchersTable).where(eq(vouchersTable.userId, users[0].id));
    const enriched = await Promise.all(vouchers.map(enrichVoucher));
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /vouchers — purchase a voucher
router.post("/", async (req, res) => {
  try {
    const parsed = CreateVoucherBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const { stationId, fuelType, liters, paymentMethod, telegramUserId } = parsed.data;

    // Get or create user
    let userId: number;
    if (telegramUserId) {
      const users = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramUserId)).limit(1);
      if (!users.length) return res.status(404).json({ error: "User not found" });
      userId = users[0].id;
    } else {
      return res.status(400).json({ error: "telegramUserId required" });
    }

    // Get station prices
    const station = await db.select().from(stationsTable).where(eq(stationsTable.id, stationId)).limit(1);
    if (!station.length) return res.status(404).json({ error: "Station not found" });

    const pricePerLiter = 56.8; // locked price (AI-95 base)
    const totalAmount = +(pricePerLiter * liters).toFixed(2);
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const inserted = await db.insert(vouchersTable).values({
      userId,
      stationId,
      fuelType,
      liters,
      pricePerLiter,
      totalAmount,
      expiresAt,
      status: "active",
      paymentMethod: paymentMethod ?? null,
    }).returning();

    const voucher = inserted[0];
    const qrCode = genQrCode(voucher.id);
    const updated = await db.update(vouchersTable).set({ qrCode }).where(eq(vouchersTable.id, voucher.id)).returning();

    const enriched = await enrichVoucher(updated[0]);
    res.status(201).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /vouchers/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vouchers = await db.select().from(vouchersTable).where(eq(vouchersTable.id, id)).limit(1);
    if (!vouchers.length) return res.status(404).json({ error: "Not found" });
    const enriched = await enrichVoucher(vouchers[0]);
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /vouchers/:id/activate
router.post("/:id/activate", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.update(vouchersTable)
      .set({ status: "used" })
      .where(eq(vouchersTable.id, id))
      .returning();
    if (!updated.length) return res.status(404).json({ error: "Not found" });
    const enriched = await enrichVoucher(updated[0]);
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
