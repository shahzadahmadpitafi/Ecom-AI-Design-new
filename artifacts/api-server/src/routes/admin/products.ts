import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";

const router = Router();

// GET /admin/products — list all with optional search
router.get("/products", async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    let rows;
    if (search && search.trim()) {
      rows = await db.select().from(productsTable).where(
        or(
          ilike(productsTable.name, `%${search}%`),
          ilike(productsTable.category, `%${search}%`),
          ilike(productsTable.subcategory, `%${search}%`)
        )
      );
    } else {
      rows = await db.select().from(productsTable);
    }
    res.json({ products: rows, total: rows.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(productsTable).where(eq(productsTable.id, parseInt(req.params.id)));
    if (!row) return res.status(404).json({ error: "Product not found" });
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/products — create
router.post("/products", async (req, res) => {
  try {
    const {
      name, category, subcategory, description,
      basePricePkr, availableColors, availableSizes, availableFabrics,
      availableGsm, minOrderQty, isCustomizable, imageUrl, featured,
    } = req.body;

    if (!name || !category || !basePricePkr) {
      return res.status(400).json({ error: "name, category, and basePricePkr are required" });
    }

    const [inserted] = await db.insert(productsTable).values({
      name,
      category,
      subcategory: subcategory || null,
      description: description || null,
      basePricePkr: parseFloat(basePricePkr),
      basePrice: Math.round((parseFloat(basePricePkr) / 280) * 100) / 100,
      availableColors: availableColors || [],
      availableSizes: availableSizes || [],
      availableFabrics: availableFabrics || [],
      availableGsm: availableGsm || [],
      minOrderQty: parseInt(minOrderQty) || 25,
      isCustomizable: isCustomizable ?? true,
      imageUrl: imageUrl || null,
      featured: featured ?? false,
    }).returning();

    res.status(201).json(inserted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /admin/products/:id — update
router.put("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      name, category, subcategory, description,
      basePricePkr, availableColors, availableSizes, availableFabrics,
      availableGsm, minOrderQty, isCustomizable, imageUrl, featured,
    } = req.body;

    const [updated] = await db.update(productsTable).set({
      name,
      category,
      subcategory: subcategory || null,
      description: description || null,
      basePricePkr: parseFloat(basePricePkr),
      basePrice: Math.round((parseFloat(basePricePkr) / 280) * 100) / 100,
      availableColors: availableColors || [],
      availableSizes: availableSizes || [],
      availableFabrics: availableFabrics || [],
      availableGsm: availableGsm || [],
      minOrderQty: parseInt(minOrderQty) || 25,
      isCustomizable: isCustomizable ?? true,
      imageUrl: imageUrl || null,
      featured: featured ?? false,
    }).where(eq(productsTable.id, id)).returning();

    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/products/:id
router.delete("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
