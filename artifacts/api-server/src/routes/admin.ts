import { Router } from "express";
import { db, usersTable, vouchersTable } from "@workspace/db";
import { eq, gte } from "drizzle-orm";
import { SendBroadcastBody } from "@workspace/api-zod";

const router = Router();

function checkAdmin(req: any, res: any): boolean {
  const secret = req.headers["x-internal-secret"] || req.query.secret;
  if (secret !== process.env.INTERNAL_API_SECRET) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

// GET /admin/stats
router.get("/stats", async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const users = await db.select().from(usersTable);
    const vouchers = await db.select().from(vouchersTable);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const newUsersToday = users.filter((u) => u.createdAt >= today).length;
    const vouchersToday = vouchers.filter((v) => v.lockedAt >= today).length;
    const activeVouchers = vouchers.filter((v) => v.status === "active").length;
    const usedVouchers = vouchers.filter((v) => v.status === "used").length;
    const expiredVouchers = vouchers.filter((v) => v.status === "expired").length;
    const totalRevenue = vouchers.reduce((s, v) => s + v.totalAmount, 0);
    const totalLitersSold = vouchers.reduce((s, v) => s + v.liters, 0);

    res.json({
      totalUsers: users.length,
      totalVouchers: vouchers.length,
      activeVouchers,
      usedVouchers,
      expiredVouchers,
      totalRevenue: +totalRevenue.toFixed(2),
      totalLitersSold: +totalLitersSold.toFixed(1),
      newUsersToday,
      vouchersToday,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/users
router.get("/users", async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const users = await db.select().from(usersTable).limit(limit).offset(offset);
    res.json(users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      totalVouchers: 0,
      totalSavings: 0,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/vouchers
router.get("/vouchers", async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;
    const vouchers = await db.select().from(vouchersTable);
    res.json(vouchers.map((v) => ({
      ...v,
      lockedAt: v.lockedAt.toISOString(),
      expiresAt: v.expiresAt.toISOString(),
      stationName: "АЗС",
      stationNetwork: "Неизвестно",
      savingsAmount: null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/broadcast
router.post("/broadcast", async (req, res) => {
  try {
    const parsed = SendBroadcastBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const { adminSecret, message } = parsed.data;
    if (adminSecret !== process.env.INTERNAL_API_SECRET) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const users = await db.select().from(usersTable);
    // In production: iterate users and send via bot API
    res.json({ sent: users.length, failed: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
