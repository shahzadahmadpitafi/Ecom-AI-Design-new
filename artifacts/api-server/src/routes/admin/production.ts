import { Router } from "express";
import { db, ordersTable, customersTable, productionStagesTable } from "@workspace/db";
import { eq, desc, ne } from "drizzle-orm";
import { requireAdmin } from "./auth";

const router = Router();

// GET /api/admin/production — all active orders with stages
router.get("/production", requireAdmin, async (req, res) => {
  try {
    const activeOrders = await db.select({ order: ordersTable, customer: customersTable })
      .from(ordersTable)
      .leftJoin(customersTable, eq(ordersTable.customerId, customersTable.id))
      .where(ne(ordersTable.status, "delivered"))
      .orderBy(desc(ordersTable.createdAt));

    const withStages = await Promise.all(
      activeOrders.map(async ({ order, customer }) => {
        const stages = await db.select().from(productionStagesTable).where(eq(productionStagesTable.orderId, order.id));
        return { order, customer, stages };
      })
    );

    res.json({ orders: withStages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
