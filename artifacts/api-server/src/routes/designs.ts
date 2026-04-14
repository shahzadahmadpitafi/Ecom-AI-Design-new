import { Router, type IRouter } from "express";
import { db, designsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateDesignBody,
  GetDesignParams,
  GetDesignResponse,
  ListDesignsResponse,
  DeleteDesignParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeDates<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v instanceof Date ? v.toISOString() : v;
  }
  return out as T;
}

router.get("/designs", async (_req, res): Promise<void> => {
  const designs = await db
    .select()
    .from(designsTable)
    .orderBy(designsTable.createdAt);
  res.json(ListDesignsResponse.parse(designs.map(serializeDates)));
});

router.post("/designs", async (req, res): Promise<void> => {
  const parsed = CreateDesignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [design] = await db
    .insert(designsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(GetDesignResponse.parse(serializeDates(design)));
});

router.get("/designs/:id", async (req, res): Promise<void> => {
  const params = GetDesignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [design] = await db
    .select()
    .from(designsTable)
    .where(eq(designsTable.id, params.data.id));

  if (!design) {
    res.status(404).json({ error: "Design not found" });
    return;
  }

  res.json(GetDesignResponse.parse(serializeDates(design)));
});

router.delete("/designs/:id", async (req, res): Promise<void> => {
  const params = DeleteDesignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(designsTable)
    .where(eq(designsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Design not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
