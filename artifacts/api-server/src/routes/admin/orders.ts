import { Router } from "express";
import { db, ordersTable, orderItemsTable, productionStagesTable, paymentsTable, notificationsTable, customersTable } from "@workspace/db";
import { eq, desc, and, gte, lte, like, or, sql, count, sum } from "drizzle-orm";
import { requireAdmin } from "./auth";

const router = Router();

const PRODUCTION_STAGES = [
  "order_received", "design_approved", "sampling", "sample_approved",
  "cutting", "stitching", "printing", "quality_check", "packing", "dispatched",
];

function generateOrderNumber(id: number): string {
  const year = new Date().getFullYear();
  return `SE-${year}-${String(id).padStart(4, "0")}`;
}

// GET /api/admin/orders
router.get("/orders", requireAdmin, async (req, res) => {
  try {
    const { status, paymentStatus, search, limit = "50", offset = "0" } = req.query as any;
    
    let query = db.select({
      order: ordersTable,
      customer: customersTable,
    })
      .from(ordersTable)
      .leftJoin(customersTable, eq(ordersTable.customerId, customersTable.id))
      .orderBy(desc(ordersTable.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const orders = await query;
    const filtered = orders.filter(row => {
      if (status && status !== "all" && row.order.status !== status) return false;
      if (paymentStatus && paymentStatus !== "all" && row.order.paymentStatus !== paymentStatus) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!row.order.orderNumber.toLowerCase().includes(s) &&
            !row.customer?.name?.toLowerCase().includes(s) &&
            !row.customer?.whatsapp?.includes(s)) return false;
      }
      return true;
    });

    res.json({ orders: filtered });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/orders — create order
router.post("/orders", requireAdmin, async (req, res) => {
  try {
    const { customerId, items, totalPkr, specialInstructions, estimatedDelivery, designImageUrl, designPrompt } = req.body;
    
    // Create a placeholder order first to get the ID for generating order number
    const [order] = await db.insert(ordersTable).values({
      orderNumber: `SE-TMP-${Date.now()}`,
      customerId: customerId || null,
      items: JSON.stringify(items || []),
      totalPkr: totalPkr || 0,
      subtotalPkr: totalPkr || 0,
      balanceDuePkr: totalPkr || 0,
      specialInstructions,
      estimatedDelivery,
      designImageUrl,
      designPrompt,
    }).returning();

    // Update with proper order number
    const orderNumber = generateOrderNumber(order.id);
    const [updated] = await db.update(ordersTable)
      .set({ orderNumber })
      .where(eq(ordersTable.id, order.id))
      .returning();

    // Insert order items
    if (items?.length) {
      await db.insert(orderItemsTable).values(
        items.map((item: any) => ({
          orderId: order.id,
          productId: item.productId || null,
          productName: item.productName,
          category: item.category,
          garmentColor: item.garmentColor,
          garmentSize: item.garmentSize,
          fabric: item.fabric,
          gsm: item.gsm,
          quantity: item.quantity || 1,
          unitPricePkr: item.unitPricePkr || 0,
          totalPricePkr: (item.unitPricePkr || 0) * (item.quantity || 1),
          brandLabel: item.brandLabel || false,
          designImageUrl: item.designImageUrl,
          designPrompt: item.designPrompt,
        }))
      );
    }

    // Create production stages
    await db.insert(productionStagesTable).values(
      PRODUCTION_STAGES.map(stage => ({ orderId: order.id, stage, status: "pending" }))
    );

    // Mark first stage as in_progress
    await db.update(productionStagesTable)
      .set({ status: "in_progress" })
      .where(and(eq(productionStagesTable.orderId, order.id), eq(productionStagesTable.stage, "order_received")));

    // Create notification
    await db.insert(notificationsTable).values({
      type: "new_order",
      title: `New Order ${orderNumber}`,
      message: `New order received for PKR ${totalPkr?.toLocaleString() || 0}`,
      orderId: order.id,
    });

    res.json({ order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/orders/:id
router.get("/orders/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select({ order: ordersTable, customer: customersTable })
      .from(ordersTable)
      .leftJoin(customersTable, eq(ordersTable.customerId, customersTable.id))
      .where(eq(ordersTable.id, id));

    if (!row) return res.status(404).json({ error: "Order not found" });

    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    const stages = await db.select().from(productionStagesTable).where(eq(productionStagesTable.orderId, id)).orderBy(productionStagesTable.id);
    const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.orderId, id)).orderBy(desc(paymentsTable.createdAt));

    res.json({ order: row.order, customer: row.customer, items, stages, payments });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/orders/:id
router.put("/orders/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;
    delete updates.id; delete updates.createdAt; delete updates.orderNumber;
    const [updated] = await db.update(ordersTable).set({ ...updates, updatedAt: new Date() }).where(eq(ordersTable.id, id)).returning();
    res.json({ order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/orders/:id/status
router.post("/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const [updated] = await db.update(ordersTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(ordersTable.id, id))
      .returning();

    await db.insert(notificationsTable).values({
      type: "status_update",
      title: `Order ${updated.orderNumber} → ${status}`,
      message: `Order status updated to ${status}`,
      orderId: id,
    });

    res.json({ order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/orders/:id/payment
router.post("/orders/:id/payment", requireAdmin, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { amountPkr, paymentMethod, referenceNumber, notes } = req.body;

    const [payment] = await db.insert(paymentsTable).values({
      orderId,
      amountPkr: Number(amountPkr),
      paymentMethod: paymentMethod || "bank_transfer",
      referenceNumber,
      notes,
      status: "confirmed",
      receivedAt: new Date(),
    }).returning();

    // Update order advance paid + balance
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    const newAdvance = (order.advancePaidPkr || 0) + Number(amountPkr);
    const newBalance = Math.max(0, (order.totalPkr || 0) - newAdvance);
    const paymentStatus = newBalance === 0 ? "paid" : newAdvance > 0 ? "partial" : "unpaid";

    const [updated] = await db.update(ordersTable)
      .set({ advancePaidPkr: newAdvance, balanceDuePkr: newBalance, paymentStatus, updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId))
      .returning();

    await db.insert(notificationsTable).values({
      type: "payment_received",
      title: `Payment PKR ${Number(amountPkr).toLocaleString()} for ${order.orderNumber}`,
      message: `Payment recorded. Balance: PKR ${newBalance.toLocaleString()}`,
      orderId,
    });

    res.json({ payment, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/production/:orderId/stage
router.put("/production/:orderId/stage", requireAdmin, async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    const { stage, status, notes } = req.body;

    await db.update(productionStagesTable)
      .set({
        status,
        notes,
        completedAt: status === "completed" ? new Date() : null,
      })
      .where(and(eq(productionStagesTable.orderId, orderId), eq(productionStagesTable.stage, stage)));

    // If completing a stage, advance to the next
    if (status === "completed") {
      const stageIdx = PRODUCTION_STAGES.indexOf(stage);
      if (stageIdx >= 0 && stageIdx < PRODUCTION_STAGES.length - 1) {
        const nextStage = PRODUCTION_STAGES[stageIdx + 1];
        await db.update(productionStagesTable)
          .set({ status: "in_progress" })
          .where(and(eq(productionStagesTable.orderId, orderId), eq(productionStagesTable.stage, nextStage)));
      }
    }

    const stages = await db.select().from(productionStagesTable).where(eq(productionStagesTable.orderId, orderId));
    res.json({ stages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/orders/export (before /orders/:id to avoid conflict)
router.get("/orders-export", requireAdmin, async (req, res) => {
  try {
    const orders = await db.select({ order: ordersTable, customer: customersTable })
      .from(ordersTable)
      .leftJoin(customersTable, eq(ordersTable.customerId, customersTable.id))
      .orderBy(desc(ordersTable.createdAt))
      .limit(500);

    const rows = orders.map(({ order, customer }) => ({
      "Order Number": order.orderNumber,
      "Customer": customer?.name || "N/A",
      "WhatsApp": customer?.whatsapp || "N/A",
      "Country": customer?.country || "N/A",
      "Total PKR": order.totalPkr,
      "Advance Paid": order.advancePaidPkr,
      "Balance Due": order.balanceDuePkr,
      "Payment Status": order.paymentStatus,
      "Order Status": order.status,
      "Created": order.createdAt?.toISOString()?.split("T")[0],
      "Est. Delivery": order.estimatedDelivery || "N/A",
    }));

    // Return as CSV
    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(","),
      ...rows.map(row => headers.map(h => `"${(row as any)[h] ?? ""}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="signitive-orders-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
