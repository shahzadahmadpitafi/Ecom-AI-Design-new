import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import AdminLayout from "./AdminLayout";
import { adminGet, formatPKR, formatDate, StatusBadge } from "@/lib/admin-api";
import { Package, Users, TrendingUp, Factory, Plus, ExternalLink } from "lucide-react";

const CARD_STYLES = [
  { borderColor: "#a78bfa", icon: Package,     label: "ORDERS TODAY",       key: "todayOrders",        sub: (d: any) => `${d.yesterdayOrders > 0 ? `+${d.todayOrders - d.yesterdayOrders}` : "0"} from yesterday` },
  { borderColor: "#C9A84C", icon: TrendingUp,  label: "REVENUE THIS MONTH", key: "monthRevenuePkr",    sub: (d: any) => `USD ${Math.round((d.monthRevenuePkr || 0) / 278).toLocaleString()} equivalent` },
  { borderColor: "#ef4444", icon: Package,     label: "PENDING ORDERS",     key: "pendingOrders",      sub: () => "Requires attention" },
  { borderColor: "#22d3ee", icon: Factory,     label: "IN PRODUCTION",      key: "inProductionOrders", sub: () => "Active this week" },
];

const STATUS_COLORS_MAP: Record<string, string> = {
  pending:"#fbbf24", confirmed:"#60a5fa", sampling:"#a78bfa", in_production:"#c4b5fd",
  quality_check:"#22d3ee", shipped:"#67e8f9", delivered:"#4ade80", cancelled:"#f87171",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [data, setData]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGet("/analytics/dashboard").then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const chartData = (data?.chartData || []).map((d: any) => ({
    ...d,
    date: d.date?.slice(5),
    revenue: Math.round(d.revenue / 1000),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="px-3 py-2" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.3)" }}>
        <p className="text-[10px] text-[#555] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-xs font-bold" style={{ color: p.color }}>
            {p.name === "revenue" ? `PKR ${p.value}k` : `${p.value} orders`}
          </p>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setLocation("/admin/orders")}
              className="flex items-center gap-1.5 h-9 px-4 text-xs font-bold uppercase tracking-wider transition-all"
              style={{ background: "#C9A84C", color: "#0a0a0a" }}>
              <Plus className="h-3.5 w-3.5" /> New Order
            </button>
            <button onClick={() => setLocation("/admin/customers")}
              className="flex items-center gap-1.5 h-9 px-4 text-xs font-bold uppercase tracking-wider border transition-all"
              style={{ border: "1px solid rgba(167,139,250,0.4)", color: "#a78bfa" }}>
              <Users className="h-3.5 w-3.5" /> New Customer
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CARD_STYLES.map(({ borderColor, icon: Icon, label, key, sub }) => (
              <div key={key} className="p-5"
                style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)", borderTop: `2px solid ${borderColor}` }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "#555" }}>{label}</span>
                  <Icon className="h-4 w-4" style={{ color: borderColor }} />
                </div>
                <p className="font-display text-3xl tracking-wider" style={{ color: borderColor }}>
                  {key === "monthRevenuePkr" ? formatPKR(stats[key]) : (stats[key] || 0)}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "#444" }}>{sub(stats)}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="p-5" style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
            <h2 className="font-display text-sm tracking-widest uppercase mb-4" style={{ color: "#C9A84C" }}>Revenue — Last 30 Days</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.08)" />
                  <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#555", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}k`} yAxisId="left" />
                  <YAxis orientation="right" tick={{ fill: "#555", fontSize: 10 }} tickLine={false} axisLine={false} yAxisId="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} dot={false} name="revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#a78bfa" strokeWidth={2} dot={false} name="orders" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-xs text-[#555]">No order data yet. Submit your first order!</p>
              </div>
            )}
            <div className="flex gap-6 mt-3">
              <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-[#C9A84C] inline-block" /><span className="text-[10px] text-[#555]">Revenue (PKR thousands)</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-[#a78bfa] inline-block" /><span className="text-[10px] text-[#555]">Orders Count</span></div>
            </div>
          </div>

          {/* Recent Orders */}
          <div style={{ background: "#111", border: "1px solid rgba(167,139,250,0.1)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
              <h2 className="font-display text-sm tracking-widest uppercase" style={{ color: "#C9A84C" }}>Recent Orders</h2>
              <button onClick={() => setLocation("/admin/orders")} className="flex items-center gap-1 text-[10px] text-[#a78bfa] uppercase tracking-widest">
                View All <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(167,139,250,0.08)" }}>
                    {["Order #","Customer","Total PKR","Status","Date",""].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest" style={{ color: "#444" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentOrders || []).map(({ order, customer }: any) => {
                    const sb = StatusBadge({ status: order.status });
                    return (
                      <tr key={order.id} style={{ borderBottom: "1px solid rgba(167,139,250,0.05)" }}
                        className="transition-colors" onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(167,139,250,0.03)"}
                        onMouseLeave={e => (e.currentTarget as any).style.background = ""}>
                        <td className="px-4 py-3">
                          <button onClick={() => setLocation(`/admin/orders/${order.id}`)} className="font-bold text-xs hover:underline" style={{ color: "#C9A84C" }}>
                            {order.orderNumber}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-white">{customer?.name || "Guest"}</p>
                          {customer?.whatsapp && <p className="text-[10px] text-[#555]">{customer.whatsapp}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold" style={{ color: "#C9A84C" }}>{formatPKR(order.totalPkr)}</td>
                        <td className="px-4 py-3"><span style={sb.style}>{sb.label}</span></td>
                        <td className="px-4 py-3 text-[10px] text-[#555]">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setLocation(`/admin/orders/${order.id}`)}
                            className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all"
                            style={{ border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!data?.recentOrders?.length && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#555]">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
