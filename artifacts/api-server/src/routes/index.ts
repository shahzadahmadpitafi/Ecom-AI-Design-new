import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import catalogRouter from "./catalog";
import designsRouter from "./designs";
import quotesRouter from "./quotes";
import seedRouter from "./seed";
import generateDesignRouter from "./generate-design";
import editDesignRouter from "./edit-design";
import checkGeminiRouter from "./check-gemini";
import imageProxyRouter from "./image-proxy";
import adminRouter from "./admin";
import { db, ordersTable, customersTable, productionStagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(catalogRouter);
router.use(designsRouter);
router.use(quotesRouter);
router.use(seedRouter);
router.use(generateDesignRouter);
router.use(editDesignRouter);
router.use(checkGeminiRouter);
router.use(imageProxyRouter);
router.use("/admin", adminRouter);

// Public order tracking
router.get("/track/:orderNumber", async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber.toUpperCase();
    const [row] = await db.select({ order: ordersTable, customer: customersTable })
      .from(ordersTable)
      .leftJoin(customersTable, eq(ordersTable.customerId, customersTable.id))
      .where(eq(ordersTable.orderNumber, orderNumber));

    if (!row) return res.status(404).json({ error: "Order not found" });

    // Validate by WhatsApp if provided
    const whatsapp = req.query.whatsapp as string;
    if (whatsapp && row.customer?.whatsapp && !row.customer.whatsapp.includes(whatsapp.replace(/[^0-9]/g, ""))) {
      return res.status(404).json({ error: "Order not found" });
    }

    const stages = await db.select().from(productionStagesTable).where(eq(productionStagesTable.orderId, row.order.id));
    res.json({ order: row.order, customer: { name: row.customer?.name, country: row.customer?.country }, stages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
