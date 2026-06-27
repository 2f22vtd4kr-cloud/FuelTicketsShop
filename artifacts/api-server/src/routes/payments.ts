import { Router } from "express";
import { db, paymentOrdersTable, vouchersTable, stationsTable, fuelPricesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { createCryptoBotInvoice, verifyCryptoBotWebhook } from "../lib/cryptobot";
import { createStarsInvoiceLink, answerPreCheckoutQuery, rubToStars } from "../lib/telegram-bot";
import crypto from "crypto";

const router = Router();

function genQrCode(voucherId: number): string {
  return `TOPLIVO-${voucherId}-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

async function createVoucherFromOrder(orderId: number) {
  const orders = await db
    .select()
    .from(paymentOrdersTable)
    .where(eq(paymentOrdersTable.id, orderId))
    .limit(1);

  if (!orders.length || orders[0].status !== "paid") return null;
  if (orders[0].voucherId) return orders[0].voucherId;

  const order = orders[0];
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  const inserted = await db
    .insert(vouchersTable)
    .values({
      userId: order.userId,
      stationId: order.stationId,
      fuelType: order.fuelType,
      liters: order.liters,
      pricePerLiter: order.pricePerLiter,
      totalAmount: order.totalAmountRub,
      expiresAt,
      status: "active",
      paymentMethod: order.paymentMethod,
    })
    .returning();

  const voucher = inserted[0];
  const qrCode = genQrCode(voucher.id);

  await db.update(vouchersTable).set({ qrCode }).where(eq(vouchersTable.id, voucher.id));

  await db
    .update(paymentOrdersTable)
    .set({ voucherId: voucher.id })
    .where(eq(paymentOrdersTable.id, orderId));

  return voucher.id;
}

// POST /payments/create-order — requires auth
router.post("/create-order", requireAuth, async (req, res) => {
  try {
    const { stationId, fuelType, liters, paymentMethod } = req.body;

    if (!stationId || !fuelType || !liters || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!["stars", "crypto"].includes(paymentMethod)) {
      return res.status(400).json({ error: "paymentMethod must be 'stars' or 'crypto'" });
    }

    const telegramId = req.telegramId!;

    const users = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramId)).limit(1);
    if (!users.length) return res.status(404).json({ error: "User not found" });
    const userId = users[0].id;

    const station = await db.select().from(stationsTable).where(eq(stationsTable.id, stationId)).limit(1);
    if (!station.length) return res.status(404).json({ error: "Station not found" });

    const prices = await db.select().from(fuelPricesTable).where(eq(fuelPricesTable.stationId, stationId)).limit(10);
    const matchedPrice = prices.find((p) => p.fuelType === fuelType);
    const pricePerLiter = matchedPrice ? Number(matchedPrice.pricePerLiter) : 56.8;
    const totalAmountRub = +(pricePerLiter * liters).toFixed(2);

    const [order] = await db
      .insert(paymentOrdersTable)
      .values({ userId, stationId, fuelType, liters, pricePerLiter, totalAmountRub, paymentMethod, status: "pending" })
      .returning();

    const payload = String(order.id);
    const description = `${liters}л ${fuelType} — ${station[0].name}`;

    if (paymentMethod === "crypto") {
      const invoice = await createCryptoBotInvoice({
        amountRub: totalAmountRub,
        payload,
        description,
      });

      await db
        .update(paymentOrdersTable)
        .set({ externalInvoiceId: String(invoice.invoice_id) })
        .where(eq(paymentOrdersTable.id, order.id));

      return res.json({
        orderId: order.id,
        method: "crypto",
        invoiceUrl: invoice.mini_app_invoice_url,
        webInvoiceUrl: invoice.web_app_invoice_url,
        totalRub: totalAmountRub,
      });
    }

    // Stars
    const starsAmount = rubToStars(totalAmountRub);
    const invoiceLink = await createStarsInvoiceLink({
      title: `Талон: ${liters}л ${fuelType}`,
      description,
      payload,
      starsAmount,
    });

    return res.json({
      orderId: order.id,
      method: "stars",
      invoiceUrl: invoiceLink,
      totalRub: totalAmountRub,
      starsAmount,
    });
  } catch (err) {
    console.error("create-order error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /payments/order/:id — poll order status
router.get("/order/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const orders = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, id)).limit(1);
    if (!orders.length) return res.status(404).json({ error: "Order not found" });

    const order = orders[0];
    const telegramId = req.telegramId!;
    const users = await db.select().from(usersTable).where(eq(usersTable.telegramId, telegramId)).limit(1);
    if (!users.length || order.userId !== users[0].id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ orderId: order.id, status: order.status, voucherId: order.voucherId ?? null });
  } catch (err) {
    console.error("poll order error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /payments/cryptobot-webhook — CryptoBot payment confirmation (no auth)
router.post("/cryptobot-webhook", async (req, res) => {
  try {
    const signature = req.headers["crypto-pay-api-signature"] as string | undefined;
    if (!signature) return res.status(400).json({ error: "Missing signature" });

    const rawBody = JSON.stringify(req.body);
    if (!verifyCryptoBotWebhook(rawBody, signature)) {
      return res.status(403).json({ error: "Invalid signature" });
    }

    const { update_type, payload: update } = req.body as {
      update_type: string;
      payload: { invoice_id: number; status: string; payload?: string };
    };

    if (update_type !== "invoice_paid") return res.json({ ok: true });

    const orderId = parseInt(update.payload ?? "0");
    if (!orderId) return res.status(400).json({ error: "Invalid payload" });

    await db
      .update(paymentOrdersTable)
      .set({ status: "paid", externalInvoiceId: String(update.invoice_id), paidAt: new Date() })
      .where(eq(paymentOrdersTable.id, orderId));

    await createVoucherFromOrder(orderId);

    res.json({ ok: true });
  } catch (err) {
    console.error("cryptobot-webhook error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /payments/telegram-webhook — Telegram Stars payment confirmation (no auth)
router.post("/telegram-webhook", async (req, res) => {
  try {
    const update = req.body as {
      pre_checkout_query?: { id: string; invoice_payload: string };
      message?: { successful_payment?: { invoice_payload: string; telegram_payment_charge_id: string } };
    };

    // Must answer pre_checkout_query within 10 seconds
    if (update.pre_checkout_query) {
      const pqId = update.pre_checkout_query.id;
      const orderId = parseInt(update.pre_checkout_query.invoice_payload);
      const orders = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, orderId)).limit(1);

      if (!orders.length || orders[0].status === "paid") {
        await answerPreCheckoutQuery(pqId, false, "Заказ не найден или уже оплачен");
      } else {
        await answerPreCheckoutQuery(pqId, true);
      }
      return res.json({ ok: true });
    }

    // Successful payment
    if (update.message?.successful_payment) {
      const { invoice_payload, telegram_payment_charge_id } = update.message.successful_payment;
      const orderId = parseInt(invoice_payload);
      if (!orderId) return res.json({ ok: true });

      await db
        .update(paymentOrdersTable)
        .set({ status: "paid", externalInvoiceId: telegram_payment_charge_id, paidAt: new Date() })
        .where(eq(paymentOrdersTable.id, orderId));

      await createVoucherFromOrder(orderId);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("telegram-webhook error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
