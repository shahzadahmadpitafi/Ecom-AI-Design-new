import { Router, type IRouter } from "express";
import { db, quoteRequestsTable } from "@workspace/db";
import {
  CreateQuoteRequestBody,
  CalculateQuoteBody,
  CalculateQuoteResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getDiscountTier(totalUnits: number): { percent: number; tier: string; nextTierUnits: number | null; nextTierDiscount: number | null } {
  if (totalUnits >= 200) {
    return { percent: 25, tier: "200+ units", nextTierUnits: null, nextTierDiscount: null };
  } else if (totalUnits >= 100) {
    return { percent: 20, tier: "100-199 units", nextTierUnits: 200, nextTierDiscount: 25 };
  } else if (totalUnits >= 50) {
    return { percent: 10, tier: "50-99 units", nextTierUnits: 100, nextTierDiscount: 20 };
  } else {
    return { percent: 0, tier: "1-49 units", nextTierUnits: 50, nextTierDiscount: 10 };
  }
}

function getProductionDays(totalUnits: number): number {
  if (totalUnits >= 500) return 21;
  if (totalUnits >= 200) return 14;
  if (totalUnits >= 100) return 10;
  if (totalUnits >= 50) return 7;
  return 5;
}

router.post("/quotes/calculate", async (req, res): Promise<void> => {
  const parsed = CalculateQuoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { items } = parsed.data;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const { percent, tier, nextTierUnits, nextTierDiscount } = getDiscountTier(totalUnits);

  const calculatedItems = items.map((item) => {
    const unitPricePkr = item.basePricePkr * (1 - percent / 100);
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPricePkr: Math.round(unitPricePkr * 100) / 100,
      subtotalPkr: Math.round(unitPricePkr * item.quantity * 100) / 100,
    };
  });

  const subtotalPkr = items.reduce((sum, item) => sum + item.basePricePkr * item.quantity, 0);
  const discountAmountPkr = subtotalPkr * (percent / 100);
  const totalPkr = subtotalPkr - discountAmountPkr;

  const result = {
    items: calculatedItems,
    totalUnits,
    subtotalPkr: Math.round(subtotalPkr * 100) / 100,
    discountPercent: percent,
    discountAmountPkr: Math.round(discountAmountPkr * 100) / 100,
    totalPkr: Math.round(totalPkr * 100) / 100,
    discountTier: tier,
    nextTierUnits,
    nextTierDiscount,
    productionDays: getProductionDays(totalUnits),
    requiresCustomPricing: totalUnits >= 200,
  };

  res.json(CalculateQuoteResponse.parse(result));
});

router.post("/quotes", async (req, res): Promise<void> => {
  const parsed = CreateQuoteRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [quote] = await db
    .insert(quoteRequestsTable)
    .values({
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone ?? null,
      items: parsed.data.items,
      totalUnits: parsed.data.totalUnits,
      estimatedTotal: parsed.data.estimatedTotal,
      notes: parsed.data.notes ?? null,
      status: "pending",
    })
    .returning();

  res.status(201).json(quote);
});

export default router;
