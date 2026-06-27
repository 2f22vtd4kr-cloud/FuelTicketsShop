import { pgTable, serial, integer, text, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { stationsTable } from "./stations";

export const vouchersTable = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  stationId: integer("station_id").references(() => stationsTable.id).notNull(),
  fuelType: text("fuel_type").notNull(),
  liters: doublePrecision("liters").notNull(),
  pricePerLiter: doublePrecision("price_per_liter").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  lockedAt: timestamp("locked_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  status: text("status").default("active").notNull(), // active | used | expired
  qrCode: text("qr_code"),
  paymentMethod: text("payment_method"),
});

export const insertVoucherSchema = createInsertSchema(vouchersTable).omit({ id: true, lockedAt: true });
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type Voucher = typeof vouchersTable.$inferSelect;
