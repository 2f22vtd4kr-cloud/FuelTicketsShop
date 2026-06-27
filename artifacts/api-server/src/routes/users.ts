import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AuthUserBody } from "@workspace/api-zod";

const router = Router();

// POST /users/auth
router.post("/auth", async (req, res) => {
  try {
    const parsed = AuthUserBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const { telegramId, firstName, lastName, username, photoUrl } = parsed.data;
    const adminId = process.env.ADMIN_TELEGRAM_ID ? parseInt(process.env.ADMIN_TELEGRAM_ID) : null;

    const existing = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramId)).limit(1);

    if (existing.length > 0) {
      const updated = await db.update(usersTable)
        .set({ firstName, lastName: lastName ?? null, username: username ?? null, photoUrl: photoUrl ?? null })
        .where(eq(usersTable.telegramId, telegramId))
        .returning();
      const user = updated[0];
      const vouchers = await db.query.vouchersTable?.findMany({ where: (v: any, { eq: eqFn }: any) => eqFn(v.userId, user.id) }).catch(() => []) || [];
      return res.json({
        ...user,
        createdAt: user.createdAt.toISOString(),
        totalVouchers: vouchers.length,
        totalSavings: 0,
      });
    }

    const isAdmin = adminId !== null && telegramId === adminId;
    const inserted = await db.insert(usersTable).values({
      telegramId,
      firstName,
      lastName: lastName ?? null,
      username: username ?? null,
      photoUrl: photoUrl ?? null,
      isAdmin,
    }).returning();

    const user = inserted[0];
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

// GET /users/me — returns a placeholder since we use telegramId from body
router.get("/me", async (req, res) => {
  const telegramIdHeader = req.headers["x-telegram-id"];
  if (!telegramIdHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const telegramId = parseInt(telegramIdHeader as string);
  const users = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramId)).limit(1);
  if (!users.length) return res.status(404).json({ error: "Not found" });
  const user = users[0];
  return res.json({ ...user, createdAt: user.createdAt.toISOString(), totalVouchers: 0, totalSavings: 0 });
});

export default router;
