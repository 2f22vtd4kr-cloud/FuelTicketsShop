import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { validateTelegramInitData } from "../lib/telegram-auth";

const router = Router();

// POST /users/auth — validate initData, upsert user
router.post("/auth", async (req, res) => {
  try {
    let telegramId: number;
    let firstName: string;
    let lastName: string | undefined;
    let username: string | undefined;
    let photoUrl: string | undefined;

    const initData = req.headers["x-telegram-initdata"] as string | undefined;

    if (initData && initData.trim() !== "") {
      // Validate signature and extract user from initData
      const validated = validateTelegramInitData(initData);
      telegramId = validated.user.id;
      firstName = validated.user.first_name;
      lastName = validated.user.last_name;
      username = validated.user.username;
      photoUrl = validated.user.photo_url;
    } else if (process.env.NODE_ENV !== "production") {
      // Dev fallback — trust body fields
      const body = req.body;
      if (!body.telegramId || !body.firstName) {
        return res.status(400).json({ error: "telegramId and firstName required" });
      }
      telegramId = Number(body.telegramId);
      firstName = body.firstName;
      lastName = body.lastName;
      username = body.username;
      photoUrl = body.photoUrl;
    } else {
      return res.status(401).json({ error: "Unauthorized: missing Telegram auth" });
    }

    const adminId = process.env.ADMIN_TELEGRAM_ID
      ? parseInt(process.env.ADMIN_TELEGRAM_ID)
      : null;

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.telegramId, telegramId))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(usersTable)
        .set({
          firstName,
          lastName: lastName ?? null,
          username: username ?? null,
          photoUrl: photoUrl ?? null,
        })
        .where(eq(usersTable.telegramId, telegramId))
        .returning();

      const user = updated[0];
      const vouchers =
        (await db.query.vouchersTable
          ?.findMany({
            where: (v: any, { eq: eqFn }: any) => eqFn(v.userId, user.id),
          })
          .catch(() => [])) || [];

      return res.json({
        ...user,
        createdAt: user.createdAt.toISOString(),
        totalVouchers: vouchers.length,
        totalSavings: 0,
      });
    }

    const isAdmin = adminId !== null && telegramId === adminId;
    const inserted = await db
      .insert(usersTable)
      .values({
        telegramId,
        firstName,
        lastName: lastName ?? null,
        username: username ?? null,
        photoUrl: photoUrl ?? null,
        isAdmin,
      })
      .returning();

    const user = inserted[0];
    return res.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      totalVouchers: 0,
      totalSavings: 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message.includes("Unauthorized") || message.includes("Invalid hash") || message.includes("expired")) {
      return res.status(401).json({ error: message });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /users/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const telegramId = req.telegramId!;
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.telegramId, telegramId))
      .limit(1);

    if (!users.length) return res.status(404).json({ error: "User not found" });
    const user = users[0];
    return res.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      totalVouchers: 0,
      totalSavings: 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
