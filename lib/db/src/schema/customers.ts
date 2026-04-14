import { pgTable, text, serial, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  whatsapp: text("whatsapp"),
  country: text("country"),
  city: text("city"),
  address: text("address"),
  companyName: text("company_name"),
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpentPkr: doublePrecision("total_spent_pkr").notNull().default(0),
  customerType: text("customer_type").notNull().default("retail"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({
  id: true, createdAt: true,
});
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;
