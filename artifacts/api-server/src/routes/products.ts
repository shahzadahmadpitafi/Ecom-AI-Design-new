import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, and, ilike } from "drizzle-orm";
import {
  ListProductsQueryParams,
  GetProductParams,
  GetProductResponse,
  ListProductsResponse,
  GetFeaturedProductsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeDates<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v instanceof Date ? v.toISOString() : v;
  }
  return out as T;
}

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, subcategory, limit = 50, offset = 0 } = parsed.data;

  let query = db.select().from(productsTable).$dynamic();

  const conditions = [];
  if (category) conditions.push(ilike(productsTable.category, category));
  if (subcategory) conditions.push(ilike(productsTable.subcategory, subcategory));
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const products = await query.limit(limit).offset(offset);
  res.json(ListProductsResponse.parse(products.map(serializeDates)));
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.featured, true))
    .limit(8);
  res.json(GetFeaturedProductsResponse.parse(products.map(serializeDates)));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse(serializeDates(product)));
});

export default router;
