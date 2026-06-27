import { pgTable, serial, text, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stationsTable = pgTable("stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  network: text("network").notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  networkColor: text("network_color").notNull(),
});

export const insertStationSchema = createInsertSchema(stationsTable).omit({ id: true });
export type InsertStation = z.infer<typeof insertStationSchema>;
export type Station = typeof stationsTable.$inferSelect;
