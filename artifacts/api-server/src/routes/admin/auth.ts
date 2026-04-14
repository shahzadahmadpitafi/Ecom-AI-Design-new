import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// In-memory token store: token → { adminId, expires }
export const activeSessions = new Map<string, { adminId: number; email: string; name: string; role: string; expires: number }>();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function requireAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.slice(7);
  const session = activeSessions.get(token);
  if (!session || session.expires < Date.now()) {
    activeSessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }
  req.admin = session;
  req.adminToken = token;
  next();
}

// POST /api/admin/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  try {
    const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email.toLowerCase().trim()));
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = generateToken();
    activeSessions.set(token, {
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/auth/me
router.get("/auth/me", requireAdmin, (req: any, res) => {
  res.json({ admin: { ...req.admin, adminId: req.admin.adminId } });
});

// POST /api/admin/auth/logout
router.post("/auth/logout", requireAdmin, (req: any, res) => {
  activeSessions.delete(req.adminToken);
  res.json({ success: true });
});

// POST /api/admin/auth/setup — creates first admin user (only if no admins exist)
router.post("/auth/setup", async (req, res) => {
  const { name, email, password, setupSecret } = req.body;
  if (setupSecret !== "signitive-setup-2025") {
    return res.status(403).json({ error: "Invalid setup secret" });
  }
  try {
    const existing = await db.select().from(adminUsersTable).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Admin already exists. Use login." });
    }
    const passwordHash = await bcrypt.hash(password || "Admin@2025", 12);
    const [newAdmin] = await db.insert(adminUsersTable).values({
      name: name || "Signitive Admin",
      email: (email || "admin@signitive.com").toLowerCase(),
      passwordHash,
      role: "super_admin",
    }).returning();
    res.json({ success: true, admin: { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
