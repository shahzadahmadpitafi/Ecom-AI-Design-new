import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { adminGet, adminPost, formatPKR, formatDate, StatusBadge } from "@/lib/admin-api";
import { RefreshCw, CreditCard, TrendingDown, AlertCircle } from "lucide-react";

export default function AdminPayments() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const d = await adminGet("/analytics/dashboard");
      const ordersData = await adminGet("/orders?limit=200");
      setData({ stats: d.stats, orders: ordersData.orders || [] });
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const orders = data?.orders || [];
  const stats  = data?.stats || {};

  const unpaidOrders = orders.filter(({ order }: any) => order.paymentStatus === "unpaid" && order.status !== "cancelled");
  const partialOrders = orders.filter(({ order }: any) => order.paymentStatus === "partial");
  const paidOrders = orders.filter(({ order }: any) => order.paymentStatus === "paid");
  const totalDue = unpaidOrders.reduce((s: number, { order }: any) => s + (order.balanceDuePkr || 0), 0)
    + partialOrders.reduce((s: number, { order }: any) => s + (order.balanceDuePkr || 0), 0);
  const totalCollected = paidOrders.reduce((s: number, { order }: any) => s + (order.totalPkr || 0), 0);

  return (
    <AdminLayout title="Payments">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:"This Month Revenue",  value:formatPKR(stats.monthRevenuePkr), icon:CreditCard,   color:"#C9A84C" },
            { label:"Total Collected",     value:formatPKR(totalCollected),         icon:CreditCard,   color:"#4ade80" },
            { label:"Pending Balance Due", value:formatPKR(totalDue),              icon:TrendingDown, color:"#f87171" },
            { label:"Unpaid Orders",       value:String(unpaidOrders.length),       icon:AlertCircle,  color:"#fbbf24" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-4" style={{ background:"#111", border:`1px solid rgba(167,139,250,0.1)`, borderTop:`2px solid ${color}` }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] uppercase tracking-widest text-[#555]">{label}</span>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <p className="font-display text-2xl tracking-wider" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Pending Payments */}
        {(unpaidOrders.length > 0 || partialOrders.length > 0) && (
          <div style={{ background:"#111", border:"1px solid rgba(239,68,68,0.2)" }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom:"1px solid rgba(239,68,68,0.1)", background:"rgba(239,68,68,0.04)" }}>
              <AlertCircle className="h-4 w-4 text-red-400" />
              <h3 className="font-display text-sm tracking-widest uppercase text-red-400">Pending Payments ({unpaidOrders.length + partialOrders.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(167,139,250,0.08)" }}>
                    {["Order #","Customer","Total PKR","Advance Paid","Balance Due","Status","Days Old"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-[#444]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...unpaidOrders, ...partialOrders].map(({ order, customer }: any) => {
                    const psb = StatusBadge({ status: order.paymentStatus, type: "payment" });
                    const days = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000*60*60*24));
                    return (
                      <tr key={order.id} style={{ borderBottom:"1px solid rgba(167,139,250,0.05)" }}
                        onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(167,139,250,0.02)"}
                        onMouseLeave={e => (e.currentTarget as any).style.background = ""}>
                        <td className="px-4 py-3 text-xs font-bold" style={{ color:"#C9A84C" }}>{order.orderNumber}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-white">{customer?.name || "Guest"}</p>
                          {customer?.whatsapp && (
                            <a href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(`Payment reminder for order ${order.orderNumber}: Balance PKR ${Math.round(order.balanceDuePkr).toLocaleString()} is due.`)}`}
                              target="_blank" rel="noopener noreferrer" className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color:"#25d366" }}>
                              📱 Send Reminder
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold" style={{ color:"#C9A84C" }}>{formatPKR(order.totalPkr)}</td>
                        <td className="px-4 py-3 text-xs text-[#4ade80]">{formatPKR(order.advancePaidPkr)}</td>
                        <td className="px-4 py-3 text-xs font-bold text-red-400">{formatPKR(order.balanceDuePkr)}</td>
                        <td className="px-4 py-3"><span style={psb.style}>{psb.label}</span></td>
                        <td className="px-4 py-3 text-xs" style={{ color: days > 7 ? "#f87171" : "#888" }}>{days}d</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Orders Payments */}
        <div style={{ background:"#111", border:"1px solid rgba(167,139,250,0.1)" }}>
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom:"1px solid rgba(167,139,250,0.08)" }}>
            <h3 className="font-display text-sm tracking-widest uppercase" style={{ color:"#C9A84C" }}>All Orders — Payment Status</h3>
            <button onClick={load} className="text-[#555] hover:text-white transition-colors"><RefreshCw className="h-3.5 w-3.5" /></button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(167,139,250,0.08)" }}>
                    {["Order #","Customer","Total","Advance","Balance","Payment Status","Order Status","Date"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] uppercase tracking-widest text-[#444]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0,50).map(({ order, customer }: any) => {
                    const psb = StatusBadge({ status: order.paymentStatus, type: "payment" });
                    const osb = StatusBadge({ status: order.status });
                    return (
                      <tr key={order.id} style={{ borderBottom:"1px solid rgba(167,139,250,0.04)" }}
                        onMouseEnter={e => (e.currentTarget as any).style.background = "rgba(167,139,250,0.02)"}
                        onMouseLeave={e => (e.currentTarget as any).style.background = ""}>
                        <td className="px-4 py-2.5 text-[11px] font-bold" style={{ color:"#C9A84C" }}>{order.orderNumber}</td>
                        <td className="px-4 py-2.5 text-xs text-white">{customer?.name || "Guest"}</td>
                        <td className="px-4 py-2.5 text-xs font-bold" style={{ color:"#C9A84C" }}>{formatPKR(order.totalPkr)}</td>
                        <td className="px-4 py-2.5 text-xs text-[#4ade80]">{formatPKR(order.advancePaidPkr)}</td>
                        <td className="px-4 py-2.5 text-xs" style={{ color: order.balanceDuePkr > 0 ? "#f87171" : "#4ade80" }}>{formatPKR(order.balanceDuePkr)}</td>
                        <td className="px-4 py-2.5"><span style={psb.style}>{psb.label}</span></td>
                        <td className="px-4 py-2.5"><span style={osb.style}>{osb.label}</span></td>
                        <td className="px-4 py-2.5 text-[10px] text-[#555]">{formatDate(order.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
