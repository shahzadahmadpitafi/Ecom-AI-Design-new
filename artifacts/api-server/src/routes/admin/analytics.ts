import { Router } from "express";
import { db, ordersTable, customersTable, orderItemsTable } from "@workspace/db";
import { gte, desc, sql, eq, and } from "drizzle-orm";
import { requireAdmin } from "./auth";

const router = Router();

// GET /api/admin/analytics/dashboard
router.get("/analytics/dashboard", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yesterday = new Date(todayStart); yesterday.setDate(yesterday.getDate() - 1);

    // All orders
    const allOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);
    const yesterdayOrders = allOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= yesterday && d < todayStart;
    });
    const monthOrders = allOrders.filter(o => new Date(o.createdAt) >= monthStart);
    const pendingOrders = allOrders.filter(o => o.status === "pending" || o.status === "confirmed");
    const inProductionOrders = allOrders.filter(o => ["sampling","in_production","quality_check"].includes(o.status));

    const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.totalPkr || 0), 0);

    // Recent 10 orders with customers
    const recentOrders = await db.select({ order: ordersTable, customer: customersTable })
      .from(ordersTable)
      .leftJoin(customersTable, eq(ordersTable.customerId, customersTable.id))
      .orderBy(desc(ordersTable.createdAt))
      .limit(10);

    // Last 30 days revenue chart
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAllOrders = allOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
    
    const chartData: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      chartData[key] = { date: key, revenue: 0, orders: 0 };
    }
    recentAllOrders.forEach(o => {
      const key = new Date(o.createdAt).toISOString().split("T")[0];
      if (chartData[key]) {
        chartData[key].revenue += o.totalPkr || 0;
        chartData[key].orders += 1;
      }
    });

    // Total customers
    const allCustomers = await db.select().from(customersTable);

    res.json({
      stats: {
        todayOrders: todayOrders.length,
        yesterdayOrders: yesterdayOrders.length,
        monthRevenuePkr: monthRevenue,
        pendingOrders: pendingOrders.length,
        inProductionOrders: inProductionOrders.length,
        totalCustomers: allCustomers.length,
        totalOrders: allOrders.length,
      },
      recentOrders,
      chartData: Object.values(chartData),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/analytics/full
router.get("/analytics/full", requireAdmin, async (req, res) => {
  try {
    const allOrders = await db.select().from(ordersTable);
    const allCustomers = await db.select().from(customersTable);
    const allItems = await db.select().from(orderItemsTable);

    // Revenue by category
    const categoryRevenue: Record<string, number> = {};
    allItems.forEach(item => {
      const cat = item.category || "Other";
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.totalPricePkr || 0);
    });

    // Orders by status
    const ordersByStatus: Record<string, number> = {};
    allOrders.forEach(o => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });

    // Top customers
    const topCustomers = allCustomers
      .sort((a, b) => (b.totalSpentPkr || 0) - (a.totalSpentPkr || 0))
      .slice(0, 10);

    // Customers by country
    const byCountry: Record<string, number> = {};
    allCustomers.forEach(c => {
      const country = c.country || "Unknown";
      byCountry[country] = (byCountry[country] || 0) + 1;
    });

    // Monthly revenue (last 6 months)
    const monthlyRevenue: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[key] = 0;
    }
    allOrders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyRevenue[key] !== undefined) monthlyRevenue[key] += o.totalPkr || 0;
    });

    res.json({
      categoryRevenue: Object.entries(categoryRevenue).map(([name, value]) => ({ name, value })),
      ordersByStatus: Object.entries(ordersByStatus).map(([name, value]) => ({ name, value })),
      topCustomers,
      customersByCountry: Object.entries(byCountry).map(([name, count]) => ({ name, count })),
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
