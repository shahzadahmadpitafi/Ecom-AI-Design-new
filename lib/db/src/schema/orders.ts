import { pgTable, text, serial, timestamp, integer, doublePrecision, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customersTable.id),
  status: text("status").notNull().default("pending"),
  items: text("items").notNull().default("[]"),
  subtotalPkr: doublePrecision("subtotal_pkr").notNull().default(0),
  discountPercent: doublePrecision("discount_percent").notNull().default(0),
  discountPkr: doublePrecision("discount_pkr").notNull().default(0),
  totalPkr: doublePrecision("total_pkr").notNull().default(0),
  totalUsd: doublePrecision("total_usd"),
  advancePaidPkr: doublePrecision("advance_paid_pkr").notNull().default(0),
  balanceDuePkr: doublePrecision("balance_due_pkr").notNull().default(0),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  paymentMethod: text("payment_method"),
  designImageUrl: text("design_image_url"),
  designPrompt: text("design_prompt"),
  specialInstructions: text("special_instructions"),
  estimatedDelivery: text("estimated_delivery"),
  actualDelivery: text("actual_delivery"),
  trackingNumber: text("tracking_number"),
  shippingMethod: text("shipping_method"),
  whatsappUpdates: boolean("whatsapp_updates").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => ordersTable.id).notNull(),
  productId: integer("product_id"),
  productName: text("product_name").notNull(),
  category: text("category"),
  garmentColor: text("garment_color"),
  garmentSize: text("garment_size"),
  fabric: text("fabric"),
  gsm: text("gsm"),
  quantity: integer("quantity").notNull().default(1),
  unitPricePkr: doublePrecision("unit_price_pkr").notNull().default(0),
  totalPricePkr: doublePrecision("total_price_pkr").notNull().default(0),
  brandLabel: boolean("brand_label").notNull().default(false),
  designImageUrl: text("design_image_url"),
  designPrompt: text("design_prompt"),
  hasSample: boolean("has_sample").notNull().default(false),
  samplePricePkr: doublePrecision("sample_price_pkr").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productionStagesTable = pgTable("production_stages", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => ordersTable.id).notNull(),
  stage: text("stage").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => ordersTable.id).notNull(),
  amountPkr: doublePrecision("amount_pkr").notNull(),
  amountUsd: doublePrecision("amount_usd"),
  paymentMethod: text("payment_method").notNull().default("bank_transfer"),
  referenceNumber: text("reference_number"),
  status: text("status").notNull().default("confirmed"),
  notes: text("notes"),
  receivedAt: timestamp("received_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  orderId: integer("order_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type ProductionStage = typeof productionStagesTable.$inferSelect;
export type Payment = typeof paymentsTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
