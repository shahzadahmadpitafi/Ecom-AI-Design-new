import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "./auth";

const router = Router();

const DEFAULTS: Record<string, string> = {
  store_name:       "Signitive Enterprises",
  store_tagline:    "World-Class Garments from Sialkot, Pakistan",
  store_email:      "info@signitive.com",
  store_phone:      "+92 52 1234567",
  store_address:    "Sialkot, Punjab, Pakistan",
  whatsapp_number:  "+923001234567",
  usd_to_pkr_rate:  "278",
  min_order_qty:    "25",
};

// GET /api/admin/settings
router.get("/settings", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(settingsTable);
    const map: Record<string, string> = { ...DEFAULTS };
    rows.forEach(r => { map[r.key] = r.value; });
    res.json({ settings: map });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/settings — upsert multiple keys
router.put("/settings", requireAdmin, async (req, res) => {
  try {
    const updates: Record<string, string> = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await db.insert(settingsTable)
        .values({ key, value: String(value) })
        .onConflictDoUpdate({ target: settingsTable.key, set: { value: String(value), updatedAt: new Date() } });
    }
    const rows = await db.select().from(settingsTable);
    const map: Record<string, string> = { ...DEFAULTS };
    rows.forEach(r => { map[r.key] = r.value; });
    res.json({ settings: map });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
