import { Router } from "express";
import { db, usersTable, vouchersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { sendMessage } from "../lib/telegram-bot";

const router = Router();

async function requireAdmin(req: any, res: any): Promise<boolean> {
  const telegramId = req.telegramId as number | undefined;
  if (!telegramId) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramId)).limit(1);
  if (!users.length || !users[0].isAdmin) {
    res.status(403).json({ error: "Forbidden: admin only" });
    return false;
  }
  return true;
}

// GET /admin/stats — requires admin
router.get("/stats", requireAuth, async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;

    const users = await db.select().from(usersTable);
    const vouchers = await db.select().from(vouchersTable);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

// GET /admin/users — requires admin
router.get("/users", requireAuth, async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const users = await db.select().from(usersTable).limit(limit).offset(offset);

    res.json(
      users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        totalVouchers: 0,
        totalSavings: 0,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/vouchers — requires admin
router.get("/vouchers", requireAuth, async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;

    const vouchers = await db.select().from(vouchersTable);
    res.json(
      vouchers.map((v) => ({
        ...v,
        lockedAt: v.lockedAt.toISOString(),
        expiresAt: v.expiresAt.toISOString(),
        stationName: "АЗС",
        stationNetwork: "Неизвестно",
        savingsAmount: null,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/broadcast — requires admin; actually sends Telegram messages
router.post("/broadcast", requireAuth, async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;

    const { message } = req.body as { message?: string };
    if (!message?.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const users = await db.select().from(usersTable);

    let sent = 0;
    let failed = 0;

    // Send sequentially to avoid hitting Bot API rate limits
    for (const user of users) {
      try {
        await sendMessage(user.telegramId, message);
        sent++;
      } catch (err) {
        failed++;
        console.error(`Failed to send message to ${user.telegramId}:`, err instanceof Error ? err.message : err);
      }
    }

    res.json({ sent, failed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
