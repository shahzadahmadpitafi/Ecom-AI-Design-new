import { pgTable, text, serial, timestamp, integer, doublePrecision, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  description: text("description"),
  basePrice: doublePrecision("base_price").notNull(),
  basePricePkr: doublePrecision("base_price_pkr").notNull(),
  availableColors: text("available_colors").array().notNull().default([]),
  availableFabrics: text("available_fabrics").array().notNull().default([]),
  availableGsm: integer("available_gsm").array().notNull().default([]),
  minOrderQty: integer("min_order_qty").notNull().default(12),
  imageUrl: text("image_url"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
