import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import AdminLayout from "./AdminLayout";
import { adminGet, formatPKR } from "@/lib/admin-api";

const CHART_COLORS = ["#C9A84C","#a78bfa","#22d3ee","#4ade80","#f87171","#fbbf24","#60a5fa","#ec4899","#14b8a6"];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2" style={{ background:"#111", border:"1px solid rgba(167,139,250,0.3)" }}>
      <p className="text-[10px] text-[#555] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-bold" style={{ color:p.color||"#C9A84C" }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000 ? formatPKR(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [data, setData]       = useState<any>(null);
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminGet("/analytics/full"), adminGet("/analytics/dashboard")])
      .then(([full, dash]) => { setData(full); setDashData(dash); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout title="Analytics">
      <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" /></div>
    </AdminLayout>
  );

  const chartData30 = (dashData?.chartData || []).map((d: any) => ({ ...d, date: d.date?.slice(5), revenue: Math.round(d.revenue/1000) }));
  const categoryRevenue = data?.categoryRevenue || [];
  const ordersByStatus  = data?.ordersByStatus  || [];
  const monthlyRevenue  = (data?.monthlyRevenue || []).map((r: any) => ({ ...r, revenue: Math.round(r.revenue/1000) }));
  const topCustomers    = data?.topCustomers    || [];
  const byCountry       = data?.customersByCountry || [];
  const stats           = dashData?.stats || {};

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="p-5" style={{ background:"#111", border:"1px solid rgba(167,139,250,0.1)" }}>
      <h3 className="font-display text-sm tracking-widest uppercase mb-4" style={{ color:"#C9A84C" }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Summary Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:"Total Orders",    value: stats.totalOrders || 0,           color:"#a78bfa" },
            { label:"Total Customers", value: stats.totalCustomers || 0,         color:"#C9A84C" },
            { label:"Pending Action",  value: stats.pendingOrders || 0,          color:"#f87171" },
            { label:"In Production",   value: stats.inProductionOrders || 0,     color:"#22d3ee" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-4" style={{ background:"#111", border:`1px solid rgba(167,139,250,0.1)`, borderTop:`2px solid ${color}` }}>
              <p className="text-[9px] uppercase tracking-widest text-[#555] mb-1">{label}</p>
              <p className="font-display text-3xl tracking-wider" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Revenue Charts */}
        <div className="grid lg:grid-cols-2 gap-5">
          <ChartCard title="Daily Revenue — Last 30 Days (PKR thousands)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData30}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.08)" />
                <XAxis dataKey="date" tick={{ fill:"#555", fontSize:9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill:"#555", fontSize:9 }} tickLine={false} axisLine={false} tickFormatter={v=>`${v}k`} />
                <Tooltip content={<DarkTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} dot={false} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly Revenue — Last 6 Months (PKR thousands)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.08)" />
                <XAxis dataKey="month" tick={{ fill:"#555", fontSize:9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill:"#555", fontSize:9 }} tickLine={false} axisLine={false} tickFormatter={v=>`${v}k`} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="revenue" fill="#C9A84C" name="Revenue" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Category + Status Charts */}
        <div className="grid lg:grid-cols-2 gap-5">
          <ChartCard title="Revenue by Product Category">
            {categoryRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.08)" horizontal={false} />
                  <XAxis type="number" tick={{ fill:"#555", fontSize:9 }} tickLine={false} axisLine={false} tickFormatter={v=>formatPKR(v)} />
                  <YAxis type="category" dataKey="name" tick={{ fill:"#888", fontSize:9 }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="value" fill="#a78bfa" name="Revenue" radius={[0,2,2,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-[#555] py-8 text-center">No order data yet</p>}
          </ChartCard>

          <ChartCard title="Orders by Status">
            {ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false}>
                    {ordersByStatus.map((_: any, i: number) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend formatter={(value: string) => <span style={{ color:"#888", fontSize:10 }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-[#555] py-8 text-center">No order data yet</p>}
          </ChartCard>
        </div>

        {/* Top Customers + Country Distribution */}
        <div className="grid lg:grid-cols-2 gap-5">
          <ChartCard title="Top 10 Customers by Spend">
            {topCustomers.length > 0 ? (
              <div className="space-y-2">
                {topCustomers.slice(0,10).map((c: any, i: number) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold w-5 text-[#555]">#{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{c.name}</p>
                      <p className="text-[9px] text-[#555]">{c.country} • {c.totalOrders} orders</p>
                    </div>
                    <span className="text-xs font-bold flex-shrink-0" style={{ color:"#C9A84C" }}>
                      {formatPKR(c.totalSpentPkr)}
                    </span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-[#555] py-8 text-center">No customer data yet</p>}
          </ChartCard>

          <ChartCard title="Customers by Country">
            {byCountry.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byCountry.slice(0,10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,168,76,0.08)" />
                  <XAxis dataKey="name" tick={{ fill:"#555", fontSize:9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill:"#555", fontSize:9 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="count" fill="#22d3ee" name="Customers" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-[#555] py-8 text-center">No customer data yet</p>}
          </ChartCard>
        </div>
      </div>
    </AdminLayout>
  );
}
