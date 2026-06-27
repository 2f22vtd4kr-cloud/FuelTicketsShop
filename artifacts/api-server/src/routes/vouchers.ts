import { Router } from "express";
import { db, vouchersTable, stationsTable, usersTable, fuelPricesTable } from "@workspace/db";
import { eq, and, lt } from "drizzle-orm";
import { CreateVoucherBody } from "@workspace/api-zod";
import crypto from "crypto";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function genQrCode(voucherId: number): string {
  return `TOPLIVO-${voucherId}-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

async function autoExpireVouchers(userId: number) {
  const now = new Date();
  await db
    .update(vouchersTable)
    .set({ status: "expired" })
    .where(
      and(
        eq(vouchersTable.userId, userId),
        eq(vouchersTable.status, "active"),
        lt(vouchersTable.expiresAt, now)
      )
    );
}

async function enrichVoucher(v: any) {
  const station = await db
    .select()
    .from(stationsTable)
    .where(eq(stationsTable.id, v.stationId))
    .limit(1);
  return {
    ...v,
    lockedAt: v.lockedAt.toISOString(),
    expiresAt: v.expiresAt.toISOString(),
    stationName: station[0]?.name ?? "Неизвестно",
    stationNetwork: station[0]?.network ?? "Неизвестно",
    savingsAmount: null,
  };
}

// GET /vouchers — requires auth
router.get("/", requireAuth, async (req, res) => {
  try {
    const telegramId = req.telegramId!;
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.telegramId, telegramId))
      .limit(1);

    if (!users.length) return res.json([]);

    const userId = users[0].id;

    // Auto-mark expired vouchers before returning
    await autoExpireVouchers(userId);

    const vouchers = await db
      .select()
      .from(vouchersTable)
      .where(eq(vouchersTable.userId, userId));

    const enriched = await Promise.all(vouchers.map(enrichVoucher));
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /vouchers — requires auth, looks up user from validated telegramId
router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = CreateVoucherBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const { stationId, fuelType, liters, paymentMethod } = parsed.data;
    const telegramId = req.telegramId!;

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.telegramId, telegramId))
      .limit(1);

    if (!users.length) return res.status(404).json({ error: "User not found. Please authenticate first." });
    const userId = users[0].id;

    const station = await db
      .select()
      .from(stationsTable)
      .where(eq(stationsTable.id, stationId))
      .limit(1);

    if (!station.length) return res.status(404).json({ error: "Station not found" });

    const prices = await db
      .select()
      .from(fuelPricesTable)
      .where(eq(fuelPricesTable.stationId, stationId))
      .limit(10);

    const matchedPrice = prices.find((p: { fuelType: string; pricePerLiter: unknown }) => p.fuelType === fuelType);
    const pricePerLiter = matchedPrice ? Number(matchedPrice.pricePerLiter) : 56.8;
    const totalAmount = +(pricePerLiter * liters).toFixed(2);
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const inserted = await db
      .insert(vouchersTable)
      .values({
        userId,
        stationId,
        fuelType,
        liters,
        pricePerLiter,
        totalAmount,
        expiresAt,
        status: "active",
        paymentMethod: paymentMethod ?? null,
      })
      .returning();

    const voucher = inserted[0];
    const qrCode = genQrCode(voucher.id);
    const updated = await db
      .update(vouchersTable)
      .set({ qrCode })
      .where(eq(vouchersTable.id, voucher.id))
      .returning();

    const enriched = await enrichVoucher(updated[0]);
    res.status(201).json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /vouchers/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const vouchers = await db
      .select()
      .from(vouchersTable)
      .where(eq(vouchersTable.id, id))
      .limit(1);

    if (!vouchers.length) return res.status(404).json({ error: "Not found" });

    const telegramId = req.telegramId!;
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.telegramId, telegramId))
      .limit(1);

    if (!users.length || vouchers[0].userId !== users[0].id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const enriched = await enrichVoucher(vouchers[0]);
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /vouchers/:id/activate — requires auth + ownership
router.post("/:id/activate", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const vouchers = await db
      .select()
      .from(vouchersTable)
      .where(eq(vouchersTable.id, id))
      .limit(1);

    if (!vouchers.length) return res.status(404).json({ error: "Not found" });

    const telegramId = req.telegramId!;
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.telegramId, telegramId))
      .limit(1);

    if (!users.length || vouchers[0].userId !== users[0].id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = await db
      .update(vouchersTable)
      .set({ status: "used" })
      .where(eq(vouchersTable.id, id))
      .returning();

    const enriched = await enrichVoucher(updated[0]);
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
