import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, count, min } from "drizzle-orm";
import {
  GetCatalogSummaryResponse,
  ListCategoriesResponse,
  GetFeaturedProductsResponse,
} from "@workspace/api-zod";

function serializeDates<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v instanceof Date ? v.toISOString() : v;
  }
  return out as T;
}

const router: IRouter = Router();

router.get("/catalog/summary", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({ count: count() })
    .from(productsTable);

  const categories = await db
    .selectDistinct({ category: productsTable.category })
    .from(productsTable);

  const [pricing] = await db
    .select({ minPrice: min(productsTable.basePricePkr) })
    .from(productsTable);

  const summary = {
    totalProducts: totals?.count ?? 0,
    totalCategories: categories.length,
    startingPricePkr: pricing?.minPrice ?? 0,
    countriesServed: 35,
  };

  res.json(GetCatalogSummaryResponse.parse(summary));
});

router.get("/catalog/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: productsTable.category,
      subcategory: productsTable.subcategory,
    })
    .from(productsTable);

  const categoryMap = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!categoryMap.has(row.category)) {
      categoryMap.set(row.category, new Set());
    }
    categoryMap.get(row.category)!.add(row.subcategory);
  }

  const result = Array.from(categoryMap.entries()).map(([category, subs]) => ({
    category,
    count: subs.size,
    subcategories: Array.from(subs),
  }));

  res.json(ListCategoriesResponse.parse(result));
});

router.get("/catalog/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.featured, true))
    .limit(8);
  res.json(GetFeaturedProductsResponse.parse(products.map(serializeDates)));
});

export default router;
