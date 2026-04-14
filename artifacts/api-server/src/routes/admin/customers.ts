import { Router } from "express";
import { db, customersTable, ordersTable } from "@workspace/db";
import { eq, desc, ilike, or } from "drizzle-orm";
import { requireAdmin } from "./auth";

const router = Router();

// GET /api/admin/customers
router.get("/customers", requireAdmin, async (req, res) => {
  try {
    const { search, type } = req.query as any;
    let customers = await db.select().from(customersTable).orderBy(desc(customersTable.createdAt));
    
    if (search) {
      const s = search.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(s) ||
        c.whatsapp?.includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.country?.toLowerCase().includes(s)
      );
    }
    if (type && type !== "all") {
      customers = customers.filter(c => c.customerType === type);
    }
    res.json({ customers });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/customers
router.post("/customers", requireAdmin, async (req, res) => {
  try {
    const { name, email, whatsapp, country, city, address, companyName, customerType, notes } = req.body;
    const [customer] = await db.insert(customersTable).values({
      name: name.trim(),
      email: email?.toLowerCase().trim() || null,
      whatsapp: whatsapp?.trim() || null,
      country, city, address,
      companyName,
      customerType: customerType || "retail",
      notes,
    }).returning();
    res.json({ customer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/customers/:id
router.get("/customers/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.customerId, id))
      .orderBy(desc(ordersTable.createdAt));

    res.json({ customer, orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/customers/:id
router.put("/customers/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;
    delete updates.id; delete updates.createdAt;
    const [updated] = await db.update(customersTable).set(updates).where(eq(customersTable.id, id)).returning();
    res.json({ customer: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
