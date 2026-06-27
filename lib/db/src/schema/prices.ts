import { pgTable, serial, integer, text, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { stationsTable } from "./stations";

export const fuelPricesTable = pgTable("fuel_prices", {
  id: serial("id").primaryKey(),
  stationId: integer("station_id").references(() => stationsTable.id).notNull(),
  fuelType: text("fuel_type").notNull(), // AI-92 | AI-95 | AI-98 | Diesel
  pricePerLiter: doublePrecision("price_per_liter").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const priceHistoryTable = pgTable("price_history", {
  id: serial("id").primaryKey(),
  fuelType: text("fuel_type").notNull(),
  price: doublePrecision("price").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const insertFuelPriceSchema = createInsertSchema(fuelPricesTable).omit({ id: true, updatedAt: true });
export type InsertFuelPrice = z.infer<typeof insertFuelPriceSchema>;
export type FuelPrice = typeof fuelPricesTable.$inferSelect;
