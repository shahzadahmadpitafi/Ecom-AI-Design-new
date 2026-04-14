import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "./auth";

const router = Router();

// GET /api/admin/notifications
router.get("/notifications", requireAdmin, async (req, res) => {
  try {
    const notifications = await db.select().from(notificationsTable).orderBy(desc(notificationsTable.createdAt)).limit(50);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/notifications/:id/read
router.put("/notifications/:id/read", requireAdmin, async (req, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/notifications/read-all
router.post("/notifications/read-all", requireAdmin, async (req, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
