import { pgTable, serial, integer, text, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { stationsTable } from "./stations";
import { vouchersTable } from "./vouchers";

export const paymentOrdersTable = pgTable("payment_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  stationId: integer("station_id").references(() => stationsTable.id).notNull(),
  fuelType: text("fuel_type").notNull(),
  liters: doublePrecision("liters").notNull(),
  pricePerLiter: doublePrecision("price_per_liter").notNull(),
  totalAmountRub: doublePrecision("total_amount_rub").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").default("pending").notNull(),
  externalInvoiceId: text("external_invoice_id"),
  voucherId: integer("voucher_id").references(() => vouchersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export type PaymentOrder = typeof paymentOrdersTable.$inferSelect;
